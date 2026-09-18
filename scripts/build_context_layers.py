#!/usr/bin/env python
"""
Bangun layer KONTEKS untuk web-dashboard BRINATHON Mahakam.

Layer yang dihasilkan BUKAN bagian dari paket beku STEP54 dan TIDAK dipakai
untuk skoring, klasifikasi, atau reklasifikasi apa pun. Fungsinya semata
referensi visual (orientasi peta): batas DAS, jaringan sungai, dan batas
kabupaten/kota.

Sumber (read-only, tidak dimodifikasi):
  D08  data/02_interim/mahakam/D08/D08_DAS_Mahakam_standardized_LAEA.gpkg
  D09  data/02_interim/mahakam/D09/D09_admin_standardized.gpkg
  D10  data/02_interim/mahakam/D10/D10_hydrography_standardized.gpkg

Output: web-dashboard/public/data/context/
  basin.geojson              batas DAS Mahakam (1 poligon)
  admin_kabupaten.geojson    batas kabupaten/kota (yang beririsan DAS)
  rivers_major.geojson       sungai primer + sekunder (selalu dimuat)
  rivers_minor.geojson       sungai tersier (dimuat malas / lazy)
  context_manifest.json      provenance, hash, pernyataan peran, atribusi

Jalankan:
  python scripts/build_context_layers.py
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

try:
    import geopandas as gpd
    import shapely
    from shapely.geometry import mapping
    from shapely.ops import polylabel
except ImportError:  # pragma: no cover
    sys.exit(
        "Butuh geopandas + shapely. Pasang dengan:\n"
        "  pip install geopandas shapely pyogrio"
    )

# --------------------------------------------------------------------------
# Konfigurasi
# --------------------------------------------------------------------------

HERE = Path(__file__).resolve()
WEB_ROOT = HERE.parents[1]           # web-dashboard/
REPO_ROOT = HERE.parents[2]          # root proyek
INTERIM = REPO_ROOT / "data" / "02_interim" / "mahakam"
OUT_DIR = WEB_ROOT / "public" / "data" / "context"

TARGET_CRS = "EPSG:4326"

# Toleransi simplifikasi dalam derajat (1 derajat ~ 111 km).
# Sumber D10 berskala 1:250.000 (~100 m), jadi 0,003 derajat (~330 m)
# tidak menghilangkan detail yang sudah tidak ada di sumbernya.
TOL_BASIN = 0.002
TOL_ADMIN = 0.004
TOL_RIVER_MAJOR = 0.002
TOL_RIVER_MINOR = 0.003

# Pembulatan koordinat (desimal). 5 desimal ~ 1,1 m — jauh di bawah
# presisi sumber, tapi memangkas besar berkas secara signifikan.
DECIMALS = 5

# LCODE RBI 1:250.000 pada layer 798 sebagai proksi hierarki sungai.
# Diverifikasi dari data: 60108 = 7 segmen terpanjang (Sungai Mahakam
# 1.584 km), 60110 = 1.130 segmen, 60112 = 4.230 segmen terpendek.
RIVER_CLASS = {"60108": "primary", "60110": "secondary", "60112": "tertiary"}
RIVER_CLASS_RANK = {"primary": 1, "secondary": 2, "tertiary": 3}

SOURCES = {
    "D08": {
        "dataset_id": "D08",
        "dataset_name": "Batas DAS Mahakam",
        "producer": "Badan Informasi Geospasial (BIG)",
        "product": "Atlas Wilayah Sungai - SUMBERDAYAAIR_DAERAHALIRANSUNGAI (layer 14)",
        "source_url": "https://geoservices.big.go.id/gis/rest/services/PTRA/Atlas_Wilayah_Sungai/MapServer/14",
        "retrieval_date": "2026-08-28T08:52:39Z",
        "license_status": "PUBLICLY ACCESSIBLE; REDISTRIBUTION STATUS UNCLEAR",
        "attribution": "Sumber: BIG - Atlas Wilayah Sungai (Nama_DAS = 'DAS Mahakam')",
    },
    "D09": {
        "dataset_id": "D09",
        "dataset_name": "Batas administrasi kabupaten/kota",
        "producer": "Badan Informasi Geospasial (BIG)",
        "product": "BATASWILAYAH/BATAS_KABKOTA_AR MapServer/0 - edisi Juni 2026",
        "source_url": "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_KABKOTA_AR/MapServer/0",
        "retrieval_date": "2026-08-31",
        "license_status": "PUBLIC ACCESS; OPEN REDISTRIBUTION RIGHTS UNCLEAR",
        "attribution": "Sumber: BIG - Batas Wilayah Administrasi Kabupaten/Kota (edisi Juni 2026)",
    },
    "D10": {
        "dataset_id": "D10",
        "dataset_name": "Jaringan sungai (hidrografi)",
        "producer": "Badan Informasi Geospasial (BIG)",
        "product": "RBI Rupabumi Indonesia 1:250.000 - Sungai (Garis), layer 798",
        "source_url": "https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/798",
        "retrieval_date": "2026-09-01",
        "license_status": "PUBLICLY ACCESSIBLE; REDISTRIBUTION UNCLARED",
        "attribution": "Sumber: BIG - RBI 1:250.000 Sungai (Garis), layer 798",
    },
}


# --------------------------------------------------------------------------
# Utilitas
# --------------------------------------------------------------------------

def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def round_coords(obj):
    """Bulatkan koordinat secara rekursif dan paksa 2D (buang Z)."""
    if isinstance(obj, (list, tuple)):
        # Titik: [x, y, (z)]
        if len(obj) >= 2 and all(isinstance(v, (int, float)) for v in obj):
            return [round(float(obj[0]), DECIMALS), round(float(obj[1]), DECIMALS)]
        return [round_coords(v) for v in obj]
    return obj


def write_geojson(features: list[dict], path: Path) -> int:
    """Tulis FeatureCollection termampatkan. Kembalikan jumlah byte."""
    payload = {"type": "FeatureCollection", "features": features}
    text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    path.write_text(text, encoding="utf-8")
    return len(text.encode("utf-8"))


def geometry_to_2d(geom, tolerance: float, keep_topology: bool):
    if geom is None or geom.is_empty:
        return None
    geom = shapely.force_2d(geom)
    geom = geom.simplify(tolerance, preserve_topology=keep_topology)
    if geom.is_empty:
        return None
    return round_coords(mapping(geom))


def pick(record, candidates, default=None):
    for name in candidates:
        if name in record and record[name] not in (None, ""):
            value = record[name]
            # numpy scalar -> tipe Python
            if hasattr(value, "item"):
                value = value.item()
            return value
    return default


def load_gpkg(path: Path, layer: str):
    return gpd.read_file(path, layer=layer)


def label_point(geom, tolerance: float = 0.01) -> tuple[float, float] | None:
    """Titik label di dalam poligon (pole of inaccessibility).

    Dihitung pada geometri yang sudah disederhanakan agar cepat; ini hanya
    menentukan posisi label, bukan nilai analitis apa pun.
    """
    if geom is None or geom.is_empty:
        return None
    simplified = shapely.force_2d(geom).simplify(TOL_ADMIN, preserve_topology=True)
    if simplified.is_empty:
        simplified = shapely.force_2d(geom)
    try:
        if simplified.geom_type == "MultiPolygon":
            biggest = max(simplified.geoms, key=lambda g: g.area)
        else:
            biggest = simplified
        point = polylabel(biggest, tolerance=tolerance)
    except Exception:
        point = simplified.representative_point()
    return round(point.x, DECIMALS), round(point.y, DECIMALS)


def to_target_crs(gdf, label: str) -> "gpd.GeoDataFrame":
    if gdf.crs is None:
        print(f"  ! {label}: CRS tidak terbaca, diasumsikan {TARGET_CRS}")
        return gdf.set_crs(TARGET_CRS, allow_override=True)
    epsg = gdf.crs.to_epsg()
    if epsg == 4326:
        return gdf
    print(f"  · {label}: reproyeksi {gdf.crs.to_string()} -> {TARGET_CRS}")
    return gdf.to_crs(TARGET_CRS)


# --------------------------------------------------------------------------
# Pembangun layer
# --------------------------------------------------------------------------

def build_basin() -> list[dict]:
    src = INTERIM / "D08" / "D08_DAS_Mahakam_standardized_LAEA.gpkg"
    print(f"[basin] {src.name}")
    gdf = to_target_crs(load_gpkg(src, "d08_study_area"), "basin")

    features = []
    for _, row in gdf.iterrows():
        geom = geometry_to_2d(row.geometry, TOL_BASIN, keep_topology=True)
        if geom is None:
            continue
        features.append({
            "type": "Feature",
            "properties": {
                "name": pick(row, ["Nama_DAS", "nama_das"], "DAS Mahakam"),
                "role": "context_geometry_not_evidence",
            },
            "geometry": geom,
        })
    return features


def basin_geometry() -> object | None:
    """Geometri DAS Mahakam dalam EPSG:4326, untuk memotong layer admin."""
    src = INTERIM / "D08" / "D08_DAS_Mahakam_standardized_LAEA.gpkg"
    gdf = to_target_crs(load_gpkg(src, "d08_study_area"), "basin(clip)")
    if gdf.empty or gdf.geometry.iloc[0] is None:
        return None
    return shapely.force_2d(gdf.geometry.iloc[0])


def build_admin(clip_to: object | None = None) -> list[dict]:
    src = INTERIM / "D09" / "D09_admin_standardized.gpkg"
    print(f"[admin] {src.name}")
    gdf = to_target_crs(load_gpkg(src, "kabupaten_kota"), "admin")

    features = []
    for _, row in gdf.iterrows():
        if row.geometry is None:
            continue
        geom_2d = shapely.force_2d(row.geometry)

        # Layer D09 menyimpan poligon kabupaten UTUH, bukan potongan DAS.
        # Tanpa pemotongan, peta menampilkan wilayah di luar DAS (mis. Kapuas
        # Hulu di Kalimantan Barat) dan label bisa jatuh di luar cakupan.
        if clip_to is not None:
            geom_2d = geom_2d.intersection(clip_to)
            if geom_2d.is_empty:
                continue

        geom = geometry_to_2d(geom_2d, TOL_ADMIN, keep_topology=True)
        if geom is None:
            continue
        overlap = pick(row, ["mahakam_overlap_area_km2", "overlap_area_km2"])
        if overlap is not None:
            overlap = round(float(overlap), 1)
        point = label_point(geom_2d)
        features.append({
            "type": "Feature",
            "properties": {
                "name": pick(row, ["kabupaten_name", "name", "NAMOBJ"], "TIDAK DIKETAHUI"),
                "prov": pick(row, ["province_name", "provinsi_name"], None),
                "km2": overlap,
                "lx": point[0] if point else None,
                "ly": point[1] if point else None,
            },
            "geometry": geom,
        })
    # Urutkan agar tampilan label deterministik
    features.sort(key=lambda f: f["properties"]["name"])
    return features


def build_rivers() -> tuple[list[dict], list[dict]]:
    src = INTERIM / "D10" / "D10_hydrography_standardized.gpkg"
    print(f"[rivers] {src.name}")
    gdf = to_target_crs(load_gpkg(src, "hydrography_d08"), "rivers")

    major, minor = [], []
    unknown = 0
    for _, row in gdf.iterrows():
        lcode = str(pick(row, ["LCODE"], "")).strip()
        cls = RIVER_CLASS.get(lcode)
        if cls is None:
            unknown += 1
            cls = "tertiary"  # fallback konservatif: jangan lebay-kan hierarki
        tol = TOL_RIVER_MAJOR if cls in ("primary", "secondary") else TOL_RIVER_MINOR
        geom = geometry_to_2d(row.geometry, tol, keep_topology=False)
        if geom is None:
            continue
        length_m = pick(row, ["length_inside_d08_m"], None)
        feature = {
            "type": "Feature",
            "properties": {
                "name": pick(row, ["river_name_std"], None),
                "cls": cls,
                "km": round(float(length_m) / 1000.0, 2) if length_m else None,
            },
            "geometry": geom,
        }
        (major if cls in ("primary", "secondary") else minor).append(feature)

    if unknown:
        print(f"  ! {unknown} segmen tanpa LCODE dikenal -> diperlakukan sebagai tersier")

    # Segmen panjang lebih dulu supaya sungai utama tergambar di bawah
    major.sort(key=lambda f: -(f["properties"]["km"] or 0))
    minor.sort(key=lambda f: -(f["properties"]["km"] or 0))
    return major, minor


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Output -> {OUT_DIR}\n")

    outputs: dict[str, dict] = {}

    basin = build_basin()
    clip_to = basin_geometry()
    if clip_to is None:
        print("  ! geometri DAS tidak terbaca; layer admin TIDAK dipotong")
    admin = build_admin(clip_to)
    rivers_major, rivers_minor = build_rivers()

    plan = [
        ("basin.geojson", basin),
        ("admin_kabupaten.geojson", admin),
        ("rivers_major.geojson", rivers_major),
        ("rivers_minor.geojson", rivers_minor),
    ]

    print()
    total = 0
    for filename, features in plan:
        path = OUT_DIR / filename
        size = write_geojson(features, path)
        total += size
        outputs[filename] = {
            "features": len(features),
            "size_bytes": size,
            "sha256": sha256_of(path),
        }
        print(f"  {filename:<26} {len(features):>6} fitur  {size/1024:>9.1f} KB")

    print(f"\n  {'TOTAL':<26} {'':>6}          {total/1024:>9.1f} KB")

    manifest = {
        "manifest_id": "WEB_CONTEXT_LAYERS_V1",
        "generated_by": "web-dashboard/scripts/build_context_layers.py",
        "role": "CONTEXT_GEOMETRY_NOT_EVIDENCE",
        "role_statement": (
            "Layer ini adalah referensi visual untuk orientasi peta. Tidak satu pun "
            "dipakai sebagai fitur model, bukti skoring, atau dasar reklasifikasi "
            "level R0-R5. Paket beku STEP54 tetap menjadi batas aplikasi yang sah."
        ),
        "not_part_of": "STEP54_WEB_PRESENTATION_PACKAGE",
        "frozen_package_untouched": True,
        "admin_clipped_to_basin": True,
        "admin_clip_note": (
            "Layer D09 menyimpan poligon kabupaten utuh. Geometri dipotong ke batas "
            "DAS Mahakam agar peta tidak menampilkan wilayah di luar cakupan; "
            "atribut km2 tetap diambil apa adanya dari sumber."
        ),
        "target_crs": TARGET_CRS,
        "coordinate_decimals": DECIMALS,
        "simplification_tolerance_degrees": {
            "basin": TOL_BASIN,
            "admin_kabupaten": TOL_ADMIN,
            "rivers_major": TOL_RIVER_MAJOR,
            "rivers_minor": TOL_RIVER_MINOR,
        },
        "field_aliases": {
            "basin": {"name": "nama DAS"},
            "admin_kabupaten": {
                "name": "nama kabupaten/kota",
                "prov": "nama provinsi",
                "km2": "luas irisan dengan DAS Mahakam (km2)",
                "lx": "bujur titik label (pole of inaccessibility, di dalam poligon)",
                "ly": "lintang titik label",
            },
            "rivers_*": {
                "name": "nama sungai (null bila tidak dinamai di sumber)",
                "cls": "kelas hierarki: primary | secondary | tertiary",
                "km": "panjang segmen di dalam DAS (km)",
            },
        },
        "river_class_derivation": {
            "method": "LCODE RBI 1:250.000 layer 798",
            "mapping": RIVER_CLASS,
            "verified_evidence": (
                "60108 = 7 segmen, rata-rata 426 km, maksimum 1.584,91 km (Sungai Mahakam); "
                "60110 = 1.130 segmen, rata-rata 12,25 km; "
                "60112 = 4.230 segmen, rata-rata 2,07 km."
            ),
            "unavailable_attributes": (
                "river_type_std, river_order_std, WMAX, KLSSNG, NAMWS, STATUS seluruhnya "
                "bernilai UNKNOWN/null pada layer standardisasi, sehingga hierarki "
                "diturunkan dari LCODE, bukan dari atribut tersebut."
            ),
        },
        "sources": SOURCES,
        "restriction_note": (
            "Ketiga sumber berstatus publicly accessible dengan hak redistribusi yang "
            "belum eksplisit. Atribusi disertakan pada peta; hindari penggunaan komersial."
        ),
        "outputs": outputs,
    }
    manifest_path = OUT_DIR / "context_manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  context_manifest.json      {manifest_path.stat().st_size/1024:.1f} KB")

    print("\nSelesai.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

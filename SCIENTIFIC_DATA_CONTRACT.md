# STEP54 → application presentation contract

Source directory: `documentation/step54_web_delivery/` (read-only).
Destination: `web-dashboard/public/data/mahakam/`. Every copied file retains its original name and bytes. `COPY_MANIFEST.json` enumerates every exact source and destination. The GeoPackage is verified against the STEP54 manifest but not copied because browsers consume GeoJSON. No earlier scientific artifacts are consumed.

| Source artifact (STEP54 prefix)                     | Destination / purpose                                 | Fields consumed / component                                                               | Interpretation constraint                                   |
| --------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| MAHAKAM_WEB_RECOMMENDATION_TARGETS_EPSG4326.geojson | Same filename; first map load                         | All popup/filter properties; map, filters, detail, evidence, follow-up, chart             | Preserve all 1,696 records, coordinates and classifications |
| MAHAKAM_WEB_ALL_NODES_EPSG4326.geojson              | Same filename; lazy full layer                        | Same properties; all-node scope and search                                                | Preserve all 24,306 records; R0 is level 99                 |
| WEB_PRESENTATION_CONTRACT.json                      | Same filename + metadata.contract                     | legend, popup_fields, filter_fields, required_disclaimer, contract_name                   | Exact legend labels, interpretations and disclaimer         |
| FIELD_ALIASES.csv                                   | Same filename + metadata.aliases                      | field, alias; filters and selected detail                                                 | Alias is the primary label where supplied                   |
| CLAIM_BOUNDARY_MATRIX.csv                           | Same filename + metadata.claims                       | claim_id, claim, status, reason; limitations                                              | Unauthorized claims are labeled as such, never conclusions  |
| RECOMMENDATION_DISTRIBUTION_AUDIT.csv               | Same filename; preparation reconciles metadata.counts | recommendation_level, source_step53, web_step54, match; KPIs/chart                        | Counting existing frozen classes only                       |
| WEB_DELIVERY_GATE.json                              | Same filename + metadata.gate                         | status, frontend_dashboard_consumption_authorized, scientific_status, web_delivery_status | Fail closed unless PASS and explicitly authorized           |
| WEB_DELIVERY_QA.json                                | Same filename + metadata.qa                           | status, web_node_count, web_target_count, web_crs                                         | Counts reconcile before data is rendered                    |
| WEB_DELIVERY_MANIFEST_SHA256.csv                    | Same filename + metadata.manifest                     | file_name, size_bytes, sha256; integrity and advanced provenance                          | Verify before copying; do not change originals              |
| WEB_DELIVERY_PROVENANCE.json                        | Same filename; audit support                          | source step, presentation CRS; sanitized metadata summary                                 | Original source paths are not displayed in normal UI        |
| GEOMETRY_AUDIT.csv                                  | Same filename; audit support                          | No classification derived                                                                 | Geometry remains unchanged                                  |
| VERIFIED_STEP53_FREEZE_MANIFEST.csv                 | Same filename; audit support                          | No direct STEP53 file reads                                                               | STEP54 is the application boundary                          |
| ENVIRONMENT.json                                    | Same filename; audit support                          | No normal UI fields                                                                       | Frozen source environment, not app runtime                  |
| WEB_DELIVERY_REPORT.md                              | Same filename; documentation                          | Limitations and delivery context                                                          | No claims beyond approved package                           |

## Component / field mapping

| Component               | Frozen properties used                                                                                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Map / legend            | geometry, grid_id, recommendation_level; contract legend labels and interpretations                                                                                                                                                                          |
| Grid search             | grid_id                                                                                                                                                                                                                                                      |
| Filters                 | recommendation_level, screening_target, admin_district_name, admin_province_name, coordination_scope, high_susceptibility_primary, any_policy_overlap_primary, critical_cross_system_bridge, structural_bridge_candidate, administrative_hydrological_bridge |
| Selected grid           | grid_id, dashboard_recommendation_label, admin_district_name, admin_province_name, coordination_scope                                                                                                                                                        |
| Network evidence        | critical_cross_system_bridge, structural_bridge_candidate, administrative_hydrological_bridge                                                                                                                                                                |
| Susceptibility evidence | high_susceptibility_primary, susceptibility_percentile_01 (unmodified 0–1 percentile)                                                                                                                                                                        |
| Permit context          | any_policy_overlap_primary, max_policy_overlap_pct (supplied polygon-overlap percentage)                                                                                                                                                                     |
| Evidence summary        | recommendation_evidence (verbatim)                                                                                                                                                                                                                           |
| Technical follow-up     | recommended_action_bundle (verbatim; no inferred action flags)                                                                                                                                                                                               |
| KPI / distribution      | counts of existing recommendation_level and screening_target; reconciled with QA and distribution audit                                                                                                                                                      |
| Advanced properties     | All supplied properties, including recommendation_code, dashboard_scientific_status, dashboard_claim_scope                                                                                                                                                   |

`metadata.json` is application-generated presentation metadata: existing counts, legend, aliases, dropdown options, coordinate extent, claims, source hashes and gate/QA. It is not a new scientific product. Browser filtering does not change canonical properties. No weighted score, reclassification, geometry simplification, causal inference, IRC or Policy Contribution calculation is performed.

---

# Addendum: map context layers (STEP55)

Everything below is **outside** the STEP54 → application contract above and does not modify it. The frozen package in `public/data/mahakam/` keeps its original bytes; no simplification or reclassification is applied to it. The statement _"no geometry simplification"_ therefore continues to hold for every frozen artifact.

Purpose: the frozen package contains only 1 km grid polygons, so the map had no geographic reference (no coastline, river or administrative context). The context layers give the viewer orientation only.

| Layer file                | Features | Source                                                             | Role                          |
| ------------------------- | -------- | ------------------------------------------------------------------ | ----------------------------- |
| `basin.geojson`           | 1        | D08 BIG Atlas Wilayah Sungai (`Nama_DAS = 'DAS Mahakam'`)          | Boundary outline              |
| `admin_kabupaten.geojson` | 12       | D09 BIG Batas Wilayah Administrasi kabupaten/kota, edisi Juni 2026 | Boundary outline + labels     |
| `rivers_major.geojson`    | 1,137    | D10 BIG RBI 1:250.000 Sungai (Garis), layer 798                    | Primary/secondary rivers      |
| `rivers_minor.geojson`    | 4,230    | D10 same source                                                    | Tertiary rivers (lazy loaded) |

## Binding constraints

1. **Role is `CONTEXT_GEOMETRY_NOT_EVIDENCE`.** No context layer participates in scoring, reclassification, filtering, KPI, or recommendation level. Toggling these layers cannot change any displayed classification.
2. **Provenance is recorded, not implied.** `public/data/context/context_manifest.json` holds the source path, source SHA-256, original CRS, simplification tolerance, coordinate precision, per-file SHA-256 and attribution. This manifest is machine-readable and supersedes this table if they disagree.
3. **Transformations are declared.** D08 and D10 are delivered in LAEA and are reprojected to EPSG:4326. All context geometry is forced to 2D (source carries Z) and simplified (basin 0.002°, admin 0.004°, major rivers 0.002°, minor rivers 0.003°) with coordinates rounded to 5 decimals. None of this touches frozen geometry.
4. **Admin polygons are clipped to the DAS.** D09 stores entire kabupaten polygons; unclipped, the map would render territory far outside the basin (for example Kapuas Hulu in West Kalimantan). Only the portion intersecting the DAS Mahakam polygon is drawn. The `km2` attribute is carried through from the source unchanged.
5. **River hierarchy is derived and documented.** `river_type_std`, `river_order_std`, `WMAX`, `KLSSNG`, `NAMWS` and `STATUS` are entirely `UNKNOWN`/null in the standardized layer, so hierarchy is derived from `LCODE` instead: `60108` = primary (7 segments, mean 426 km, max 1,584.91 km — Sungai Mahakam), `60110` = secondary (1,130), `60112` = tertiary (4,230). This is a cartographic styling choice, not an analytical variable.
6. **Redistribution status is unresolved.** All three sources are publicly accessible with unclear redistribution rights. Attribution is rendered on the map credit line. Public deployment re-publishes simplified derivatives of BIG geometries, so avoid commercial use and keep attribution visible.
7. **Degradation is safe.** If any context file is missing or fails to load, the map still renders the frozen grid. Failures surface as a status note inside the layer panel and never block the scientific layers.

Regenerate with `python scripts/build_context_layers.py` from `web-dashboard/`. It is deliberately not part of the Vercel build: the output is committed so the deployed package stays byte-stable.

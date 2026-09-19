'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type DataSource = {
  name: string;
  producer: string;
  url: string;
};

type ProcessStep = {
  label: string;
  detail: string;
};

type ModelResult = {
  model: string;
  parameters: string;
  rocAuc: string;
  prAuc: string;
  f1: string;
  precision: string;
  recall: string;
  brierScore: string;
  role: string;
  isPrimary?: boolean;
};

type ShapFactor = {
  factor: string;
  importance: string;
  direction: string;
};

type CommunityAlgorithm = {
  algorithm: string;
  communities: string;
  stability: string;
  decision: string;
  isPrimary?: boolean;
};

type GalleryImage = {
  src: string;
  width: number;
  height: number;
  caption: string;
};

type Phase = {
  n: string;
  title: string;
  summary: string;
  stats: { label: string; value: string }[];
  sources?: DataSource[];
  steps?: ProcessStep[];
  modelTable?: ModelResult[];
  shapFactors?: ShapFactor[];
  communityAlgorithms?: CommunityAlgorithm[];
  gallery?: GalleryImage[];
  note?: string;
};

type TeamMember = {
  name: string;
  degree: string;
  role: string;
  photo: string;
};

const TEAM: TeamMember[] = [
  {
    name: "Fio Ulaa' Octriyanti",
    degree: 'S1 Sains Data, Universitas Negeri Surabaya',
    role: 'Bertanggung jawab pada akuisisi data mentah dari seluruh sumber resmi.',
    photo: '/assets/team/fio-ulaa-octriyanti.jpeg',
  },
  {
    name: 'Abdullah Al-Firdaus Nuzula',
    degree: 'S1 Sains Data, Universitas Negeri Surabaya',
    role: 'Bertanggung jawab pada preprocessing, processing, pemodelan machine learning, hingga pembangunan dashboard ini.',
    photo: '/assets/team/abdullah-al-firdaus-nuzula.jpg',
  },
];

const RAW_DATA_SOURCES: DataSource[] = [
  { name: 'Izin Usaha Pertambangan (WIUP)', producer: 'Kementerian ESDM', url: 'https://geoportal.esdm.go.id/home/map/minerba' },
  { name: 'Izin Lokasi Perkebunan Sawit', producer: 'BIG · Kebijakan Satu Peta', url: 'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/PERIZINAN_DAN_PERTANAHAN/MapServer' },
  { name: 'Tutupan Lahan (WorldCover)', producer: 'European Space Agency (ESA)', url: 'https://esa-worldcover.org/en/data-access' },
  { name: 'Kejadian Bencana Hidrometeorologi', producer: 'BNPB', url: 'https://gis.bnpb.go.id/databencana/tabel/pencarian.php' },
  { name: 'Produktivitas Tanaman Pangan', producer: 'Dinas Pangan Provinsi Kalimantan Timur', url: 'https://data.kaltimprov.go.id/dataset/data-pertanian-prov-kaltim-tahun-2021-2022' },
  { name: 'Curah Hujan Harian (CHIRPS)', producer: 'Climate Hazards Center, UC Santa Barbara', url: 'https://www.chc.ucsb.edu/data/chirps3' },
  { name: 'Model Elevasi Digital (DEMNAS)', producer: 'BIG', url: 'https://big.go.id/content/produk/demnas' },
  { name: 'Batas DAS Mahakam', producer: 'BIG · Atlas Wilayah Sungai', url: 'https://geoservices.big.go.id/gis/rest/services/PTRA/Atlas_Wilayah_Sungai/MapServer/14' },
  { name: 'Batas Wilayah Administrasi', producer: 'BIG', url: 'https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_KABKOTA_AR/MapServer/0' },
  { name: 'Jaringan Sungai (RBI 1:250.000)', producer: 'BIG', url: 'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/798' },
];

const PHASES: Phase[] = [
  {
    n: '01',
    title: 'Akuisisi Data Mentah',
    summary:
      'Riset ini memanfaatkan 10 dataset dari delapan instansi resmi. Begitu data ditarik lewat portal terbuka maupun ' +
      'layanan peta REST, versinya langsung kami kunci apa adanya tanpa modifikasi awal. Anda bisa meninjau dan ' +
      'memverifikasi dokumen aslinya lewat tautan masing-masing di bawah.',
    stats: [
      { label: 'Sumber Data', value: '10 Dataset' },
      { label: 'Total Data Mentah', value: '≈746 MB' },
    ],
    sources: RAW_DATA_SOURCES,
  },
  {
    n: '02',
    title: 'Validasi & Kesiapan Data',
    summary:
      'Sebelum melangkah lebih jauh, setiap data kami uji kelengkapan, konsistensi, dan kelayakannya. Pada tahap ' +
      'seleksi ini, data elevasi digital (DEM) dan batas administrasi sempat tertahan karena belum lolos verifikasi, ' +
      'sehingga harus diperbaiki terlebih dahulu sebelum akhirnya disahkan.',
    stats: [
      { label: 'Dataset Diperbaiki', value: '2 dari 10' },
      { label: 'Status Akhir', value: 'Seluruhnya disahkan' },
    ],
  },
  {
    n: '03',
    title: 'Transformasi & Integrasi Grid',
    summary:
      'Sepuluh dataset ini datang dalam bentuk yang sangat berbeda: poligon batas izin, raster citra satelit, data grid ' +
      'iklim harian, garis jaringan sungai, hingga tabel statistik pertanian per kabupaten, sehingga tidak bisa langsung ' +
      'ditumpuk begitu saja. Berikut tahapan penyatuannya menjadi satu unit analisis yang memetakan seluruh DAS Mahakam.',
    stats: [
      { label: 'Grid Kanonis', value: '77.600 sel' },
      { label: 'Tabel Fitur Akhir', value: '60 kolom' },
    ],
    steps: [
      {
        label: 'Kanvas dasarnya',
        detail: 'Batas DAS Mahakam dipetakan ke proyeksi luas-sama, lalu dibagi habis jadi 77.600 petak 1×1 km, masing-masing dapat ID unik dari utara-selatan dan barat-timur.',
      },
      {
        label: 'Poligon izin (tambang, sawit)',
        detail: 'Dihitung persentase luas petak yang tertutup izin.',
      },
      {
        label: 'Citra tutupan lahan (10 meter)',
        detail: 'Dihitung ulang jadi persentase 11 kelas tutupan lahan per petak.',
      },
      {
        label: 'Data elevasi',
        detail: 'Diproyeksikan ulang sekali ke resolusi 50 meter, lalu diringkas jadi ketinggian dan kemiringan lahan rata-rata.',
      },
      {
        label: 'Curah hujan harian (aslinya sekitar 5×5 km)',
        detail: 'Disebar ulang proporsional ke petak 1 km.',
      },
      {
        label: 'Jaringan sungai',
        detail: 'Dihitung jadi panjang aliran serta jarak terdekat per petak.',
      },
      {
        label: 'Penggabungan akhir',
        detail: 'Semua digabung lewat kunci yang sama, ID petak, menjadi satu tabel 60 kolom, setelah definisi tiap kolom dibakukan lebih dulu.',
      },
    ],
  },
  {
    n: '04',
    title: 'Rekayasa Target Bencana',
    summary:
      'Tahap paling berliku dalam proyek ini, karena tidak ada satu pun dataset kejadian bencana yang langsung siap ' +
      'pakai. Berikut jejak pencariannya, satu per satu, sampai targetnya bisa dibekukan.',
    stats: [
      { label: 'Kejadian Banjir Acuan', value: '3 peristiwa' },
      { label: 'Grid Siap Model', value: '65.912 sel (4,2% pernah banjir)' },
    ],
    steps: [
      {
        label: 'BNPB (layanan titik bencana resmi)',
        detail: 'Dua layanan titik yang diuji bisa diakses metadatanya, tapi setiap permintaan datanya gagal sehingga tidak ada satu pun kejadian yang berhasil ditarik.',
      },
      {
        label: 'BPBD Kalimantan Timur',
        detail: 'Tercatat 475 kejadian banjir dan longsor, tapi tidak satu pun berhasil dicocokkan ke koordinat asli, sementara peta portalnya sendiri nihil data banjir maupun longsor.',
      },
      {
        label: 'InaRISK',
        detail: '66 layanan peta ditemukan dan ditelusuri, tapi semuanya ternyata peta zona risiko, bukan rekaman kejadian nyata yang pernah terjadi.',
      },
      {
        label: 'Longsor dikesampingkan',
        detail: 'Katalog longsor internasional (NASA COOLR) dan laporan resmi PVMBG turut diperiksa, tapi nol titik longsor tervalidasi berada di dalam DAS Mahakam, sehingga longsor dikeluarkan dari target model.',
      },
      {
        label: 'Beralih ke Global Flood Database',
        detail: 'Dari 8 kejadian banjir yang bersinggungan dengan DAS Mahakam, 3 di antaranya punya peta kejadian lengkap untuk diagregasi (7 Mei 2004, 1 Mei dan 15 Mei 2007), menghasilkan label banjir untuk 2.799 dari 77.600 petak.',
      },
      {
        label: 'Masalah baru: ketidaksesuaian waktu',
        detail: 'Kejadian banjirnya terjadi 2004-2007, sementara data izin tambang, izin sawit, dan tutupan lahan mencerminkan kondisi saat ini, sehingga tidak sah dipakai sebagai prediktor langsung kejadian selama itu.',
      },
      {
        label: 'Solusinya: model dipecah dua tahap',
        detail: 'Model kerentanan historis hanya memakai variabel yang bisa direkonstruksi untuk periode 2004-2007, yaitu curah hujan 3 dan 7 hari sebelum tiap kejadian, kemiringan lahan, dan jarak ke sungai. Izin tambang dan sawit dipisah jadi lapisan tumpang tindih kebijakan sesudah model, bukan diklaim sebagai penyebab banjir tersebut.',
      },
      {
        label: 'Hasil akhir',
        detail: '65.912 dari 77.600 petak punya data lengkap untuk pemodelan (2.797 di antaranya pernah banjir, sekitar 4,2%), siap dipakai pada tahap pemodelan machine learning berikutnya.',
      },
    ],
    note: 'Bagian ini menunjukkan dua hal nyata: rencana awal riset harus menyesuaikan diri ketika data resmi yang diharapkan ternyata belum cukup detail untuk dipakai, dan tim sendiri yang menangkap celah ilmiahnya sebelum data izin tambang serta sawit masa kini nyaris dipakai seolah sudah berlaku sejak kejadian banjir 2004-2007 terjadi.',
    gallery: [
      {
        src: '/assets/evidence/step04-flood-target-map.png',
        width: 790,
        height: 690,
        caption: 'Sebaran grid target di seluruh DAS Mahakam. Titik kuning adalah grid yang tercatat pernah banjir menurut Global Flood Database, jelas mengelompok di satu kawasan, bukan tersebar acak.',
      },
    ],
  },
  {
    n: '05',
    title: 'Pemodelan Machine Learning',
    summary:
      'Tiga model (Random Forest, XGBoost, dan LightGBM) dilatih untuk mengenali ciri wilayah yang rawan banjir. ' +
      'Hasil penilaian ketiganya lalu digabungkan menjadi satu kesepakatan nilai. Agar pengujiannya adil, ' +
      'model langsung dites pada wilayah baru yang belum pernah dipelajari, memastikan sistem benar-benar paham kondisi nyata dan bukan cuma menghafal data lama.',
    stats: [
      { label: 'Ketepatan Model (ROC-AUC)', value: '0,955 dari 1,0' },
      { label: 'Grid Berhasil Diberi Skor', value: '77.519 dari 77.600' },
    ],
    modelTable: [
      {
        model: 'Random Forest',
        parameters: '350 pohon, class_weight balanced_subsample',
        rocAuc: '0,944',
        prAuc: '0,528',
        f1: '0,456',
        precision: '0,605',
        recall: '0,366',
        brierScore: '0,028',
        role: 'Anggota ensemble utama',
      },
      {
        model: 'XGBoost',
        parameters: '350 pohon, kedalaman maks. 6, learning rate 0,05, scale_pos_weight ≈22,6 untuk mengoreksi ketimpangan kelas',
        rocAuc: '0,953',
        prAuc: '0,539',
        f1: '0,488',
        precision: '0,364',
        recall: '0,737',
        brierScore: '0,048',
        role: 'Anggota ensemble utama',
      },
      {
        model: 'LightGBM',
        parameters: '350 pohon, num_leaves 31, learning rate 0,05, class_weight balanced',
        rocAuc: '0,953',
        prAuc: '0,554',
        f1: '0,504',
        precision: '0,385',
        recall: '0,730',
        brierScore: '0,045',
        role: 'Anggota ensemble utama',
      },
      {
        model: 'Logistic Regression',
        parameters: 'class_weight balanced, solver lbfgs, max_iter 2000, fitur distandarisasi (StandardScaler)',
        rocAuc: '0,960',
        prAuc: '0,537',
        f1: '0,388',
        precision: '0,244',
        recall: '0,950',
        brierScore: '0,090',
        role: 'Baseline pembanding, tidak dipakai sebagai model akhir',
      },
      {
        model: 'Tree Ensemble Mean',
        parameters: 'Rata-rata tanpa bobot dari probabilitas Random Forest, XGBoost, dan LightGBM',
        rocAuc: '0,955',
        prAuc: '0,551',
        f1: '0,512',
        precision: '0,420',
        recall: '0,656',
        brierScore: '0,035',
        role: 'Model akhir yang dipakai sistem',
        isPrimary: true,
      },
      {
        model: 'GraphSAGE',
        parameters: '2 lapisan graph neural network (hidden 32→16), grafik ketetanggaan rook 4-arah, 80 epoch, dropout 0,3, learning rate 0,005',
        rocAuc: '0,956',
        prAuc: '0,408',
        f1: '0,401',
        precision: '0,255',
        recall: '0,944',
        brierScore: '0,088',
        role: 'Dibandingkan sebagai pendekatan lebih canggih, tidak dipakai karena PR-AUC lebih rendah',
      },
    ],
    note: 'Keempatnya diuji dengan validasi spasial 5-fold (StratifiedGroupKFold), blok spasial 20 km, tanpa tumpang tindih wilayah latih dan uji. Logistic Regression justru mencatat ROC-AUC tertinggi sendirian, tapi tetap diperlakukan sebagai baseline pembanding, bukan model akhir. Skor kerentanan sendiri berhasil dihitung untuk 77.519 dari 77.600 grid; 81 grid sisanya tidak kebagian skor karena salah satu dari keempat nilai prediktornya, misalnya kemiringan lahan atau curah hujan di lokasi itu, tidak tersedia lengkap. Arsitektur graph neural network (GraphSAGE) juga sempat dibandingkan sebagai pendekatan yang lebih canggih; ROC-AUC-nya (0,956) nyaris sama dengan Tree Ensemble Mean, tapi PR-AUC-nya justru lebih rendah (0,408 berbanding 0,551), jadi ensemble pohon yang lebih sederhana tetap dipakai.',
    gallery: [
      {
        src: '/assets/evidence/step05-target-distribution.png',
        width: 690,
        height: 390,
        caption: 'Distribusi kelas target dalam sampel pemodelan: hanya 4,2% grid yang tercatat pernah banjir, sisanya jadi kelas negatif.',
      },
      {
        src: '/assets/evidence/step05-spatial-folds.png',
        width: 836,
        height: 690,
        caption: 'Pembagian 5 lipatan validasi spasial (blok 20 km). Tiap warna adalah satu lipatan uji, disusun agar tidak ada kebocoran wilayah antara data latih dan data uji.',
      },
      {
        src: '/assets/evidence/step05-roc-curve.png',
        width: 790,
        height: 590,
        caption: 'Kurva ROC seluruh model dari hasil out-of-fold, dengan nilai ROC-AUC masing-masing tertulis di legenda.',
      },
      {
        src: '/assets/evidence/step05-pr-curve.png',
        width: 790,
        height: 590,
        caption: 'Kurva Precision-Recall seluruh model, metrik yang lebih peka terhadap kelas minoritas (grid yang pernah banjir) dibanding ROC-AUC saja.',
      },
      {
        src: '/assets/evidence/step05-slope-ablation.png',
        width: 790,
        height: 490,
        caption: 'Studi ablasi kemiringan lahan: model 4-fitur penuh mencapai ROC-AUC 0,955, dibuang jadi 0,850 tanpa kemiringan lahan, dan kemiringan lahan sendirian saja sudah mencapai 0,950.',
      },
      {
        src: '/assets/evidence/step05-graphsage-loss.png',
        width: 889,
        height: 490,
        caption: 'Kurva loss pelatihan GraphSAGE per lipatan spasial, bukti bahwa pendekatan graph neural network juga benar-benar dicoba, bukan cuma disebutkan.',
      },
    ],
  },
  {
    n: '06',
    title: 'Interpretasi Model (SHAP)',
    summary:
      'Model AI sering kali sulit ditebak cara berpikirnya. Karena itu, kami membedah setiap prediksinya menggunakan ' +
      'metode SHAP untuk melihat alasan di balik tebakan sistem, dan menghitung seberapa besar pengaruh tiap faktor ' +
      'secara global di seluruh grid. Inilah keempat faktor yang dianalisis, sekaligus dasar yang dipakai untuk ' +
      'menjelaskan skor tiap grid secara satuan di Atlas Spasial. Berikut urutannya dari yang paling berpengaruh.',
    stats: [
      { label: 'Faktor Paling Berpengaruh', value: 'Kemiringan lahan' },
      { label: 'Dominan di', value: '81,2% grid (62.965 sel)' },
    ],
    shapFactors: [
      {
        factor: 'Kemiringan lahan (rata-rata, derajat)',
        importance: '53,6%',
        direction: 'Makin curam, makin menurunkan skor kerentanan.',
      },
      {
        factor: 'Curah hujan antesenden 7 hari (mm)',
        importance: '19,8%',
        direction: 'Pada data historis ini, nilai yang lebih tinggi justru cenderung berasosiasi dengan skor yang lebih rendah.',
      },
      {
        factor: 'Curah hujan antesenden 3 hari (mm)',
        importance: '16,3%',
        direction: 'Makin tinggi, makin menaikkan skor kerentanan.',
      },
      {
        factor: 'Jarak ke sungai (meter)',
        importance: '10,2%',
        direction: 'Makin jauh dari sungai, makin menurunkan skor kerentanan.',
      },
    ],
    note: 'Persentase di atas adalah rata-rata pengaruh tiap faktor di seluruh 77.519 grid, beda dengan angka 81,2% pada kartu ringkasan yang mengukur seberapa sering kemiringan lahan jadi faktor tunggal terbesar per grid. Ingat juga, hanya keempat faktor historis ini yang dipakai sebagai prediktor model. Tutupan lahan, izin tambang, dan izin sawit tidak dimasukkan sebagai prediktor sehingga tidak akan pernah muncul di sini, tapi tetap ditampilkan terpisah sebagai konteks tumpang tindih kebijakan.',
    gallery: [
      {
        src: '/assets/evidence/step06-shap-consensus.png',
        width: 889,
        height: 490,
        caption: 'Bar chart kepentingan SHAP konsensus untuk keempat faktor, versi visual dari tabel di atas.',
      },
    ],
  },
  {
    n: '07',
    title: 'Jaringan Hidrologi & Node Bridge',
    summary:
      'Bukan seluruh 77.600 grid tadi yang dipakai di tahap ini, hanya petak yang benar-benar dilalui aliran sungai. ' +
      'Petak-petak itu disusun menjadi satu graf jaringan hidrologi berisi 24.306 node dan 25.275 sambungan. Dua ' +
      'algoritma pengelompokan komunitas, Louvain dan Leiden, diuji dan dibandingkan stabilitasnya lebih dulu sebelum ' +
      'salah satunya dipakai untuk hasil akhir. Dari situ, sistem mengenali node bridge, titik penghubung kritis yang ' +
      'jika terganggu dapat merembet ke sistem sungai lain.',
    stats: [
      { label: 'Node & Sambungan Sungai', value: '24.306 node · 25.275 sambungan' },
      { label: 'Komunitas Hidrologis', value: '973 komunitas' },
      { label: 'Node Bridge Kritis Lintas-Sistem', value: '25 node' },
    ],
    steps: [
      {
        label: '5.367 ruas garis sungai',
        detail: 'Dari D10 (garis sungai resmi BIG), ada 5.367 ruas garis yang melintasi DAS Mahakam.',
      },
      {
        label: 'Difragmentasi mengikuti batas grid',
        detail: 'Tiap ruas dipotong mengikuti batas tiap grid 1 km yang dilewatinya, lalu panjang tiap potongan dijumlahkan per grid.',
      },
      {
        label: 'Grid tersentuh sungai jadi node',
        detail: 'Grid dengan total panjang sungai lebih dari 0, walau cuma sepotong kecil, jadi node jaringan. Grid yang sama sekali tidak tersentuh garis sungai tetap ada di tabel fitur biasa, cuma tidak ikut jaringan. Hasilnya: 24.306 dari 77.600 grid jadi node.',
      },
    ],
    communityAlgorithms: [
      {
        algorithm: 'Louvain',
        communities: '315 komunitas pada uji banding di seluruh graf',
        stability: '0,752',
        decision: 'Dibandingkan sebagai kandidat',
      },
      {
        algorithm: 'Leiden',
        communities: '322 komunitas pada uji banding di seluruh graf',
        stability: '0,790',
        decision: 'Dipilih, hasilnya lebih stabil pada percobaan ulang',
        isPrimary: true,
      },
    ],
    note: 'Stabilitas di atas diukur dengan median Adjusted Rand Index (ARI) antar beberapa kali percobaan ulang dengan angka acak berbeda, semakin tinggi berarti hasil pengelompokannya semakin konsisten. Untuk hasil akhir, Leiden dijalankan lagi secara per-komponen (karena jaringan sungai ini punya 193 potongan graf yang saling terpisah), pada resolusi γ=1, menghasilkan 973 komunitas yang dipakai di seluruh dashboard. Pada pengujian ulang khusus skema ini, Leiden tetap lebih stabil (ARI 0,765) dibanding Louvain (ARI 0,718). Struktur graf ini sendiri (node dan sambungan) dibangun murni dari topologi sungai D10, independen dari skor kerentanan banjir. Skor kerentanan dari tahap pemodelan machine learning dan hasil overlay kebijakan dari tahap interpretasi SHAP baru ditempelkan sesudahnya sebagai atribut tambahan di tiap node, bukan untuk membentuk struktur jaringannya sama sekali.',
    gallery: [
      {
        src: '/assets/evidence/step07-hydrological-network.png',
        width: 3571,
        height: 2974,
        caption: 'Graf jaringan hidrologi penuh, 24.306 node dan 25.275 sambungan, digambar mengikuti bentuk asli DAS Mahakam.',
      },
      {
        src: '/assets/evidence/step07-leiden-communities.png',
        width: 3570,
        height: 3076,
        caption: 'Peta komunitas hasil algoritma Leiden, tiap warna adalah satu komunitas hidrologis.',
      },
      {
        src: '/assets/evidence/step07-louvain-communities.png',
        width: 3570,
        height: 3076,
        caption: 'Peta komunitas hasil algoritma Louvain, sebagai pembanding langsung terhadap hasil Leiden di sebelah kiri.',
      },
      {
        src: '/assets/evidence/step07-critical-bridges.png',
        width: 3570,
        height: 3076,
        caption: 'Lokasi 25 node bridge kritis lintas-sistem di seluruh DAS Mahakam.',
      },
    ],
  },
  {
    n: '08',
    title: 'Screening Prioritas & Rekomendasi',
    summary:
      'Skor kerentanan, evidence node bridge, dan konteks tumpang tindih kebijakan digabungkan menjadi enam ' +
      'tingkatan rekomendasi (R0 sampai R5) yang sudah dipakai di Atlas Spasial. Dari 24.306 node tadi, hanya yang ' +
      'berstatus node bridge dalam bentuk apa pun (kritis lintas-sistem, struktural, administratif, atau jaringan) ' +
      'yang bisa naik ke tingkat R1 sampai R5; node yang bukan bridge otomatis masuk R0 dan tidak dapat rekomendasi ' +
      'otomatis. Karena itu, hanya 1.696 dari 24.306 node yang akhirnya ditandai sebagai target tindak lanjut teknis.',
    stats: [
      { label: 'Target Tindak Lanjut', value: '1.696 dari 24.306 node' },
      { label: 'Prioritas Tertinggi (R1)', value: '1 node' },
    ],
    gallery: [
      {
        src: '/assets/evidence/step08-priority-tiers.png',
        width: 3570,
        height: 3076,
        caption: 'Peta tingkatan prioritas screening di seluruh DAS Mahakam, tahap sebelum digabung jadi kelas rekomendasi akhir.',
      },
      {
        src: '/assets/evidence/step08-recommendation-classes.png',
        width: 3570,
        height: 3076,
        caption: 'Peta kelas rekomendasi akhir R0 sampai R5, persis seperti yang tampil di Atlas Spasial.',
      },
      {
        src: '/assets/evidence/step08-r1-targets.png',
        width: 3570,
        height: 3076,
        caption: 'Lokasi node dengan prioritas tertinggi (R1), titik yang paling membutuhkan tinjauan teknis terintegrasi lintas-sistem.',
      },
    ],
  },
  {
    n: '09',
    title: 'Audit Ilmiah & Publikasi Web',
    summary:
      'Sebelum tampil di dashboard, seluruh hasil screening diaudit ulang secara independen untuk menegaskan batas ' +
      'klaim yang boleh dan tidak boleh dinyatakan sistem ini. Setelah audit disahkan, data dikemas ke format peta ' +
      'web standar (GeoJSON, EPSG:4326) dan disalurkan ke dashboard yang sedang kamu lihat sekarang.',
    stats: [
      { label: 'Status Ilmiah', value: 'Ditutup dengan keterbatasan terdokumentasi' },
      { label: 'Ukuran Data Web', value: '31,28 MB (seluruh node)' },
    ],
  },
];

export default function PipelineView() {
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});

  const togglePhase = (n: string) => {
    setOpenPhases(prev => ({
      ...prev,
      [n]: !prev[n],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    PHASES.forEach(p => {
      next[p.n] = true;
    });
    setOpenPhases(next);
  };

  const collapseAll = () => {
    setOpenPhases({});
  };

  const openCount = Object.values(openPhases).filter(Boolean).length;

  return (
    <div className="pipeline-container">
      <section className="pipeline-hero">
        <span className="section-kicker">ALUR PROSES · DARI DATA MENTAH KE DASHBOARD</span>
        <h1>Pipeline Proyek</h1>
        <p>
          Halaman ini merangkum sembilan tahap yang telah dilalui hingga terbentuknya sistem screening ini.
        </p>
      </section>

      {/* Global Toolbar for Expand / Collapse All */}
      <div className="pipeline-toolbar">
        <div className="pipeline-toolbar-info">
          <span className="pipeline-toolbar-badge">9 Tahap Riset</span>
          <span>
            {openCount === 0
              ? 'Seluruh tahap diminimize · Klik judul atau tombol detail untuk membaca'
              : `${openCount} dari 9 tahap terbuka`}
          </span>
        </div>
        <div className="pipeline-toolbar-actions">
          <button
            type="button"
            className="pipeline-toolbar-btn"
            onClick={expandAll}
            title="Buka seluruh rincian tahap alur proses"
          >
            Buka Semua
          </button>
          <button
            type="button"
            className="pipeline-toolbar-btn"
            onClick={collapseAll}
            title="Tutup / minimize seluruh rincian tahap alur proses"
          >
            Tutup Semua
          </button>
        </div>
      </div>

      <ol className="pipeline-timeline">
        {PHASES.map(phase => {
          const isOpen = Boolean(openPhases[phase.n]);
          return (
            <li className="pipeline-phase" key={phase.n}>
              <div className="pipeline-phase-marker">
                <span>{phase.n}</span>
              </div>
              <div className={`pipeline-phase-card ${isOpen ? 'is-open' : 'is-collapsed'}`}>
                <div
                  id={`pipeline-header-${phase.n}`}
                  className="pipeline-card-header"
                  onClick={() => togglePhase(phase.n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      togglePhase(phase.n);
                    }
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`pipeline-body-${phase.n}`}
                  title={isOpen ? 'Klik untuk minimize tahap ini' : 'Klik untuk membuka rincian tahap ini'}
                >
                  <div className="pipeline-card-title-group">
                    <h2>{phase.title}</h2>
                    <span className="pipeline-preview-pill">
                      {phase.stats[0]?.label}: <strong>{phase.stats[0]?.value}</strong>
                      {phase.stats[1] && <span className="preview-pill-extra"> · {phase.stats[1].value}</span>}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="pipeline-toggle-btn"
                    onClick={e => {
                      e.stopPropagation();
                      togglePhase(phase.n);
                    }}
                    aria-label={isOpen ? `Tutup detail tahap ${phase.n}` : `Buka detail tahap ${phase.n}`}
                  >
                    <span>{isOpen ? 'Tutup' : 'Detail'}</span>
                    <span className={`pipeline-chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true">
                      ▼
                    </span>
                  </button>
                </div>

                <div
                  className={`pipeline-card-collapse ${isOpen ? 'is-expanded' : 'is-collapsed'}`}
                  id={`pipeline-body-${phase.n}`}
                  role="region"
                  aria-labelledby={`pipeline-header-${phase.n}`}
                >
                  <div className="pipeline-card-collapse-inner">
                    <div className="pipeline-card-body">
                      <p>{phase.summary}</p>
                      <div className="pipeline-phase-stats">
                        {phase.stats.map(s => (
                          <div key={s.label}>
                            <strong>{s.value}</strong>
                            <span>{s.label}</span>
                          </div>
                        ))}
                      </div>
                      {phase.sources && (
                        <ol className="pipeline-source-list">
                          {phase.sources.map((source, i) => (
                            <li key={source.name}>
                              <span className="pipeline-source-index" aria-hidden="true">{i + 1}</span>
                              <div>
                                <strong>{source.name}</strong>
                                <span>{source.producer}</span>
                              </div>
                              <a href={source.url} target="_blank" rel="noopener noreferrer">
                                Sumber <span aria-hidden="true">↗</span>
                              </a>
                            </li>
                          ))}
                        </ol>
                      )}
                      {phase.steps && (
                        <ol className="pipeline-process-list">
                          {phase.steps.map((step, i) => (
                            <li key={step.label}>
                              <span className="pipeline-source-index" aria-hidden="true">{i + 1}</span>
                              <div>
                                <strong>{step.label}</strong>
                                <span>{step.detail}</span>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                      {phase.modelTable && (
                        <div className="pipeline-data-table-wrap">
                          <table className="pipeline-data-table">
                            <thead>
                              <tr>
                                <th>Tipe Model</th>
                                <th>Parameter Utama</th>
                                <th>ROC-AUC</th>
                                <th>PR-AUC</th>
                                <th>F1</th>
                                <th>Precision</th>
                                <th>Recall</th>
                                <th>Brier Score</th>
                                <th>Peran</th>
                              </tr>
                            </thead>
                            <tbody>
                              {phase.modelTable.map(m => (
                                <tr key={m.model} className={m.isPrimary ? 'is-primary' : undefined}>
                                  <td className="cell-strong">{m.model}</td>
                                  <td>{m.parameters}</td>
                                  <td className="cell-metric">{m.rocAuc}</td>
                                  <td className="cell-metric">{m.prAuc}</td>
                                  <td className="cell-metric">{m.f1}</td>
                                  <td className="cell-metric">{m.precision}</td>
                                  <td className="cell-metric">{m.recall}</td>
                                  <td className="cell-metric">{m.brierScore}</td>
                                  <td className="cell-muted">{m.role}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {phase.shapFactors && (
                        <div className="pipeline-data-table-wrap">
                          <table className="pipeline-data-table">
                            <thead>
                              <tr>
                                <th>Faktor SHAP</th>
                                <th>Kepentingan Global</th>
                                <th>Arah Pengaruh</th>
                              </tr>
                            </thead>
                            <tbody>
                              {phase.shapFactors.map(f => (
                                <tr key={f.factor}>
                                  <td className="cell-strong">{f.factor}</td>
                                  <td className="cell-metric">{f.importance}</td>
                                  <td className="cell-muted">{f.direction}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {phase.communityAlgorithms && (
                        <div className="pipeline-data-table-wrap">
                          <table className="pipeline-data-table">
                            <thead>
                              <tr>
                                <th>Algoritma</th>
                                <th>Komunitas (Uji Banding)</th>
                                <th>Stabilitas (ARI)</th>
                                <th>Keputusan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {phase.communityAlgorithms.map(a => (
                                <tr key={a.algorithm} className={a.isPrimary ? 'is-primary' : undefined}>
                                  <td className="cell-strong">{a.algorithm}</td>
                                  <td>{a.communities}</td>
                                  <td className="cell-metric">{a.stability}</td>
                                  <td className="cell-muted">{a.decision}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {phase.note && <div className="pipeline-phase-note">{phase.note}</div>}
                      {phase.gallery && (
                        <div className="pipeline-gallery">
                          {phase.gallery.map(img => (
                            <figure className="pipeline-gallery-item" key={img.src}>
                              <Image src={img.src} alt={img.caption} width={img.width} height={img.height} />
                              <figcaption>{img.caption}</figcaption>
                            </figure>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="content-section pipeline-dropped">
        <span className="section-kicker">APA YANG TIDAK DILANJUTKAN</span>
        <h2>Tugas yang Dihentikan</h2>
        <p>
          Dari 11 dataset yang direncanakan di awal, satu data terpaksa kami coret karena tidak ditemukan sumber resmi
          yang dapat dipertanggungjawabkan. Kami memilih bekerja hanya dengan 10 dataset yang benar-benar terverifikasi.
        </p>
        <p>
          Selain itu, rancangan Indeks Risiko Konflik (IRC) juga kami hentikan. Indikator pendukungnya, seperti perkiraan
          kerugian ekonomi dan penurunan panen pertanian, belum memiliki data pembanding yang cukup kuat untuk divalidasi.
          Daripada memaksakan skor akhir yang spekulatif, sistem ini secara sadar dibatasi pada tahap screening berbasis
          bukti (evidence-based).
        </p>
      </section>

      <section className="content-section pipeline-workflow">
        <span className="section-kicker">CARA KERJA</span>
        <h2>Tim & Perangkat Kerja</h2>

        <div className="pipeline-team">
          <h3>Tim di Balik Proyek Ini</h3>
          <div className="pipeline-team-grid">
            {TEAM.map(member => (
              <div className="pipeline-team-card" key={member.name}>
                <img className="pipeline-team-photo" src={member.photo} alt={`Foto ${member.name}`} />
                <div>
                  <strong>{member.name}</strong>
                  <span className="team-degree">{member.degree}</span>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pipeline-workflow-grid">
          <div>
            <h3>Perangkat Analisis</h3>
            <p>
              Google Colab sebagai lingkungan kerja utama, dengan pustaka Python (pandas, geopandas, scikit-learn,
              XGBoost, LightGBM, SHAP) untuk pengolahan data dan pemodelan, serta QGIS untuk pemeriksaan visual
              spasial.
            </p>
          </div>
          <div>
            <h3>Perangkat Dashboard</h3>
            <p>
              Dashboard ini sendiri dibangun dengan Next.js dan TypeScript, menyalurkan hasil akhir yang sudah lolos
              audit ilmiah ke dalam peta interaktif, evidence per grid, dan sorotan kasus yang bisa kamu jelajahi.
            </p>
          </div>
        </div>
      </section>

      <section className="disclaimer">
        <strong>Interpretasi Ilmiah</strong>
        <p className="disclaimer-id">
          Alur di halaman ini menjelaskan proses, bukan menambah klaim baru. Batasan ilmiah yang sama tetap berlaku:
          kelas rekomendasi bukan kelas risiko masa depan yang terkalibrasi, tumpang tindih kebijakan/izin bukan
          jejak fisik di lapangan, dan keterkaitan spasial/model tidak membuktikan sebab-akibat maupun mengesahkan
          tindakan regulasi.
        </p>
        <p lang="en" className="disclaimer-en">
          Screening-based decision support for the Mahakam pilot. Recommendation classes are not calibrated future-risk
          classes, policy/permit overlap is not physical footprint, and spatial/model association does not establish
          causality or authorize regulatory action.
        </p>
      </section>

      <section className="story-conclusion-card">
        <h3>Ingin Melihat Hasilnya Langsung?</h3>
        <p>Semua tahap di atas bermuara pada peta interaktif dan evidence per grid yang bisa kamu jelajahi sendiri.</p>
        <div className="conclusion-actions">
          <Link href="/atlas" className="primary-link">
            Buka Atlas Spasial <span>↗</span>
          </Link>
          <Link href="/methodology" className="secondary-link">
            Lihat Metodologi Teknis <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

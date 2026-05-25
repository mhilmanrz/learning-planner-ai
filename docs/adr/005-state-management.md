# ADR-005: State Management — Local State + Custom Hooks

## Status
Diterima

## Konteks

Saat mengembangkan fitur Kalender Mingguan (Cycle 2), muncul pertanyaan:
**pendekatan state management mana yang paling tepat** untuk aplikasi ini?

Tiga opsi yang dipertimbangkan:

1. **Local State + Custom Hooks** (pola saat ini)
2. **React Context**
3. **State Management Library (Zustand/Redux)**

### Peta Komponen yang Mengakses Data Tasks

```
App
├── Dashboard.jsx       → useDashboardData() → GET /tasks?week_start + GET /goals + GET /auth/me
├── Progress.jsx        → useEffect lokal   → GET /tasks?week_start + GET /goals
├── Goals.jsx           → useEffect lokal   → GET /goals
├── GoalDetail.jsx      → useEffect lokal   → GET /goals/:id + GET /tasks?goal_id
├── Calendar.jsx
│   └── WeeklyCalendar.jsx → useEffect lokal → GET /tasks?week_start  ← Cycle 2
└── (halaman lain di rute berbeda)
```

### Fakta Kunci Arsitektur

1. **Semua halaman berjalan di rute terpisah** — tidak pernah ada dua halaman yang ter-render secara bersamaan dalam DOM.
2. **Setiap halaman punya konteks `week_start` sendiri** — Dashboard pakai "minggu ini", Kalender bisa navigasi bebas.
3. **Satu-satunya operasi write yang bersifat reaktif** adalah `PATCH /tasks/:id/status` (mark done) — dan ini hanya terjadi di Dashboard, yang sudah menanganinya dengan optimistic update + rollback di local state.
4. **Tidak ada state yang perlu dibaca oleh dua komponen berbeda secara bersamaan** dalam satu tampilan (no "sibling sharing").

## Keputusan

**Mempertahankan Local State + Custom Hooks.**

Tidak menggunakan React Context maupun library state management eksternal untuk saat ini.

Pola konkret yang digunakan:
- **Custom hook `useDashboardData`** — enkapsulasi logic fetch + derived stats untuk Dashboard.
- **`useEffect` lokal** — di Progress, GoalDetail, WeeklyCalendar; masing-masing fetch data sesuai kebutuhannya.
- **Optimistic update** — untuk interaksi mark-done di Dashboard tanpa menunggu API.

## Alasan

### Mengapa TIDAK React Context

React Context cocok untuk **state global yang dibaca banyak komponen secara bersamaan** (contoh: tema, locale, auth). Dalam kasus ini:

- Kalender dan Dashboard tidak pernah aktif bersamaan (beda rute).
- Jika Context digunakan, state tasks akan tetap hidup saat user berpindah halaman → menampilkan data stale.
- Context re-render setiap kali value berubah → performa lebih buruk tanpa manfaat nyata.

### Mengapa TIDAK Zustand/Redux

Library state management cocok jika:
- ≥4 komponen perlu membaca **state yang sama secara bersamaan**.
- Ada operasi write kompleks yang harus disinkronkan antar komponen.

Kondisi ini tidak terpenuhi. Menambahkan dependency baru hanya akan menambah kompleksitas tanpa nilai tambah.

### Mengapa Local State + Custom Hooks CUKUP

| Kebutuhan | Terpenuhi oleh |
|-----------|---------------|
| Fetch data per halaman | `useEffect` lokal dengan `cancelled` flag |
| Logika reusable (Dashboard) | Custom hook `useDashboardData` |
| Reaktif saat status task berubah | Optimistic update di local state |
| Navigasi minggu di Kalender | `weekStart` sebagai local state di `WeeklyCalendar` |
| Data selalu fresh saat pindah halaman | Alami — komponen unmount → remount → fetch ulang |

### Catatan tentang WeeklyCalendar

`weekStart` dikelola sebagai **state lokal** di `WeeklyCalendar`, bukan prop dari parent (`Calendar.jsx`). Ini adalah keputusan yang tepat karena:
- Navigasi minggu adalah urusan internal kalender, bukan urusan parent.
- Jika `weekStart` jadi prop, parent harus ikut mengelola state yang tidak ia perlukan (*prop drilling*).

## Konsekuensi

### Positif
- Zero tambahan dependency.
- Kode tetap sederhana dan mudah dipahami.
- Data selalu fresh karena fetch terjadi saat komponen mount.
- Mudah ditest — setiap komponen/hook bisa ditest secara isolasi.

### Negatif / Trade-off
- **Tidak ada cache antar navigasi** — setiap kali user kembali ke Dashboard, data di-fetch ulang. Ini diterima karena data tasks berubah secara real-time.
- **Jika di masa depan** muncul kebutuhan real-time sync antar dua komponen dalam satu halaman (misalnya: Calendar dan sidebar task list yang aktif bersamaan), barulah React Context perlu dipertimbangkan.

### Syarat untuk Re-evaluasi
Pertimbangkan migrasi ke React Context jika:
- Ada ≥2 komponen **dalam satu halaman** yang perlu membaca state tasks yang sama.
- User melakukan update di komponen A dan komponen B harus langsung mencerminkan perubahan itu **tanpa navigasi**.

Pertimbangkan Zustand jika kondisi di atas terjadi di ≥4 komponen sekaligus.

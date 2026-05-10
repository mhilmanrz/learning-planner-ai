# Implementasi Error Boundary

## Penjelasan
Error Boundary adalah komponen React yang menangkap error JavaScript yang terjadi di komponen anak mana pun di dalam hirarkinya, mencatat error tersebut, dan menampilkan fallback UI (tampilan pengganti) yang telah ditentukan, alih-alih membiarkan seluruh aplikasi crash atau menampilkan layar kosong.

## Implementasi
1. **Membuat Komponen `ErrorBoundary`**: Komponen ini berada di `client/src/components/ErrorBoundary.jsx`. Komponen `ErrorBoundary` memanfaatkan fungsi lifecycle `getDerivedStateFromError` untuk memperbarui state apabila terjadi error. Jika terdapat error, ia akan mengembalikan antarmuka UI fallback yang berisi pesan peringatan dan tombol "Muat ulang" untuk mencoba memuat kembali aplikasi.
2. **Bungkus komponen utama di `App.jsx`**: Komponen `ErrorBoundary` diimpor di `client/src/App.jsx` dan digunakan untuk membungkus seluruh aplikasi (dalam hal ini membungkus `<BrowserRouter>`). Hal ini dilakukan agar semua rute dan komponen di dalam aplikasi berada di bawah pengawasan Error Boundary ini. Dengan cara ini, setiap error tidak tertangani (unhandled error) yang terjadi di bagian manapun pada halaman aplikasi akan terdeteksi dan di-handle oleh `ErrorBoundary`.

# Implementasi Firebase untuk Cloud Sync

Rencana ini akan menggantikan penyimpanan lokal manual dengan **Firebase Firestore** untuk sinkronisasi data otomatis dan **Firebase Auth** untuk login menggunakan Google/Email.

## User Review Required

> [!IMPORTANT]
> Anda perlu membuat project di [Firebase Console](https://console.firebase.google.com/) dan mendapatkan konfigurasi SDK (apiKey, authDomain, dll) untuk dimasukkan ke dalam kode.

## Proposed Changes

### [Firebase Core]

#### [NEW] [firebase.js](file:///C:/Projects/shopping/js/firebase.js)
Membuat file baru untuk menangani inisialisasi Firebase, autentikasi, dan fungsi CRUD ke Firestore dengan fitur offline persistence diaktifkan.

### [UI & Integration]

#### [MODIFY] [index.html](file:///C:/Projects/shopping/pages/index.html)
Menambahkan script SDK Firebase (App, Auth, Firestore) sebelum `app.js`.

#### [MODIFY] [settings.html](file:///C:/Projects/shopping/pages/settings.html)
Menambahkan kembali UI untuk status koneksi Cloud, tombol Login Google, dan indikator sinkronisasi menggunakan Firebase.

#### [MODIFY] [app.js](file:///C:/Projects/shopping/js/app.js)
Menghubungkan fungsi `saveAndRender` agar otomatis melakukan sinkronisasi ke Firestore dan menambahkan listener untuk perubahan data real-time dari cloud.

#### [MODIFY] [pages.js](file:///C:/Projects/shopping/js/pages.js)
Menambahkan logika untuk tombol login/logout di halaman pengaturan.

## Verification Plan

### Manual Verification
1. Buka halaman Pengaturan dan lakukan Login.
2. Tambahkan barang di halaman Belanja (saat Online).
3. Matikan koneksi internet (Simulasi Supermarket).
4. Edit harga atau centang barang.
5. Nyalakan internet kembali dan pastikan data di Firebase Console terupdate otomatis.

# 📦 Pinjamin

**Pinjamin** adalah aplikasi manajemen peminjaman aset kampus berbasis web

Sistem ini dirancang untuk membantu pengelolaan peminjaman peralatan dan aset milik kampus — mulai dari peralatan elektronik hingga alat laboratorium dan praktikum — secara terdigitalisasi dan terpusat. Sistem ini belum sepenuhnya final dan masih terdapat beberapa kekurangan.


---

## 🚀 Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router DOM

### Backend
- Express.js (Node.js)
- Prisma ORM
- JWT Authentication
- Bcrypt.js

### Database
- MySQL (via Laragon)

---

## 🧠 System Architecture

```text
┌─────────────────────┐
│     React App       │  → Frontend (port 5173)
└─────────┬───────────┘
          │ HTTP Request (Axios + JWT)
          ▼
┌─────────────────────┐
│   Express.js API    │  → Backend (port 3000)
│   - Auth Routes     │
│   - Item Routes     │
│   - Loan Routes     │
│   - Report Routes   │
│   - User Routes     │
└─────────┬───────────┘
          │ Prisma ORM
          ▼
┌─────────────────────┐
│       MySQL         │  → Database (port 3306)
└─────────────────────┘
```

> Arsitektur monolithic dipilih untuk menyederhanakan development dan deployment, dengan pemisahan domain logic melalui modular routing.

---

## ✨ Features

### 🔐 Authentication
- Register akun mahasiswa / staff (NIM wajib 8–12 digit angka)
- Login dengan email & password
- JWT-based authentication (token expire 60 menit)
- Role-based access control: **Admin** dan **User**
- Auto-redirect setelah login: **Admin → Dashboard**, **User → Daftar Barang**
- Registrasi publik hanya bisa membuat akun **user** — akun admin dibuat manual via script

---

### 🗂️ 1. Manajemen Aset (CRUD Barang)

#### Admin dapat:
- **Create** — Tambah aset baru (nama, kategori, deskripsi, foto, stok)
- **Read** — Lihat daftar & detail semua aset
- **Update** — Edit data aset termasuk status
- **Delete** — Hapus aset (tidak bisa dihapus jika masih ada peminjaman yang aktif: menunggu konfirmasi peminjaman, sedang dipinjam, atau menunggu konfirmasi pengembalian)

#### Kategori Aset:
| Kategori | Contoh Barang |
|---|---|
| Elektronik | Proyektor, Laptop, Kamera, Mikrofon |
| Alat Lab | Multimeter, Osiloskop, Breadboard, Power Supply |
| Alat Praktikum | Toolkit, Kabel Data, Modul Arduino/Raspberry Pi |
| Furnitur | Kursi Lipat, Meja Portable |
| Lainnya | Tripod, Extension Cord, Whiteboard Portable |

#### Field Aset:
| Field | Keterangan |
|---|---|
| Nama Barang | Nama aset kampus |
| Kategori | Jenis aset |
| Deskripsi | Keterangan tambahan (opsional) |
| Foto | Upload gambar (maks 5MB) |
| Stok | Jumlah unit tersedia |
| Status | Tersedia / Dipinjam / Rusak |
| QR Code | String unik auto-generated saat barang dibuat |

---

### 🔴 2. Status Aset Real-time

| Status | Keterangan |
|---|---|
| ✅ Tersedia | Aset bisa dipinjam (stok > 0) |
| 🔵 Dipinjam | Stok aset sedang 0 (semua unit sedang dipinjam / direservasi) |
| ❌ Rusak | Tidak bisa dipinjam, diset manual oleh admin |

- **Status "Tersedia"/"Dipinjam" dihitung otomatis secara live dari stok** (stok 0 → "Dipinjam", stok > 0 → "Tersedia") di halaman **Daftar Barang** maupun **Detail Barang**, sehingga badge status selalu sinkron dengan stok aktual
- Status **"Rusak"** tetap murni keputusan manual admin lewat form edit barang, tidak terpengaruh oleh nilai stok
- Stok langsung berkurang (direservasi) begitu user mengajukan peminjaman, **sebelum** admin konfirmasi — supaya barang yang sama tidak bisa diajukan pinjam dobel
- Jika admin **menolak** pengajuan peminjaman, stok dikembalikan otomatis
- Stok bertambah kembali (untuk alur pengembalian) hanya setelah admin **konfirmasi** pengembalian

---

### 🔄 3. Sirkulasi Peminjaman (Konfirmasi Dua Arah)

Baik peminjaman maupun pengembalian sama-sama melalui mekanisme pengajuan → konfirmasi admin, untuk memastikan verifikasi fisik barang di kedua ujung transaksi.

#### Tahap 1 — Pengajuan Peminjaman (User):
- User buka detail barang → isi jumlah & tanggal kembali → klik **Pinjam Barang**
- Validasi tanggal kembali:
  - Jika tanggal kembali belum diisi, muncul pesan peringatan berwarna merah **"Masukkan tanggal pengembalian"**
  - Tanggal kembali **tidak bisa dipilih sebelum hari ini** (date picker otomatis membatasi, dan divalidasi ulang di server)
- Stok langsung berkurang (direservasi) begitu diajukan
- Status loan: **pending** (ditampilkan sebagai **"Menunggu Konfirmasi Admin"**)
- Muncul keterangan: *"Silakan datang ke tempat peminjaman untuk konfirmasi admin."*

#### Tahap 2 — Konfirmasi / Penolakan Peminjaman (Admin):
- User datang membawa/menunjukkan diri secara fisik ke tempat peminjaman
- Admin buka **Semua Peminjaman** → filter **"Menunggu Konfirmasi Peminjaman"** → pilih salah satu:
  - **Konfirmasi Peminjaman** → status berubah jadi **borrowed** (**"Dipinjam"**), stok tetap berkurang (sudah direservasi sejak pengajuan)
  - **Tolak** → status berubah jadi **rejected** (**"Ditolak"**), stok dikembalikan otomatis

#### Tahap 3 — Pengajuan Pengembalian (User):
- User buka **Peminjaman Saya** → setiap item menampilkan tanggal pinjam dan **tanggal kembali (batas waktu)** yang diisi saat meminjam → klik **Ajukan Pengembalian** (hanya muncul untuk loan berstatus **borrowed**)
- Status loan berubah jadi **pending_return** (ditampilkan sebagai **"Menunggu Konfirmasi Admin"**)
- Stok **belum** berubah
- User menyerahkan barang fisik ke admin

#### Tahap 4 — Konfirmasi Pengembalian (Admin):
- Admin buka **Semua Peminjaman** → filter **"Menunggu Konfirmasi"** (pengembalian) → klik **Konfirmasi Diterima**
- Stok bertambah otomatis
- Status loan berubah jadi **returned** (ditampilkan sebagai **"Dikembalikan"**)

> Tabel **Semua Peminjaman** (admin) menampilkan kolom **Batas Kembali** (tanggal jatuh tempo yang diisi user) terpisah dari kolom **Tgl Kembali** (tanggal aktual saat admin konfirmasi pengembalian), lengkap dengan tanda ⚠️ untuk peminjaman yang sudah lewat batas waktu tapi belum dikembalikan.

---

### 📊 4. Dashboard Admin

Navigasi **Dashboard** ditempatkan paling atas di sidebar, di atas menu lainnya.

Halaman ringkasan untuk admin berisi:
- Total aset terdaftar
- Total pengguna aktif
- Jumlah peminjaman aktif (pending + borrowed + pending_return)
- Jumlah menunggu konfirmasi peminjaman
- Jumlah menunggu konfirmasi pengembalian
- Jumlah sudah dikembalikan
- Tabel peminjaman yang **terlambat** dikembalikan (melewati due date), lengkap nama & NIM peminjam serta nama barang
- Tabel barang paling sering dipinjam (top 5, dihitung dari seluruh riwayat peminjaman)

---

### 📋 5. Laporan Peminjaman

#### Admin:
- Lihat seluruh riwayat peminjaman dengan detail peminjam & barang
- Filter berdasarkan **status** (`pending`, `borrowed`, `pending_return`, `returned`, `rejected`) dan **periode tanggal**
- Ringkasan card: total transaksi, menunggu konfirmasi peminjaman, dipinjam, menunggu konfirmasi pengembalian, dikembalikan, ditolak
- Tabel detail menampilkan kolom **Batas Kembali** dan **Tgl Kembali** secara terpisah
- Highlight baris merah untuk peminjaman yang **terlambat**
- **Export ke CSV** — download file laporan sesuai filter aktif

#### User:
- Lihat riwayat peminjaman sendiri, lengkap dengan tanggal pinjam dan tanggal kembali (batas waktu)
- Status ditampilkan sebagai **"Menunggu Konfirmasi Admin"** (pending/pending_return), **"Dipinjam"**, **"Dikembalikan"**, atau **"Ditolak"**
- Filter berdasarkan status (label filter mengikuti penamaan status di atas)
- Ajukan pengembalian langsung dari halaman ini (khusus loan berstatus **borrowed**)

---

### 👤 6. Manajemen Pengguna (Admin)

Halaman baru khusus admin untuk memantau pengguna terdaftar di sistem.

- Lihat daftar seluruh user: **NIM**, **nama**, **email**, **role** (Admin/Pengguna), dan **total peminjaman** yang pernah diajukan
- Pencarian user berdasarkan nama, email, atau NIM
- (Backend) Endpoint detail per user (`GET /api/users/:id`) juga tersedia untuk menampilkan riwayat peminjaman lengkap milik satu user, siap dipakai kalau nanti dibuatkan halaman detail

> Fitur ini saat ini bersifat **read-only** — admin belum bisa mengubah role, menonaktifkan, atau menghapus akun user langsung dari sini.

---

## 🗄️ Database Schema

### users
| Field | Type | Keterangan |
|---|---|---|
| id | INT | Primary key, auto increment |
| nim | VARCHAR | NIM unik (8–12 digit angka) |
| name | VARCHAR | Nama lengkap |
| email | VARCHAR | Email unik |
| passwordHash | VARCHAR | Password terenkripsi (bcrypt) |
| role | STRING | `admin` / `user` (default: `user`) |

### items
| Field | Type | Keterangan |
|---|---|---|
| id | INT | Primary key, auto increment |
| name | VARCHAR | Nama aset |
| category | VARCHAR | Kategori aset |
| description | TEXT | Deskripsi (nullable) |
| photo | VARCHAR | Path foto aset (nullable) |
| stock | INT | Jumlah stok tersedia (default: 0) |
| status | STRING | `tersedia` / `dipinjam` / `rusak` (default: `tersedia`) — nilai `tersedia`/`dipinjam` hanya relevan sebagai fallback; tampilan di frontend dihitung live dari `stock` |
| qrCode | VARCHAR | String unik auto-generated untuk label QR fisik (nullable, unique) |

### loans
| Field | Type | Keterangan |
|---|---|---|
| id | INT | Primary key, auto increment |
| userId | INT | FK ke `users.id` |
| itemId | INT | FK ke `items.id` |
| qty | INT | Jumlah unit yang dipinjam |
| borrowDate | DATETIME | Waktu pengajuan peminjaman (default: now) |
| dueDate | DATETIME | Batas waktu pengembalian (tidak boleh sebelum tanggal hari ini saat dibuat) |
| returnDate | DATETIME | Waktu konfirmasi pengembalian oleh admin (nullable) |
| status | STRING | `pending` / `borrowed` / `pending_return` / `returned` / `rejected` (default: `pending`) |
| qrCode | VARCHAR | String unik untuk identifikasi transaksi via QR (nullable, unique) |

> Alur status loan: `pending` (baru diajukan, stok sudah direservasi) → `borrowed` (dikonfirmasi admin) **atau** `rejected` (ditolak admin, stok dikembalikan) → `pending_return` (user ajukan pengembalian) → `returned` (admin konfirmasi terima fisik barang, stok bertambah).
---

## ⚙️ Setup & Installation

### Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org) versi LTS (direkomendasikan v18 atau v20)
- [Laragon](https://laragon.net) (sudah include MySQL & phpMyAdmin)
- Git

Cek versi Node.js:
```bash
node -v
npm -v
```

---

### 1. Clone Repository

```bash
git clone <repo-url>
cd pinjamin
```

---

### 2. Setup Database

1. Buka **Laragon** → klik **Start All**
2. Buka **phpMyAdmin** di `http://localhost/phpmyadmin`
3. Buat database baru bernama `pinjamin`

---

### 3. Setup Backend

Masuk ke folder backend:
```bash
cd "backend"
```

Install dependencies:
```bash
npm install
```

Buat file `.env` di dalam folder `backend/`:
```env
DATABASE_URL="mysql://root:@localhost:3306/pinjamin"
JWT_SECRET=rahasia_negara
JWT_EXPIRES_IN=60m
PORT=3000
```

Jalankan migrasi Prisma:
```bash
npx prisma migrate dev --name init
```

Jalankan script untuk membuat akun admin pertama :

```bash
node create-admin.js
```

Jalankan backend:
```bash
npm run dev
```

Backend berjalan di `http://localhost:3000`

---

### 4. Setup Frontend

Buka terminal baru, masuk ke folder frontend:
```bash
cd "frontend"
```

Install dependencies:
```bash
npm install
```

Jalankan frontend:
```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`

---

### 5. Akses Aplikasi

Buka browser ke:
```
http://localhost:5173
```

Login admin default:
```
Email    : admin@pinjamin.com
Password : admin
```

---

## 🌐 Service Ports

| Service | Port |
|---|---|
| Frontend (Vite) | 5173 |
| Backend API (Express) | 3000 |
| MySQL | 3306 |
| phpMyAdmin | 80 |

---

## 📦 Project Structure

```text
pinjamin/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   │
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js            # Register, Login
│   │   │   ├── items.js           # CRUD Aset + upload foto + QR code
│   │   │   ├── loans.js           # Pengajuan/konfirmasi/tolak peminjaman & pengembalian
│   │   │   ├── reports.js         # Dashboard, laporan, export CSV
│   │   │   └── users.js           # Daftar & detail user (admin)
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT middleware + adminOnly guard
│   │   │
│   │   ├── uploads/               # Folder foto aset (auto-created)
│   │   └── app.js                 # Entry point Express
│   │
│   ├── create-admin.js            # Script buat akun admin pertama
│   ├── .env
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx         # Sidebar navigasi (Dashboard di atas, lalu Menu)
│       │   └── ProtectedRoute.jsx # Guard route berdasarkan role
│       │
│       ├── pages/
│       │   ├── Login.jsx          # Form login
│       │   ├── Register.jsx       # Form register (role user)
│       │   ├── Dashboard.jsx      # Ringkasan statistik (admin)
│       │   ├── Items.jsx          # Daftar aset kampus (status live dari stok)
│       │   ├── ItemDetail.jsx     # Detail aset & form pinjam (validasi tanggal kembali)
│       │   ├── ItemForm.jsx       # Tambah / edit aset (admin)
│       │   ├── Loans.jsx          # Semua peminjaman, konfirmasi/tolak pinjam & konfirmasi kembali (admin)
│       │   ├── MyLoans.jsx        # Riwayat, status pengajuan, & pengajuan pengembalian (user)
│       │   ├── Users.jsx          # Daftar & pencarian user (admin)
│       │   ├── Reports.jsx        # Laporan lengkap + export CSV (admin)
│       │   └── NotFound.jsx       # Halaman 404
│       │
│       ├── services/
│       │   ├── api.js             # Axios instance + interceptor JWT
│       │   ├── authService.js     # Login, register, logout
│       │   └── itemService.js     # Semua API call (items, loans, users, reports)
│       │
│       ├── context/
│       │   └── AuthContext.jsx    # Global auth state
│       │
│       └── App.jsx                # Router + layout sidebar
│
└── README.md
```

---

## 🧪 Demo Scenario (Untuk Presentasi)

### Persiapan
1. Pastikan Laragon running, backend & frontend sudah `npm run dev`
2. Buka `http://localhost:5173`

---

### Sesi Admin

3. **Login** dengan `admin@pinjamin.com` / `admin` → otomatis masuk ke **Dashboard**
4. Dashboard menampilkan: total aset, total pengguna, peminjaman aktif, menunggu konfirmasi peminjaman, menunggu konfirmasi pengembalian, sudah dikembalikan, tabel keterlambatan, dan barang paling sering dipinjam
5. Klik **Tambah Barang** di sidebar (Dashboard ada paling atas, menu lain di bawahnya) → isi form (nama, kategori, stok, foto) → simpan
6. Buka **Daftar Barang** → aset baru muncul dengan status **Tersedia** (status ini otomatis berubah jadi **Dipinjam** begitu stoknya 0, tanpa perlu admin edit manual)
7. Buka **Daftar User** di sidebar → cek daftar seluruh user terdaftar beserta total peminjamannya, coba fitur pencarian by nama/email/NIM

---

### Sesi User

8. Buka tab baru → **Register** akun baru (isi NIM 8 digit, nama, email, password)
9. **Login** sebagai user → otomatis masuk ke **Daftar Barang**
10. Pilih aset yang tersedia → klik **Detail**
11. Coba klik **Pinjam Barang** tanpa mengisi tanggal kembali → muncul pesan merah **"Masukkan tanggal pengembalian"**
12. Isi jumlah & tanggal kembali (tanggal sebelum hari ini tidak bisa dipilih) → klik **Pinjam Barang**
13. Stok berkurang otomatis, muncul pesan **"Pengajuan peminjaman berhasil. Silakan datang ke tempat peminjaman untuk konfirmasi admin."**
14. Buka **Peminjaman Saya** → status loan: **Menunggu Konfirmasi Admin**, beserta tanggal kembali yang sudah diisi

---

### Kembali ke Admin (Konfirmasi Peminjaman)

15. Login kembali sebagai admin → buka **Semua Peminjaman**
16. Filter **"Menunggu Konfirmasi Peminjaman"** → muncul pengajuan dari user tadi
17. Pastikan user sudah datang secara fisik → klik **Konfirmasi Peminjaman** → status berubah jadi **Dipinjam** (atau klik **Tolak** jika barang tidak jadi diserahkan → status **Ditolak**, stok otomatis dikembalikan)

---

### Sesi User (Pengembalian)

18. Login kembali sebagai user tadi → buka **Peminjaman Saya** → status sekarang **Dipinjam** → klik **Ajukan Pengembalian** → status berubah jadi **Menunggu Konfirmasi Admin**

---

### Kembali ke Admin (Konfirmasi Pengembalian)

19. Login kembali sebagai admin → buka **Semua Peminjaman**
20. Filter **"Menunggu Konfirmasi"** (pengembalian) → muncul pengajuan pengembalian dari user tadi, lengkap kolom **Batas Kembali**
21. Klik **Konfirmasi Diterima** → stok bertambah, status jadi **Dikembalikan**
22. Buka **Laporan** → transaksi tadi muncul lengkap (peminjam, barang, waktu pinjam, batas kembali, waktu kembali), dan card ringkasan menampilkan angka yang akurat untuk setiap status
23. Klik **Export CSV** → file laporan ter-download sesuai filter aktif

---

## 👥 Tim

- Arya Gama


---

## 📝 Catatan

- Project ini dibuat untuk kebutuhan pembelajaran saja
- Akun admin dibuat manual via script `create-admin.js` — registrasi publik hanya untuk role user
- Peminjaman maupun pengembalian sama-sama menggunakan mekanisme dua tahap (pengajuan user → konfirmasi/tolak admin) untuk memastikan verifikasi fisik barang di kedua ujung transaksi
- Stok direservasi (dikurangi) sejak peminjaman **diajukan**, bukan menunggu konfirmasi admin — supaya tidak ada pengajuan ganda untuk stok yang sama; jika ditolak admin, stok dikembalikan otomatis
- Status "Tersedia"/"Dipinjam" pada aset dihitung live dari nilai stok, bukan field manual — hanya status "Rusak" yang masih bisa diset manual oleh admin
- Foto aset disimpan lokal di folder `backend/src/uploads/` dan diakses via endpoint `/uploads/`
- Export CSV menggunakan direct URL dengan token di query param — tidak melalui interceptor Axios
- Halaman **Daftar User** untuk admin saat ini bersifat read-only (belum ada fitur edit role/hapus user)

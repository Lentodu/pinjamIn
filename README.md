# 📦 Pinjamin

**Pinjamin** adalah aplikasi manajemen peminjaman aset kampus berbasis web yang dikembangkan untuk memenuhi tugas mata kuliah **Sistem Terdistribusi**.

Sistem ini dirancang untuk membantu pengelolaan peminjaman peralatan dan aset milik kampus — mulai dari peralatan elektronik hingga alat laboratorium dan praktikum — secara terdigitalisasi dan terpusat.

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
- **Delete** — Hapus aset (tidak bisa dihapus jika sedang dipinjam atau pending return)

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
| ✅ Tersedia | Aset bisa dipinjam |
| 🔵 Dipinjam | Sedang dalam peminjaman aktif |
| ❌ Rusak | Tidak bisa dipinjam, dapat diset manual oleh admin |

- Stok berkurang otomatis saat barang dipinjam
- Stok bertambah kembali hanya setelah admin **konfirmasi** pengembalian
- Admin bisa ubah status ke **Rusak** secara manual via form edit barang

---

### 🔄 3. Sirkulasi Peminjaman (Dua Tahap)

Pengembalian melalui dua tahap untuk memastikan verifikasi fisik sebelum stok diperbarui.

#### Tahap 1 — Peminjaman (User):
- User buka detail barang → isi jumlah & tanggal kembali → klik **Pinjam Barang**
- Stok berkurang otomatis
- Status loan: **borrowed**

#### Tahap 2 — Pengajuan Pengembalian (User):
- User buka **Peminjaman Saya** → klik **Ajukan Pengembalian**
- Status loan berubah jadi **pending_return**
- Stok **belum** berubah
- User menyerahkan barang fisik ke admin

#### Tahap 3 — Konfirmasi Pengembalian (Admin):
- Admin buka **Semua Peminjaman** → filter "Menunggu" → klik **Konfirmasi Diterima**
- Stok bertambah otomatis
- Status loan berubah jadi **returned**

---

### 📊 4. Dashboard Admin

Halaman ringkasan untuk admin berisi:
- Total aset terdaftar
- Total pengguna aktif
- Jumlah peminjaman aktif (borrowed + pending_return)
- Jumlah menunggu konfirmasi pengembalian
- Tabel peminjaman yang **terlambat** dikembalikan (melewati due date)
- Tabel barang paling sering dipinjam

---

### 📋 5. Laporan Peminjaman

#### Admin:
- Lihat seluruh riwayat peminjaman dengan detail peminjam & barang
- Filter berdasarkan **status** dan **periode tanggal**
- Ringkasan total transaksi, dipinjam, menunggu konfirmasi, dikembalikan
- Highlight baris merah untuk peminjaman yang **terlambat**
- **Export ke CSV** — download file laporan sesuai filter aktif

#### User:
- Lihat riwayat peminjaman sendiri
- Filter berdasarkan status
- Ajukan pengembalian langsung dari halaman ini

---

## 🗄️ Database Schema

### users
| Field | Type | Keterangan |
|---|---|---|
| id | INT | Primary key |
| nim | VARCHAR | NIM unik (8–12 digit angka) |
| name | VARCHAR | Nama lengkap |
| email | VARCHAR | Email unik |
| passwordHash | VARCHAR | Password terenkripsi (bcrypt) |
| role | STRING | admin / user |

### items
| Field | Type | Keterangan |
|---|---|---|
| id | INT | Primary key |
| name | VARCHAR | Nama aset |
| category | VARCHAR | Kategori aset |
| description | TEXT | Deskripsi (nullable) |
| photo | VARCHAR | Path foto aset (nullable) |
| stock | INT | Jumlah stok tersedia |
| status | STRING | tersedia / dipinjam / rusak |
| qrCode | VARCHAR | String unik untuk QR label fisik |

### loans
| Field | Type | Keterangan |
|---|---|---|
| id | INT | Primary key |
| userId | INT | FK ke users |
| itemId | INT | FK ke items |
| qty | INT | Jumlah dipinjam |
| borrowDate | DATETIME | Waktu peminjaman |
| dueDate | DATETIME | Batas waktu pengembalian |
| returnDate | DATETIME | Waktu konfirmasi pengembalian (nullable) |
| status | STRING | borrowed / pending_return / returned |

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
cd "backend 2"
```

Install dependencies:
```bash
npm install
```

Buat file `.env` di dalam folder `backend 2/`:
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

Buat akun admin pertama — buat file `create-admin.js` di folder `backend 2/`:
```js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin', 10);
  const user = await prisma.user.create({
    data: {
      nim: '00000000',
      name: 'Admin',
      email: 'admin@pinjamin.com',
      passwordHash: hash,
      role: 'admin'
    }
  });
  console.log('Admin dibuat:', user.email);
  await prisma.$disconnect();
}

main();
```

Jalankan script:
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
cd "frontend 2"
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
├── backend 2/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   │
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js            # Register, Login
│   │   │   ├── items.js           # CRUD Aset + upload foto + QR code
│   │   │   ├── loans.js           # Peminjaman, pengajuan & konfirmasi pengembalian
│   │   │   └── reports.js         # Dashboard, laporan, export CSV
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
├── frontend 2/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx         # Sidebar navigasi (admin & user)
│       │   └── ProtectedRoute.jsx # Guard route berdasarkan role
│       │
│       ├── pages/
│       │   ├── Login.jsx          # Form login
│       │   ├── Register.jsx       # Form register (role user)
│       │   ├── Dashboard.jsx      # Ringkasan statistik (admin)
│       │   ├── Items.jsx          # Daftar aset kampus
│       │   ├── ItemDetail.jsx     # Detail aset & form pinjam
│       │   ├── ItemForm.jsx       # Tambah / edit aset (admin)
│       │   ├── Loans.jsx          # Semua peminjaman & konfirmasi (admin)
│       │   ├── MyLoans.jsx        # Riwayat & pengajuan pengembalian (user)
│       │   ├── Reports.jsx        # Laporan lengkap + export CSV (admin)
│       │   └── NotFound.jsx       # Halaman 404
│       │
│       ├── services/
│       │   ├── api.js             # Axios instance + interceptor JWT
│       │   ├── authService.js     # Login, register, logout
│       │   └── itemService.js     # Semua API call (items, loans, reports)
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
4. Dashboard menampilkan: total aset, total pengguna, peminjaman aktif, menunggu konfirmasi
5. Klik **Tambah Barang** di sidebar → isi form (nama, kategori, stok, foto) → simpan
6. Buka **Daftar Barang** → aset baru muncul dengan status **Tersedia**

---

### Sesi User

7. Buka tab baru → **Register** akun baru (isi NIM 8 digit, nama, email, password)
8. **Login** sebagai user → otomatis masuk ke **Daftar Barang**
9. Pilih aset yang tersedia → klik **Detail**
10. Isi jumlah & tanggal kembali → klik **Pinjam Barang**
11. Stok berkurang otomatis, muncul pesan "Peminjaman berhasil"
12. Buka **Peminjaman Saya** → status loan: **Aktif**
13. Klik **Ajukan Pengembalian** → status berubah jadi **Menunggu Konfirmasi Admin**

---

### Kembali ke Admin

14. Login kembali sebagai admin → buka **Semua Peminjaman**
15. Filter "Menunggu" → muncul pengajuan pengembalian dari user tadi
16. Klik **Konfirmasi Diterima** → stok bertambah, status jadi **Selesai**
17. Buka **Laporan** → transaksi tadi muncul lengkap (peminjam, barang, waktu pinjam, waktu kembali)
18. Klik **Export CSV** → file laporan ter-download sesuai filter aktif

---

## 👥 Tim

- Nama Anggota 1
- Nama Anggota 2
- Nama Anggota 3

---

## 📝 Catatan

- Project ini dibuat untuk kebutuhan pembelajaran mata kuliah Sistem Terdistribusi
- Akun admin dibuat manual via script `create-admin.js` — registrasi publik hanya untuk role user
- Pengembalian menggunakan mekanisme dua tahap (pengajuan user → konfirmasi admin) untuk memastikan verifikasi fisik sebelum stok & status sistem diperbarui
- Foto aset disimpan lokal di folder `backend 2/src/uploads/` dan diakses via endpoint `/uploads/`
- Export CSV menggunakan direct URL dengan token di query param — tidak melalui interceptor Axios

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

### Database
- MySQL (via Laragon)

---

## 🧠 System Architecture

```text
┌─────────────────────┐
│     React App       │  → Frontend (port 5173)
└─────────┬───────────┘
          │ HTTP Request
          ▼
┌─────────────────────┐
│   Express.js API    │  → Backend (port 3000)
│   - Auth Routes     │
│   - Item Routes     │
│   - Loan Routes     │
│   - Report Routes   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│       MySQL         │  → Database (port 3306)
└─────────────────────┘
```

> Arsitektur monolithic dipilih untuk menyederhanakan development dan deployment, dengan pemisahan domain logic melalui modular routing.

---

## ✨ Features

### 🔐 Authentication
- Register akun mahasiswa / staff
- Login user
- JWT-based authentication
- Role-based access (Admin & User)

---

### 🗂️ 1. Manajemen Data Aset Kampus (CRUD Barang)

#### Admin dapat:
- **Create** — Tambah aset baru (nama, kategori, foto, stok)
- **Read** — Lihat daftar & detail semua aset
- **Update** — Edit data aset
- **Delete** — Hapus aset

#### Kategori Aset Kampus:
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
| Foto | Upload gambar barang |
| Stok | Jumlah unit tersedia |
| Status | Tersedia / Dipinjam / Rusak |

---

### 🔴 2. Status Aset Real-time

Setiap aset memiliki status yang diperbarui otomatis:

| Status | Keterangan |
|---|---|
| ✅ Tersedia | Aset bisa dipinjam |
| 🔵 Dipinjam | Sedang dalam peminjaman |
| ❌ Rusak | Tidak bisa dipinjam |

- Status berubah otomatis saat barang dipinjam atau dikembalikan
- Admin dapat mengubah status ke **Rusak** secara manual

---

### 🔄 3. Sirkulasi Peminjaman

#### Check-out (Peminjaman):
- Mahasiswa / staff memilih aset yang tersedia
- Sistem mencatat nama peminjam & waktu peminjaman
- Stok berkurang otomatis
- Status aset berubah jadi **Dipinjam**

#### Check-in (Pengembalian):
- Peminjam melakukan pengembalian aset
- Sistem mencatat waktu pengembalian
- Stok bertambah otomatis
- Status aset berubah kembali jadi **Tersedia**

---

### 📊 4. Laporan Peminjaman

#### Admin:
- Lihat **seluruh riwayat peminjaman** (siapa meminjam apa dan kapan)
- Filter berdasarkan status (dipinjam / dikembalikan)
- Ringkasan total transaksi, aktif, dan selesai

#### User (Mahasiswa/Staff):
- Lihat **riwayat peminjaman sendiri**
- Status peminjaman aktif & selesai

---

## 🗄️ Database Schema

### users
| Field | Type | Keterangan |
|---|---|---|
| id | INT | Primary key |
| name | VARCHAR | Nama user |
| email | VARCHAR | Email unik |
| passwordHash | VARCHAR | Password terenkripsi |
| role | STRING | admin / user |

---

### items
| Field | Type | Keterangan |
|---|---|---|
| id | INT | Primary key |
| name | VARCHAR | Nama aset |
| category | VARCHAR | Kategori aset |
| description | TEXT | Deskripsi aset |
| photo | VARCHAR | Path foto aset |
| stock | INT | Jumlah stok |
| status | STRING | tersedia / dipinjam / rusak |

---

### loans
| Field | Type | Keterangan |
|---|---|---|
| id | INT | Primary key |
| userId | INT | FK ke users |
| itemId | INT | FK ke items |
| qty | INT | Jumlah dipinjam |
| borrowDate | DATETIME | Waktu peminjaman |
| returnDate | DATETIME | Waktu pengembalian |
| status | STRING | borrowed / returned |

---

## ⚙️ Setup & Installation

### 1. Prasyarat
- [Node.js](https://nodejs.org) (versi LTS)
- [Laragon](https://laragon.net) (sudah include MySQL + phpMyAdmin)

---

### 2. Clone Repository

```bash
git clone <repo-url>
cd pinjamin
```

---

### 3. Setup Database

1. Buka Laragon → Start All
2. Buka phpMyAdmin di `http://localhost/phpmyadmin`
3. Buat database baru bernama `pinjamin`

---

### 4. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/pinjamin"
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=60m
PORT=3000
```

Jalankan migrasi database:

```bash
npx prisma migrate dev
```

Buat akun admin pertama via phpMyAdmin (tab SQL):

```sql
INSERT INTO User (name, email, passwordHash, role)
VALUES ('Admin', 'admin@pinjamin.com', '$2b$10$XA5M8tCvX2XJFQf2dGnHae6Va.F.Lr7DrDEGlVK3tOLgsPo1Pjo9q', 'admin');
```

> Password default: `admin`

Jalankan backend:

```bash
npm run dev
```

---

### 5. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Akses di:
```
http://localhost:5173
```

---

## 🌐 Service Ports

| Service | Port |
|---|---|
| Frontend | 5173 |
| Backend API | 3000 |
| MySQL | 3306 |
| phpMyAdmin | 80 |

---

## 📦 Project Structure

```text
pinjamin/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   │
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js          # Register, Login
│   │   │   ├── items.js         # CRUD Aset
│   │   │   ├── loans.js         # Peminjaman & Pengembalian
│   │   │   └── reports.js       # Laporan & Riwayat
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT Middleware
│   │   │
│   │   ├── uploads/             # Folder foto aset
│   │   └── app.js               # Entry point
│   │
│   ├── .env
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       │
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx        # Laporan admin
│       │   ├── Items.jsx            # Daftar aset kampus
│       │   ├── ItemDetail.jsx       # Detail aset & form pinjam
│       │   ├── ItemForm.jsx         # Tambah/Edit aset (Admin)
│       │   ├── Loans.jsx            # Semua peminjaman (Admin)
│       │   └── MyLoans.jsx          # Riwayat peminjaman user
│       │
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   └── itemService.js
│       │
│       ├── context/
│       │   └── AuthContext.jsx
│       │
│       └── App.jsx
│
└── README.md
```

---

## 🧪 Demo Scenario (Untuk Presentasi)

1. **Login** sebagai Admin
2. Admin **tambah aset kampus** (proyektor, laptop, alat lab, dll)
3. Admin lihat **daftar aset** dengan status real-time
4. **Register** akun mahasiswa baru → **Login** sebagai User
5. User lihat daftar aset → pilih aset → **pinjam**
6. Status aset otomatis berubah jadi **Dipinjam**, stok berkurang
7. Admin lihat **laporan peminjaman** (siapa meminjam apa dan kapan)
8. User **kembalikan aset**
9. Status kembali **Tersedia**, stok terupdate

---

## 👥 Tim

- Nama Anggota 1
- Nama Anggota 2
- Nama Anggota 3

---

## 📝 Catatan

- Project ini dibuat untuk kebutuhan pembelajaran mata kuliah Sistem Terdistribusi
- Arsitektur monolithic dengan modular routing dipilih untuk kemudahan development
- MySQL digunakan sebagai database utama via Laragon
- Akun admin dibuat manual via phpMyAdmin, registrasi publik hanya untuk user biasa

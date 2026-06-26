const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto"); // Modul bawaan Node.js buat bikin QR string
const { PrismaClient } = require("@prisma/client");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Multer config — simpan foto ke src/uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// GET /api/items — semua user bisa lihat
router.get("/", authenticate, async (req, res) => {
  try {
    const items = await prisma.item.findMany({ orderBy: { id: "asc" } });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/items/:id — detail barang
router.get("/:id", authenticate, async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!item) return res.status(404).json({ message: "Barang tidak ditemukan" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/items — Admin only
router.post("/", authenticate, adminOnly, upload.single("photo"), async (req, res) => {
  const { name, category, description, stock } = req.body;

  if (!name || !category || stock === undefined) {
    return res.status(400).json({ message: "Nama, kategori, dan stok wajib diisi" });
  }

  try {
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const qrCode = crypto.randomUUID(); // Bikin string unik buat QR fisik barang

    const item = await prisma.item.create({
      data: {
        name,
        category,
        description: description || null,
        photo,
        stock: parseInt(stock),
        status: "tersedia",
        qrCode: qrCode, // Simpan ke database
      },
    });
    res.status(201).json({ message: "Barang berhasil ditambahkan", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/items/:id — Admin only
router.put("/:id", authenticate, adminOnly, upload.single("photo"), async (req, res) => {
  const { name, category, description, stock, status } = req.body;

  try {
    const existing = await prisma.item.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ message: "Barang tidak ditemukan" });

    const photo = req.file ? `/uploads/${req.file.filename}` : existing.photo;

    const item = await prisma.item.update({
      where: { id: Number(req.params.id) },
      data: {
        name: name ?? existing.name,
        category: category ?? existing.category,
        description: description ?? existing.description,
        photo,
        stock: stock !== undefined ? parseInt(stock) : existing.stock,
        status: status ?? existing.status,
      },
    });
    res.json({ message: "Barang berhasil diupdate", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/items/:id — Admin only
router.delete("/:id", authenticate, adminOnly, async (req, res) => {
  const itemId = Number(req.params.id);

  try {
    const existing = await prisma.item.findUnique({ where: { id: itemId } });
    if (!existing) return res.status(404).json({ message: "Barang tidak ditemukan" });

    // Cek apakah ada transaksi yang masih aktif (belum beres)
    const activeLoan = await prisma.loan.findFirst({
      where: {
        itemId: itemId,
        status: { in: ["borrowed", "pending_return"] }
      }
    });

    if (activeLoan) {
      return res.status(400).json({ 
        message: "Barang tidak bisa dihapus karena sedang dipinjam atau menunggu konfirmasi pengembalian." 
      });
    }

    await prisma.item.delete({ where: { id: itemId } });
    res.json({ message: "Barang berhasil dihapus" });
    
  } catch (err) {
    console.error(err);
    // Tangkap error relasi database (kalau barang punya riwayat peminjaman yang udah 'returned')
    if (err.code === 'P2003') {
      return res.status(400).json({ 
        message: "Barang tidak bisa dihapus karena memiliki riwayat transaksi peminjaman. Cukup ubah stok jadi 0 atau statusnya." 
      });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
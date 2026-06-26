const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/loans — User: pinjam barang
router.post("/", authenticate, async (req, res) => {
  const { itemId, qty, dueDate } = req.body;

  if (!itemId || !qty || !dueDate) {
    return res.status(400).json({ message: "itemId, qty, dan dueDate wajib diisi" });
  }

  // Validasi tanggal kembali tidak boleh sebelum hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsedDueDate = new Date(dueDate);
  parsedDueDate.setHours(0, 0, 0, 0);
  if (parsedDueDate < today) {
    return res.status(400).json({ message: "Tanggal pengembalian tidak boleh sebelum hari ini" });
  }

  try {
    const item = await prisma.item.findUnique({ where: { id: Number(itemId) } });
    if (!item) return res.status(404).json({ message: "Barang tidak ditemukan" });
    if (item.stock < qty) return res.status(400).json({ message: "Stok tidak mencukupi" });

    const loan = await prisma.loan.create({
      data: {
        userId: req.user.id,
        itemId: Number(itemId),
        qty: Number(qty),
        dueDate: new Date(dueDate),
        status: "borrowed",
        borrowDate: new Date(),
      },
    });

    await prisma.item.update({
      where: { id: Number(itemId) },
      data: { stock: item.stock - Number(qty) },
    });

    res.status(201).json({ message: "Peminjaman berhasil", loan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/loans/my — User: lihat peminjaman sendiri
router.get("/my", authenticate, async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.user.id },
      include: {
        item: { select: { id: true, name: true, category: true, photo: true } },
      },
      orderBy: { borrowDate: "desc" },
    });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/loans — Admin: semua peminjaman
router.get("/", authenticate, adminOnly, async (req, res) => {
  const { status } = req.query;
  const where = {};
  if (status) where.status = status;

  try {
    const loans = await prisma.loan.findMany({
      where,
      include: {
        user: { select: { id: true, nim: true, name: true, email: true } },
        item: { select: { id: true, name: true, category: true, photo: true } },
      },
      orderBy: { borrowDate: "desc" },
    });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/loans/:id/return — User: ajukan pengembalian
router.put("/:id/return", authenticate, async (req, res) => {
  try {
    const loan = await prisma.loan.findUnique({ where: { id: Number(req.params.id) } });
    if (!loan) return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
    if (loan.userId !== req.user.id) return res.status(403).json({ message: "Bukan peminjaman kamu" });
    if (loan.status !== "borrowed") return res.status(400).json({ message: "Status tidak valid untuk dikembalikan" });

    const updated = await prisma.loan.update({
      where: { id: Number(req.params.id) },
      data: { status: "pending_return" },
    });

    res.json({ message: "Pengajuan pengembalian berhasil", loan: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/loans/:id/confirm-return — Admin: konfirmasi pengembalian
router.put("/:id/confirm-return", authenticate, adminOnly, async (req, res) => {
  try {
    const loan = await prisma.loan.findUnique({ where: { id: Number(req.params.id) } });
    if (!loan) return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
    if (loan.status !== "pending_return") return res.status(400).json({ message: "Belum diajukan pengembalian" });

    const updated = await prisma.loan.update({
      where: { id: Number(req.params.id) },
      data: { status: "returned", returnDate: new Date() },
    });

    await prisma.item.update({
      where: { id: loan.itemId },
      data: { stock: { increment: loan.qty } },
    });

    res.json({ message: "Pengembalian dikonfirmasi", loan: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/loans — User meminjam barang (check-out)
router.post("/", authenticate, async (req, res) => {
  const { itemId, qty } = req.body;

  if (!itemId || !qty || qty < 1) {
    return res.status(400).json({ message: "itemId dan qty wajib diisi" });
  }

  try {
    const item = await prisma.item.findUnique({ where: { id: Number(itemId) } });
    if (!item) return res.status(404).json({ message: "Barang tidak ditemukan" });

    if (item.status === "rusak") {
      return res.status(400).json({ message: "Barang sedang rusak, tidak bisa dipinjam" });
    }
    if (item.stock < qty) {
      return res.status(400).json({ message: `Stok tidak cukup. Tersedia: ${item.stock}` });
    }

    const newStock = item.stock - qty;
    const newStatus = newStock === 0 ? "dipinjam" : item.status;

    const [loan] = await prisma.$transaction([
      prisma.loan.create({
        data: {
          userId: req.user.id,
          itemId: Number(itemId),
          qty: Number(qty),
          status: "borrowed",
        },
      }),
      prisma.item.update({
        where: { id: Number(itemId) },
        data: { stock: newStock, status: newStatus },
      }),
    ]);

    res.status(201).json({ message: "Peminjaman berhasil", loan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/loans/:id/return — User mengajukan pengembalian (belum final)
// Stok BELUM ditambah di sini — menunggu konfirmasi admin yang sudah cek fisik barang
router.put("/:id/return", authenticate, async (req, res) => {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!loan) return res.status(404).json({ message: "Data peminjaman tidak ditemukan" });
    if (loan.status !== "borrowed") {
      return res.status(400).json({ message: "Peminjaman ini tidak bisa diajukan untuk dikembalikan" });
    }

    // Hanya pemilik peminjaman atau admin yang boleh mengajukan pengembalian
    if (req.user.role !== "admin" && loan.userId !== req.user.id) {
      return res.status(403).json({ message: "Tidak diizinkan" });
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: Number(req.params.id) },
      data: { status: "pending_return" },
    });

    res.json({ message: "Pengajuan pengembalian dikirim, menunggu konfirmasi admin", loan: updatedLoan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/loans/:id/confirm-return — Admin only
// Dipakai setelah admin cek fisik barang benar-benar diterima kembali
router.put("/:id/confirm-return", authenticate, adminOnly, async (req, res) => {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: Number(req.params.id) },
      include: { item: true },
    });

    if (!loan) return res.status(404).json({ message: "Data peminjaman tidak ditemukan" });
    if (loan.status !== "pending_return") {
      return res.status(400).json({ message: "Peminjaman ini belum diajukan untuk dikembalikan" });
    }

    const newStock = loan.item.stock + loan.qty;

    const [updatedLoan] = await prisma.$transaction([
      prisma.loan.update({
        where: { id: Number(req.params.id) },
        data: { status: "returned", returnDate: new Date() },
      }),
      prisma.item.update({
        where: { id: loan.itemId },
        data: {
          stock: newStock,
          status: newStock > 0 ? "tersedia" : loan.item.status,
        },
      }),
    ]);

    res.json({ message: "Pengembalian dikonfirmasi", loan: updatedLoan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/loans/my — Riwayat peminjaman user sendiri
router.get("/my", authenticate, async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.user.id },
      include: { item: { select: { name: true, category: true, photo: true } } },
      orderBy: { borrowDate: "desc" },
    });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/loans — Admin: semua riwayat peminjaman
router.get("/", authenticate, adminOnly, async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        user: { select: { name: true, email: true } },
        item: { select: { name: true, category: true } },
      },
      orderBy: { borrowDate: "desc" },
    });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
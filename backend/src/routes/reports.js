const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/dashboard — Admin: Statistik ringkas untuk halaman Dashboard
router.get("/dashboard", authenticate, adminOnly, async (req, res) => {
  try {
    const totalItems = await prisma.item.count();
    const totalUsers = await prisma.user.count({ where: { role: "user" } });
    
    // Menghitung transaksi yang sedang berjalan (dipinjam atau sedang diajukan kembali)
    const activeLoans = await prisma.loan.count({
      where: {
        status: { in: ["borrowed", "pending_return"] }
      }
    });

    const pendingReturns = await prisma.loan.count({
      where: { status: "pending_return" }
    });

    res.json({
      totalItems,
      totalUsers,
      activeLoans,
      pendingReturns
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reports — Admin: Laporan rekap administratif dengan filter status & periode (bisa untuk CSV)
// Query param: ?status=borrowed|pending_return|returned & startDate=YYYY-MM-DD & endDate=YYYY-MM-DD
router.get("/", authenticate, adminOnly, async (req, res) => {
  const { status, startDate, endDate } = req.query;

  const where = {};
  
  // Bug fix: Memasukkan pending_return ke dalam daftar status yang valid
  const validStatuses = ["borrowed", "pending_return", "returned"];
  if (status && validStatuses.includes(status)) {
    where.status = status;
  }

  // Filter periode waktu untuk mendukung ekspor CSV
  if (startDate || endDate) {
    where.borrowDate = {};
    if (startDate) {
      where.borrowDate.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Set ke jam 23:59:59 agar mencakup transaksi di hari tersebut
      where.borrowDate.lte = end;
    }
  }

  try {
    const loans = await prisma.loan.findMany({
      where,
      include: {
        // Menambahkan pengambilan NIM agar tampil di laporan admin
        user: { select: { id: true, nim: true, name: true, email: true, role: true } }, 
        item: { select: { id: true, name: true, category: true, photo: true } },
      },
      orderBy: { borrowDate: "desc" },
    });

    // Bug fix: pending_return kini ikut dihitung dalam rekapitulasi summary
    const summary = {
      total: loans.length,
      borrowed: loans.filter((l) => l.status === "borrowed").length,
      pending_return: loans.filter((l) => l.status === "pending_return").length,
      returned: loans.filter((l) => l.status === "returned").length,
    };

    res.json({ summary, loans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reports/items — Admin: Ringkasan status semua barang
router.get("/items", authenticate, adminOnly, async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      orderBy: { name: "asc" },
      include: {
        loans: {
          // Menyertakan pending_return karena barang fisik secara teknis belum dikonfirmasi kembali
          where: { status: { in: ["borrowed", "pending_return"] } }, 
          select: { id: true, qty: true, status: true, user: { select: { name: true, nim: true } }, borrowDate: true },
        },
      },
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
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

    const returned = await prisma.loan.count({
      where: { status: "returned" }
    });

    // Peminjaman yang sudah lewat batas kembali tapi belum dikembalikan
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: { in: ["borrowed", "pending_return"] },
        dueDate: { lt: new Date() },
      },
      include: {
        user: { select: { name: true, nim: true } },
        item: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    // Barang paling sering dipinjam (top 5, dihitung dari seluruh riwayat)
    const grouped = await prisma.loan.groupBy({
      by: ["itemId"],
      _count: { itemId: true },
      orderBy: { _count: { itemId: "desc" } },
      take: 5,
    });
    const groupedItems = await prisma.item.findMany({
      where: { id: { in: grouped.map((g) => g.itemId) } },
      select: { id: true, name: true, category: true },
    });
    const topItems = grouped.map((g) => {
      const item = groupedItems.find((i) => i.id === g.itemId);
      return {
        name: item?.name ?? "Barang tidak ditemukan",
        category: item?.category ?? "-",
        totalPinjam: g._count.itemId,
      };
    });

    res.json({
      totalItems,
      totalUsers,
      activeLoans,
      pendingReturns,
      returned,
      overdueLoans,
      topItems
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
      pendingReturn: loans.filter((l) => l.status === "pending_return").length,
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

// GET /api/reports/export — Admin: export CSV
router.get("/export", async (req, res) => {
  const { status, startDate, endDate, token } = req.query;

  // Auth via query token (karena ini dibuka langsung di browser)
  if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });
  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia_negara");
    if (decoded.role !== "admin") return res.status(403).json({ message: "Akses ditolak" });
  } catch {
    return res.status(401).json({ message: "Token tidak valid" });
  }

  const where = {};
  const validStatuses = ["borrowed", "pending_return", "returned"];
  if (status && validStatuses.includes(status)) where.status = status;
  if (startDate || endDate) {
    where.borrowDate = {};
    if (startDate) where.borrowDate.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.borrowDate.lte = end;
    }
  }

  try {
    const loans = await prisma.loan.findMany({
      where,
      include: {
        user: { select: { nim: true, name: true, email: true } },
        item: { select: { name: true, category: true } },
      },
      orderBy: { borrowDate: "desc" },
    });

    const rows = [
      ["No", "NIM", "Nama", "Email", "Barang", "Kategori", "Qty", "Tgl Pinjam", "Tgl Kembali", "Status"],
      ...loans.map((l, i) => [
        i + 1,
        l.user.nim,
        l.user.name,
        l.user.email,
        l.item.name,
        l.item.category,
        l.qty,
        new Date(l.borrowDate).toLocaleDateString("id-ID"),
        l.returnDate ? new Date(l.returnDate).toLocaleDateString("id-ID") : "-",
        l.status,
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=laporan.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
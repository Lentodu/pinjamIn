const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports — Admin: laporan lengkap dengan filter status
// Query param: ?status=borrowed | returned
router.get("/", authenticate, adminOnly, async (req, res) => {
  const { status } = req.query;

  const where = {};
  if (status === "borrowed" || status === "returned") {
    where.status = status;
  }

  try {
    const loans = await prisma.loan.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        item: { select: { id: true, name: true, category: true, photo: true } },
      },
      orderBy: { borrowDate: "desc" },
    });

    const summary = {
      total: loans.length,
      borrowed: loans.filter((l) => l.status === "borrowed").length,
      returned: loans.filter((l) => l.status === "returned").length,
    };

    res.json({ summary, loans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reports/items — Admin: ringkasan status semua barang
router.get("/items", authenticate, adminOnly, async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      orderBy: { name: "asc" },
      include: {
        loans: {
          where: { status: "borrowed" },
          select: { id: true, qty: true, user: { select: { name: true } }, borrowDate: true },
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
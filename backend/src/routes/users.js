const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users — Admin: lihat semua user
router.get("/", authenticate, adminOnly, async (req, res) => {
  const { search } = req.query;
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { nim: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  try {
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nim: true,
        name: true,
        email: true,
        role: true,
        _count: { select: { loans: true } },
      },
      orderBy: { name: "asc" },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users/:id — Admin: lihat detail user + riwayat peminjaman
router.get("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true,
        nim: true,
        name: true,
        email: true,
        role: true,
        loans: {
          include: {
            item: { select: { id: true, name: true, category: true, photo: true } },
          },
          orderBy: { borrowDate: "desc" },
        },
      },
    });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
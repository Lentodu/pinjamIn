const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { nim, name, email, password } = req.body;

  if (!nim || !name || !email || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  // Validasi baru: Wajib murni angka (0-9) dengan panjang 8 sampai 12 digit
  const nimRegex = /^[0-9]{8,12}$/;
  if (!nimRegex.test(nim)) {
    return res.status(400).json({ message: "Format NIM tidak valid, harus berupa angka 8-12 digit" });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { nim }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email atau NIM sudah terdaftar" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        nim,
        name,
        email,
        passwordHash,
        role: "user", // Hardcode role menjadi user biasa (keamanan admin)
      },
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user: { id: user.id, nim: user.nim, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Perbaikan: Ditambahkan string fallback "rahasia_negara" jika env tidak terbaca
    const token = jwt.sign(
      { id: user.id, nim: user.nim, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || "rahasia_negara", 
      { expiresIn: process.env.JWT_EXPIRES_IN || "60m" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: { id: user.id, nim: user.nim, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Detail Error Login:", err); // Biar kelihatan di terminal kalau ada error lain
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
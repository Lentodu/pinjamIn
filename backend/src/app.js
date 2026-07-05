require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const loanRoutes = require("./routes/loans");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Pinjamin API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Letakkan ini setelah semua router (misal setelah app.use('/api/loans', loanRoutes))
app.use((req, res, next) => {
  res.status(404).json({ message: "Route API tidak ditemukan" });
});
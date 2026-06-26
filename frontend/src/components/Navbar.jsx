import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Pinjamin</Link>
      </div>
      <div className="navbar-links">
        <Link to="/items">Barang</Link>
        {user?.role === "admin" && (
          <>
            <Link to="/items/new">Tambah Barang</Link>
            <Link to="/loans">Semua Peminjaman</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/reports">Laporan</Link>
          </>
        )}
        {user?.role === "user" && (
          <Link to="/my-loans">Peminjaman Saya</Link>
        )}
        <span className="navbar-user">👤 {user?.name}</span>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}
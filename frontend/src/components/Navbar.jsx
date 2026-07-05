import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Pinjam<span>in</span>
      </div>

      {user?.role === "admin" && (
        <div className="sidebar-section">
          <Link to="/dashboard" className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}>
            <span>Dashboard</span>
          </Link>
        </div>
      )}

      <div className="sidebar-section">
        <div className="sidebar-section-title">Menu</div>
        <Link to="/items" className={`sidebar-link ${isActive("/items") ? "active" : ""}`}>
          <span>Daftar Barang</span>
        </Link>

        {user?.role === "user" && (
          <Link to="/my-loans" className={`sidebar-link ${isActive("/my-loans") ? "active" : ""}`}>
            <span>Peminjaman Saya</span>
          </Link>
        )}

        {user?.role === "admin" && (
          <>
            <Link to="/loans" className={`sidebar-link ${isActive("/loans") ? "active" : ""}`}>
              <span>Semua Peminjaman</span>
            </Link>
            <Link to="/items/new" className={`sidebar-link ${isActive("/items/new") ? "active" : ""}`}>
              <span>Tambah Barang</span>
            </Link>
            <Link to="/users" className={`sidebar-link ${isActive("/users") ? "active" : ""}`}>
              <span>Daftar User</span>
            </Link>
          </>
        )}
      </div>

      {user?.role === "admin" && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">Analitik</div>
          <Link to="/reports" className={`sidebar-link ${isActive("/reports") ? "active" : ""}`}>
            <span>Laporan</span>
          </Link>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role === "admin" ? "Admin" : "Pengguna"}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout">Keluar</button>
      </div>
    </aside>
  );
}
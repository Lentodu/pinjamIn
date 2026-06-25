import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getItem, borrowItem } from "../services/itemService";
import { useAuth } from "../context/AuthContext";

const STATUS_LABEL = {
  tersedia: { label: "Tersedia", className: "badge-green" },
  dipinjam: { label: "Dipinjam", className: "badge-blue" },
  rusak: { label: "Rusak", className: "badge-red" },
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getItem(id)
      .then(setItem)
      .catch(() => navigate("/items"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBorrow = async () => {
    if (qty < 1 || qty > item.stock) return;
    setBorrowing(true);
    setMessage("");
    try {
      await borrowItem(item.id, qty);
      setMessage("Peminjaman berhasil!");
      const updated = await getItem(id);
      setItem(updated);
    } catch (err) {
      setMessage("" + (err.response?.data?.message || "Gagal meminjam"));
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) return <div className="page-container">Memuat...</div>;
  if (!item) return null;

  const status = STATUS_LABEL[item.status] || { label: item.status, className: "badge-gray" };

  return (
    <div className="page-container">
      <Link to="/items" className="back-link">← Kembali</Link>
      <div className="detail-card">
        {item.photo ? (
          <img
            src={`http://localhost:3000${item.photo}`}
            alt={item.name}
            className="detail-photo"
          />
        ) : (
          <div className="detail-photo-placeholder"></div>
        )}
        <div className="detail-info">
          <h2>{item.name}</h2>
          <p className="item-category">{item.category}</p>
          {item.description && <p>{item.description}</p>}
          <p>Stok tersedia: <strong>{item.stock}</strong></p>
          <span className={`badge ${status.className}`}>{status.label}</span>

          {message && <p className="info-msg">{message}</p>}

          {user?.role === "user" && item.status !== "rusak" && item.stock > 0 && (
            <div className="borrow-form">
              <label>Jumlah yang dipinjam:</label>
              <input
                type="number"
                min={1}
                max={item.stock}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
              <button onClick={handleBorrow} className="btn-primary" disabled={borrowing}>
                {borrowing ? "Memproses..." : "Pinjam Barang"}
              </button>
            </div>
          )}

          {user?.role === "admin" && (
            <div className="detail-actions">
              <Link to={`/items/${item.id}/edit`} className="btn-secondary">Edit Barang</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
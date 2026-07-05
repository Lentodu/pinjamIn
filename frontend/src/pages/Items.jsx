import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getItems, deleteItem } from "../services/itemService";
import { useAuth } from "../context/AuthContext";

const STATUS_LABEL = {
  tersedia: { label: "Tersedia", className: "badge-green" },
  dipinjam: { label: "Dipinjam", className: "badge-blue" },
  rusak: { label: "Rusak", className: "badge-red" },
};

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const fetchItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch {
      setError("Gagal memuat data barang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus barang ini?")) return;
    try {
      await deleteItem(id);
      setItems(items.filter((i) => i.id !== id));
    } catch {
      alert("Gagal menghapus barang");
    }
  };

  if (loading) return <div className="page-container">Memuat...</div>;
  if (error) return <div className="page-container error-msg">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Daftar Barang</h2>
        {user?.role === "admin" && (
          <Link to="/items/new" className="btn-primary">+ Tambah Barang</Link>
        )}
      </div>

      {items.length === 0 ? (
        <p>Belum ada barang.</p>
      ) : (
        <div className="items-grid">
          {items.map((item) => {
            const effectiveStatus = item.status === "rusak" ? "rusak" : (item.stock === 0 ? "dipinjam" : "tersedia");
            const status = STATUS_LABEL[effectiveStatus] || { label: effectiveStatus, className: "badge-gray" };
            return (
              <div key={item.id} className="item-card">
                {item.photo ? (
                  <img
                    src={`http://localhost:3000${item.photo}`}
                    alt={item.name}
                    className="item-photo"
                  />
                ) : (
                  <div className="item-photo-placeholder">📦</div>
                )}
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  <p>Stok: <strong>{item.stock}</strong></p>
                  <span className={`badge ${status.className}`}>{status.label}</span>
                </div>
                <div className="item-actions">
                  <Link to={`/items/${item.id}`} className="btn-secondary">Detail</Link>
                  {user?.role === "admin" && (
                    <>
                      <Link to={`/items/${item.id}/edit`} className="btn-secondary">Edit</Link>
                      <button onClick={() => handleDelete(item.id)} className="btn-danger">Hapus</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
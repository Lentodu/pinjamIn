import { useEffect, useState } from "react";
import { getMyLoans, returnItem } from "../services/itemService";

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchLoans = async () => {
    try {
      const data = await getMyLoans();
      setLoans(data);
    } catch {
      alert("Gagal memuat data peminjaman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleReturn = async (loanId) => {
    if (!confirm("Kembalikan barang ini?")) return;
    try {
      await returnItem(loanId);
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengembalikan");
    }
  };

  const filtered = filter === "all" ? loans : loans.filter((l) => l.status === filter);

  if (loading) return <div className="page-container">Memuat...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Peminjaman Saya</h2>
        <div className="filter-group">
          {["all", "borrowed", "returned"].map((f) => (
            <button
              key={f}
              className={filter === f ? "btn-primary" : "btn-secondary"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Semua" : f === "borrowed" ? "Aktif" : "Selesai"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p>Belum ada riwayat peminjaman.</p>
      ) : (
        <div className="loans-list">
          {filtered.map((loan) => (
            <div key={loan.id} className="loan-card">
              {loan.item?.photo && (
                <img
                  src={`http://localhost:3000${loan.item.photo}`}
                  alt={loan.item.name}
                  className="loan-photo"
                />
              )}
              <div className="loan-info">
                <h3>{loan.item?.name}</h3>
                <p>{loan.item?.category}</p>
                <p>Jumlah: <strong>{loan.qty}</strong></p>
                <p>Dipinjam: {new Date(loan.borrowDate).toLocaleDateString("id-ID")}</p>
                {loan.returnDate && (
                  <p>Dikembalikan: {new Date(loan.returnDate).toLocaleDateString("id-ID")}</p>
                )}
                <span className={`badge ${loan.status === "borrowed" ? "badge-blue" : "badge-green"}`}>
                  {loan.status === "borrowed" ? "Aktif" : "Selesai"}
                </span>
              </div>
              {loan.status === "borrowed" && (
                <button className="btn-secondary" onClick={() => handleReturn(loan.id)}>
                  Kembalikan
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
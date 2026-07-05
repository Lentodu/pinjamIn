import { useEffect, useState } from "react";
import { getMyLoans, returnItem } from "../services/itemService";

const STATUS_LABEL = {
  pending: { label: "Menunggu Konfirmasi Peminjaman", className: "badge-yellow" },
  borrowed: { label: "Dipinjam", className: "badge-blue" },
  pending_return: { label: "Menunggu Konfirmasi Pengembalian", className: "badge-yellow" },
  returned: { label: "Dikembalikan", className: "badge-green" },
  rejected: { label: "Ditolak", className: "badge-red" },
};

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
    if (!confirm("Ajukan pengembalian barang ini? Serahkan barang fisik ke admin untuk konfirmasi.")) return;
    try {
      await returnItem(loanId);
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengajukan pengembalian");
    }
  };

  const filtered = filter === "all" ? loans : loans.filter((l) => l.status === filter);

  if (loading) return <div className="page-container">Memuat...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Peminjaman Saya</h2>
        <div className="filter-group">
          {["all", "pending", "borrowed", "pending_return", "returned", "rejected"].map((f) => (
            <button
              key={f}
              className={filter === f ? "btn-primary" : "btn-secondary"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Semua" : STATUS_LABEL[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p>Belum ada riwayat peminjaman.</p>
      ) : (
        <div className="loans-list">
          {filtered.map((loan) => {
            const status = STATUS_LABEL[loan.status] || { label: loan.status, className: "badge-gray" };
            return (
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
                  <p>Tanggal kembali: {new Date(loan.dueDate).toLocaleDateString("id-ID")}</p>
                  {loan.returnDate && (
                    <p>Dikembalikan: {new Date(loan.returnDate).toLocaleDateString("id-ID")}</p>
                  )}
                  <span className={`badge ${status.className}`}>{status.label}</span>
                  {loan.status === "pending" && (
                    <p className="info-msg">Silakan datang ke tempat peminjaman untuk konfirmasi admin.</p>
                  )}
                  {loan.status === "pending_return" && (
                    <p className="info-msg">Serahkan barang ke admin untuk dikonfirmasi.</p>
                  )}
                </div>
                {loan.status === "borrowed" && (
                  <button className="btn-secondary" onClick={() => handleReturn(loan.id)}>
                    Ajukan Pengembalian
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
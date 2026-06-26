import { useEffect, useState } from "react";
import { getAllLoans, confirmReturn } from "../services/itemService";

const STATUS_LABEL = {
  borrowed: { label: "Dipinjam", className: "badge-blue" },
  pending_return: { label: "Menunggu Konfirmasi", className: "badge-yellow" },
  returned: { label: "Dikembalikan", className: "badge-green" },
};

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchLoans = async () => {
    try {
      const data = await getAllLoans();
      setLoans(data);
    } catch {
      alert("Gagal memuat data peminjaman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleConfirm = async (loanId) => {
    if (!confirm("Konfirmasi barang sudah diterima fisiknya?")) return;
    try {
      await confirmReturn(loanId);
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memproses konfirmasi");
    }
  };

  const filtered = filter === "all" ? loans : loans.filter((l) => l.status === filter);

  if (loading) return <div className="page-container">Memuat...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Semua Peminjaman</h2>
        <div className="filter-group">
          {["all", "borrowed", "pending_return", "returned"].map((f) => (
            <button
              key={f}
              className={filter === f ? "btn-primary" : "btn-secondary"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Semua" : f === "borrowed" ? "Dipinjam" : f === "pending_return" ? "Menunggu" : "Dikembalikan"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p>Tidak ada data.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Peminjam</th>
                <th>Barang</th>
                <th>Qty</th>
                <th>Tgl Pinjam</th>
                <th>Tgl Kembali</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((loan) => {
                const status = STATUS_LABEL[loan.status] || { label: loan.status, className: "badge-gray" };
                return (
                  <tr key={loan.id}>
                    <td>
                      <strong>{loan.user?.name}</strong>
                      <br /><small>{loan.user?.email}</small>
                    </td>
                    <td>{loan.item?.name}<br /><small>{loan.item?.category}</small></td>
                    <td>{loan.qty}</td>
                    <td>{new Date(loan.borrowDate).toLocaleDateString("id-ID")}</td>
                    <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString("id-ID") : "-"}</td>
                    <td>
                      <span className={`badge ${status.className}`}>{status.label}</span>
                    </td>
                    <td>
                      {loan.status === "pending_return" && (
                        <button className="btn-secondary" onClick={() => handleConfirm(loan.id)}>
                          Konfirmasi Diterima
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
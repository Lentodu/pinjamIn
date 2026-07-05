import { useEffect, useState } from "react";
import { getAllLoans, confirmReturn, confirmLoan, rejectLoan } from "../services/itemService";
import { IconAlertTriangle } from "../components/Icons";

const STATUS_LABEL = {
  pending: { label: "Menunggu Konfirmasi Peminjaman", className: "badge-yellow" },
  borrowed: { label: "Dipinjam", className: "badge-blue" },
  pending_return: { label: "Menunggu Konfirmasi Pengembalian", className: "badge-yellow" },
  returned: { label: "Dikembalikan", className: "badge-green" },
  rejected: { label: "Ditolak", className: "badge-red" },
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

  const handleConfirmReturn = async (loanId) => {
    if (!confirm("Konfirmasi barang sudah diterima fisiknya?")) return;
    try {
      await confirmReturn(loanId);
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memproses konfirmasi");
    }
  };

  const handleConfirmLoan = async (loanId) => {
    if (!confirm("Konfirmasi peminjaman ini? Pastikan peminjam sudah datang ke tempat peminjaman.")) return;
    try {
      await confirmLoan(loanId);
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memproses konfirmasi");
    }
  };

  const handleRejectLoan = async (loanId) => {
    if (!confirm("Tolak pengajuan peminjaman ini? Stok akan dikembalikan.")) return;
    try {
      await rejectLoan(loanId);
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memproses penolakan");
    }
  };

  const filtered = filter === "all" ? loans : loans.filter((l) => l.status === filter);

  if (loading) return <div className="page-container">Memuat...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Semua Peminjaman</h2>
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
                <th>Batas Kembali</th>
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
                    <td className={["borrowed", "pending_return"].includes(loan.status) && new Date(loan.dueDate) < new Date() ? "text-danger" : ""}>
                      {new Date(loan.dueDate).toLocaleDateString("id-ID")}
                      {["borrowed", "pending_return"].includes(loan.status) && new Date(loan.dueDate) < new Date() && (
                        <IconAlertTriangle width={14} height={14} className="icon-inline-danger" />
                      )}
                    </td>
                    <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString("id-ID") : "-"}</td>
                    <td>
                      <span className={`badge ${status.className}`}>{status.label}</span>
                    </td>
                    <td>
                      {loan.status === "pending" && (
                        <div className="action-group">
                          <button className="btn-primary" onClick={() => handleConfirmLoan(loan.id)}>
                            Konfirmasi Peminjaman
                          </button>
                          <button className="btn-secondary" onClick={() => handleRejectLoan(loan.id)}>
                            Tolak
                          </button>
                        </div>
                      )}
                      {loan.status === "pending_return" && (
                        <button className="btn-secondary" onClick={() => handleConfirmReturn(loan.id)}>
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
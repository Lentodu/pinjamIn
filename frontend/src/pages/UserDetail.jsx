import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getUserDetail } from "../services/itemService";
import { IconAlertTriangle } from "../components/Icons";

const STATUS_LABEL = {
  pending: { label: "Menunggu Konfirmasi Peminjaman", className: "badge-yellow" },
  borrowed: { label: "Dipinjam", className: "badge-blue" },
  pending_return: { label: "Menunggu Konfirmasi Pengembalian", className: "badge-yellow" },
  returned: { label: "Dikembalikan", className: "badge-green" },
  rejected: { label: "Ditolak", className: "badge-red" },
};

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserDetail(id)
      .then(setUser)
      .catch(() => navigate("/users"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-container">Memuat...</div>;
  if (!user) return null;

  const loans = user.loans || [];
  const totalAktif = loans.filter((l) => ["pending", "borrowed", "pending_return"].includes(l.status)).length;
  const totalTerlambat = loans.filter(
    (l) => ["borrowed", "pending_return"].includes(l.status) && new Date(l.dueDate) < new Date()
  ).length;

  return (
    <div className="page-container">
      <Link to="/users" className="back-link">← Kembali ke Daftar User</Link>

      <div className="detail-card">
        <div className="detail-info">
          <h2>{user.name}</h2>
          <p className="item-category">{user.email}</p>
          <p>NIM: <strong>{user.nim}</strong></p>
          <span className={`badge ${user.role === "admin" ? "badge-blue" : "badge-gray"}`}>
            {user.role === "admin" ? "Admin" : "Pengguna"}
          </span>

          <div className="stat-row">
            <div className="stat-box">
              <div className="stat-number">{loans.length}</div>
              <div className="stat-label">Total Peminjaman</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{totalAktif}</div>
              <div className="stat-label">Sedang Berjalan</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{totalTerlambat}</div>
              <div className="stat-label">Terlambat</div>
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: "2rem" }}>Riwayat Peminjaman</h3>

      {loans.length === 0 ? (
        <p>User ini belum pernah mengajukan peminjaman.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Barang</th>
                <th>Qty</th>
                <th>Tgl Pinjam</th>
                <th>Batas Kembali</th>
                <th>Tgl Kembali</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => {
                const status = STATUS_LABEL[loan.status] || { label: loan.status, className: "badge-gray" };
                const terlambat = ["borrowed", "pending_return"].includes(loan.status) && new Date(loan.dueDate) < new Date();
                return (
                  <tr key={loan.id}>
                    <td>{loan.item?.name}<br /><small>{loan.item?.category}</small></td>
                    <td>{loan.qty}</td>
                    <td>{new Date(loan.borrowDate).toLocaleDateString("id-ID")}</td>
                    <td className={terlambat ? "text-danger" : ""}>
                      {new Date(loan.dueDate).toLocaleDateString("id-ID")}
                      {terlambat && <IconAlertTriangle width={14} height={14} className="icon-inline-danger" />}
                    </td>
                    <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString("id-ID") : "-"}</td>
                    <td>
                      <span className={`badge ${status.className}`}>{status.label}</span>
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
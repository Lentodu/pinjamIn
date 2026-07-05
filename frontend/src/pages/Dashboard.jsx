import { useEffect, useState } from "react";
import { getDashboard } from "../services/itemService";
import { IconBox, IconUsers, IconArrowUpRight, IconClock, IconCheckCircle } from "../components/Icons";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => alert("Gagal memuat dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container">Memuat dashboard...</div>;
  if (!data) return null;

 const stats = {
  totalItems: data.totalItems,
  totalUsers: data.totalUsers,
  borrowed: data.activeLoans,
  pendingReturn: data.pendingReturns,
  returned: data.returned ?? 0,
};
const overdueLoans = data.overdueLoans ?? [];
const topItems = data.topItems ?? [];

  return (
    <div className="page-container">
      <h2>Dashboard Admin</h2>

      {/* Statistik utama */}
      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-icon"><IconBox /></span>
          <div>
            <span className="summary-number">{stats.totalItems}</span>
            <span className="summary-label">Total Aset</span>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon"><IconUsers /></span>
          <div>
            <span className="summary-number">{stats.totalUsers}</span>
            <span className="summary-label">Pengguna Terdaftar</span>
          </div>
        </div>
        <div className="summary-card badge-blue">
          <span className="summary-icon"><IconArrowUpRight /></span>
          <div>
            <span className="summary-number">{stats.borrowed}</span>
            <span className="summary-label">Sedang Dipinjam</span>
          </div>
        </div>
        <div className="summary-card badge-yellow">
          <span className="summary-icon"><IconClock /></span>
          <div>
            <span className="summary-number">{stats.pendingReturn}</span>
            <span className="summary-label">Menunggu Konfirmasi</span>
          </div>
        </div>
        <div className="summary-card badge-green">
          <span className="summary-icon"><IconCheckCircle /></span>
          <div>
            <span className="summary-number">{stats.returned}</span>
            <span className="summary-label">Sudah Dikembalikan</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Terlambat dikembalikan */}
        <div className="dashboard-section">
          <h3>Terlambat Dikembalikan</h3>
          {overdueLoans.length === 0 ? (
            <p className="empty-msg">Tidak ada peminjaman yang terlambat.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Peminjam</th>
                    <th>Barang</th>
                    <th>Batas Kembali</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueLoans.map((loan) => (
                    <tr key={loan.id} className="row-overdue">
                      <td>
                        <strong>{loan.user?.name}</strong>
                        <br /><small>{loan.user?.nim}</small>
                      </td>
                      <td>{loan.item?.name}</td>
                      <td>{new Date(loan.dueDate).toLocaleDateString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Barang paling sering dipinjam */}
        <div className="dashboard-section">
          <h3>Barang Paling Sering Dipinjam</h3>
          {topItems.length === 0 ? (
            <p className="empty-msg">Belum ada data peminjaman.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Barang</th>
                    <th>Kategori</th>
                    <th>Total Pinjam</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td><strong>{item.totalPinjam}x</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
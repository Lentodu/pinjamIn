import { useEffect, useState } from "react";
import { getReports } from "../services/itemService";
import api from "../services/api";
import { IconBarChart, IconArrowUpRight, IconClock, IconCheckCircle, IconAlertTriangle } from "../components/Icons";

const STATUS_LABEL = {
  borrowed: { label: "Dipinjam", className: "badge-blue" },
  pending_return: { label: "Menunggu Konfirmasi", className: "badge-yellow" },
  returned: { label: "Dikembalikan", className: "badge-green" },
};

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({ status: "", startDate: "", endDate: "" });

  const fetchReport = async (f = filters) => {
    setLoading(true);
    try {
      const res = await getReports(f);
      setData(res);
    } catch {
      alert("Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = () => fetchReport(filters);

  const handleReset = () => {
    const reset = { status: "", startDate: "", endDate: "" };
    setFilters(reset);
    fetchReport(reset);
  };

  const handleExport = () => {
    const query = new URLSearchParams();
    if (filters.status) query.set("status", filters.status);
    if (filters.startDate) query.set("startDate", filters.startDate);
    if (filters.endDate) query.set("endDate", filters.endDate);

    const token = localStorage.getItem("token");
    if (token) query.set("token", token);

    window.open(`http://localhost:3000/api/reports/export?${query.toString()}`, "_blank");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Laporan Peminjaman</h2>
        <button className="btn-primary" onClick={handleExport} disabled={exporting}>
          {exporting ? "Mengekspor..." : "⬇ Export CSV"}
        </button>
      </div>

      {/* Filter */}
      <div className="filter-panel">
        <div className="filter-row">
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Semua Status</option>
              <option value="borrowed">Dipinjam</option>
              <option value="pending_return">Menunggu Konfirmasi</option>
              <option value="returned">Dikembalikan</option>
            </select>
          </div>
          <div className="form-group">
            <label>Dari Tanggal</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label>Sampai Tanggal</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
          <div className="filter-actions">
            <button className="btn-primary" onClick={handleApply}>Terapkan</button>
            <button className="btn-secondary" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Memuat laporan...</p>
      ) : (
        <>
          {/* Summary */}
          {data?.summary && (
            <div className="summary-cards" style={{ marginBottom: "1.5rem" }}>
              <div className="summary-card">
                <span className="summary-icon"><IconBarChart /></span>
                <div>
                  <span className="summary-number">{data.summary.total}</span>
                  <span className="summary-label">Total Transaksi</span>
                </div>
              </div>
              <div className="summary-card badge-blue">
                <span className="summary-icon"><IconArrowUpRight /></span>
                <div>
                  <span className="summary-number">{data.summary.borrowed}</span>
                  <span className="summary-label">Dipinjam</span>
                </div>
              </div>
              <div className="summary-card badge-yellow">
                <span className="summary-icon"><IconClock /></span>
                <div>
                  <span className="summary-number">{data.summary.pendingReturn}</span>
                  <span className="summary-label">Menunggu Konfirmasi</span>
                </div>
              </div>
              <div className="summary-card badge-green">
                <span className="summary-icon"><IconCheckCircle /></span>
                <div>
                  <span className="summary-number">{data.summary.returned}</span>
                  <span className="summary-label">Dikembalikan</span>
                </div>
              </div>
            </div>
          )}

          {/* Top items */}
          {data?.topItems?.length > 0 && (
            <div className="dashboard-section" style={{ marginBottom: "1.5rem" }}>
              <h3>Barang Paling Sering Dipinjam (Periode Ini)</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Barang</th><th>Jumlah Transaksi</th></tr>
                  </thead>
                  <tbody>
                    {data.topItems.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td><strong>{item.count}x</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tabel detail */}
          <h3>Detail Transaksi</h3>
          {data?.loans?.length === 0 ? (
            <p>Tidak ada data untuk filter yang dipilih.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Peminjam</th>
                    <th>NIM</th>
                    <th>Barang</th>
                    <th>Qty</th>
                    <th>Tgl Pinjam</th>
                    <th>Batas Kembali</th>
                    <th>Tgl Kembali</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.loans?.map((loan) => {
                    const isOverdue =
                      ["borrowed", "pending_return"].includes(loan.status) &&
                      new Date(loan.dueDate) < new Date();
                    const status = STATUS_LABEL[loan.status] || { label: loan.status, className: "badge-gray" };
                    return (
                      <tr key={loan.id} className={isOverdue ? "row-overdue" : ""}>
                        <td>
                          <strong>{loan.user?.name}</strong>
                          <br /><small>{loan.user?.email}</small>
                        </td>
                        <td>{loan.user?.nim}</td>
                        <td>{loan.item?.name}<br /><small>{loan.item?.category}</small></td>
                        <td>{loan.qty}</td>
                        <td>{new Date(loan.borrowDate).toLocaleDateString("id-ID")}</td>
                        <td className={isOverdue ? "text-danger" : ""}>
                          {new Date(loan.dueDate).toLocaleDateString("id-ID")}
                          {isOverdue && <IconAlertTriangle width={14} height={14} className="icon-inline-danger" />}
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
        </>
      )}
    </div>
  );
}
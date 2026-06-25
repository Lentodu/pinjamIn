import { useEffect, useState } from "react";
import { getReports } from "../services/itemService";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReport = async (status = "") => {
    setLoading(true);
    try {
      const res = await getReports(status);
      setData(res);
    } catch {
      alert("Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const handleFilter = (status) => {
    setFilter(status);
    fetchReport(status);
  };

  if (loading) return <div className="page-container">Memuat laporan...</div>;

  return (
    <div className="page-container">
      <h2>Laporan Peminjaman</h2>

      {data?.summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-number">{data.summary.total}</span>
            <span className="summary-label">Total Transaksi</span>
          </div>
          <div className="summary-card badge-blue">
            <span className="summary-number">{data.summary.borrowed}</span>
            <span className="summary-label">Sedang Dipinjam</span>
          </div>
          <div className="summary-card badge-green">
            <span className="summary-number">{data.summary.returned}</span>
            <span className="summary-label">Sudah Dikembalikan</span>
          </div>
        </div>
      )}

      <div className="page-header" style={{ marginTop: "1.5rem" }}>
        <h3>Detail Transaksi</h3>
        <div className="filter-group">
          {[["", "Semua"], ["borrowed", "Dipinjam"], ["returned", "Dikembalikan"]].map(([val, label]) => (
            <button
              key={val}
              className={filter === val ? "btn-primary" : "btn-secondary"}
              onClick={() => handleFilter(val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {data?.loans?.length === 0 ? (
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
              </tr>
            </thead>
            <tbody>
              {data?.loans?.map((loan) => (
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
                    <span className={`badge ${loan.status === "borrowed" ? "badge-blue" : "badge-green"}`}>
                      {loan.status === "borrowed" ? "Dipinjam" : "Dikembalikan"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
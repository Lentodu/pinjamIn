import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../services/itemService";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async (q = "") => {
    setLoading(true);
    try {
      const data = await getUsers(q);
      setUsers(data);
    } catch {
      alert("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Daftar User</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Cari nama, email, atau NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary">Cari</button>
        </form>
      </div>

      {loading ? (
        <p>Memuat...</p>
      ) : users.length === 0 ? (
        <p>Tidak ada user ditemukan.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>NIM</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Total Peminjaman</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="clickable-row" onClick={() => navigate(`/users/${u.id}`)}>
                  <td>{u.nim}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "badge-blue" : "badge-gray"}`}>
                      {u.role === "admin" ? "Admin" : "Pengguna"}
                    </span>
                  </td>
                  <td>{u._count?.loans ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
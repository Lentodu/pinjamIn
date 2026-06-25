import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItem, createItem, updateItem } from "../services/itemService";

const CATEGORIES = ["Elektronik", "Furnitur", "Alat Tulis", "Olahraga", "Lainnya"];
const STATUSES = ["tersedia", "dipinjam", "rusak"];

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "", category: "", description: "", stock: 1, status: "tersedia",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      getItem(id).then((item) => {
        setForm({
          name: item.name,
          category: item.category,
          description: item.description || "",
          stock: item.stock,
          status: item.status,
        });
        if (item.photo) setPreview(`http://localhost:3000${item.photo}`);
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("stock", form.stock);
    formData.append("status", form.status);
    if (photo) formData.append("photo", photo);

    try {
      if (isEdit) {
        await updateItem(id, formData);
      } else {
        await createItem(formData);
      }
      navigate("/items");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan barang");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>{isEdit ? "Edit Barang" : "Tambah Barang"}</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-group">
          <label>Nama Barang</label>
          <input
            type="text" name="name" value={form.name}
            onChange={handleChange} required placeholder="Nama barang"
          />
        </div>
        <div className="form-group">
          <label>Kategori</label>
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">-- Pilih Kategori --</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Deskripsi</label>
          <textarea
            name="description" value={form.description}
            onChange={handleChange} rows={3} placeholder="Deskripsi opsional"
          />
        </div>
        <div className="form-group">
          <label>Stok</label>
          <input
            type="number" name="stock" value={form.stock}
            onChange={handleChange} min={0} required
          />
        </div>
        {isEdit && (
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className="form-group">
          <label>Foto Barang</label>
          <input type="file" accept="image/*" onChange={handlePhoto} />
          {preview && <img src={preview} alt="preview" className="photo-preview" />}
        </div>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate("/items")}>
            Batal
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Barang"}
          </button>
        </div>
      </form>
    </div>
  );
}
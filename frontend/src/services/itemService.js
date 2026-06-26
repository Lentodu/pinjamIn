import api from "./api";

// ── Items ──────────────────────────────────────────
export const getItems = async () => {
  const res = await api.get("/items");
  return res.data;
};

export const getItem = async (id) => {
  const res = await api.get(`/items/${id}`);
  return res.data;
};

export const createItem = async (formData) => {
  const res = await api.post("/items", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateItem = async (id, formData) => {
  const res = await api.put(`/items/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteItem = async (id) => {
  const res = await api.delete(`/items/${id}`);
  return res.data;
};

// ── Loans ──────────────────────────────────────────
export const borrowItem = async (itemId, qty) => {
  const res = await api.post("/loans", { itemId, qty });
  return res.data;
};

// User mengajukan pengembalian (status -> pending_return)
export const returnItem = async (loanId) => {
  const res = await api.put(`/loans/${loanId}/return`);
  return res.data;
};

// Admin konfirmasi barang fisik sudah diterima (status -> returned, stok update)
export const confirmReturn = async (loanId) => {
  const res = await api.put(`/loans/${loanId}/confirm-return`);
  return res.data;
};

export const getMyLoans = async () => {
  const res = await api.get("/loans/my");
  return res.data;
};

export const getAllLoans = async () => {
  const res = await api.get("/loans");
  return res.data;
};

// ── Reports ──────────────────────────────────────────
export const getReports = async (status = "") => {
  const res = await api.get(`/reports${status ? `?status=${status}` : ""}`);
  return res.data;
};
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
export const borrowItem = async (itemId, qty, dueDate) => {
  const res = await api.post("/loans", { itemId, qty, dueDate });
  return res.data;
};

export const confirmLoan = async (loanId) => {
  const res = await api.put(`/loans/${loanId}/confirm`);
  return res.data;
};

export const rejectLoan = async (loanId) => {
  const res = await api.put(`/loans/${loanId}/reject`);
  return res.data;
};

export const returnItem = async (loanId) => {
  const res = await api.put(`/loans/${loanId}/return`);
  return res.data;
};

export const confirmReturn = async (loanId) => {
  const res = await api.put(`/loans/${loanId}/confirm-return`);
  return res.data;
};

export const getMyLoans = async () => {
  const res = await api.get("/loans/my");
  return res.data;
};

export const getAllLoans = async (status = "") => {
  const res = await api.get(`/loans${status ? `?status=${status}` : ""}`);
  return res.data;
};

// ── Users ──────────────────────────────────────────
export const getUsers = async (search = "") => {
  const res = await api.get(`/users${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  return res.data;
};

export const getUserDetail = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

// ── Dashboard ──────────────────────────────────────────
export const getDashboard = async () => {
  const res = await api.get("/reports/dashboard");
  return res.data;
};

// ── Reports ──────────────────────────────────────────
export const getReports = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  const res = await api.get(`/reports${query.toString() ? `?${query}` : ""}`);
  return res.data;
};

export const getReportExportUrl = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  const token = localStorage.getItem("token");
  if (token) query.set("token", token);
  return `http://localhost:3000/api/reports/export${query.toString() ? `?${query}` : ""}`;
};
import api from "./api";

export const register = async (name, nim, email, password) => {
  const res = await api.post("auth/register", { name, nim, email, password });
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post("auth/login", { email, password });
  const { token, user } = res.data;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
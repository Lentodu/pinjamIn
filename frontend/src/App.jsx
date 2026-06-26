import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import ItemDetail from "./pages/ItemDetail";
import ItemForm from "./pages/ItemForm";
import Loans from "./pages/Loans";
import MyLoans from "./pages/MyLoans";
import "./App.css";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
    </>
  );
}

// Redirect path "/" sesuai role: admin -> laporan, user -> daftar barang
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/reports" replace />;
  return <Navigate to="/items" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/items" element={
            <ProtectedRoute><Layout><Items /></Layout></ProtectedRoute>
          } />
          <Route path="/items/new" element={
            <ProtectedRoute adminOnly><Layout><ItemForm /></Layout></ProtectedRoute>
          } />
          <Route path="/items/:id" element={
            <ProtectedRoute><Layout><ItemDetail /></Layout></ProtectedRoute>
          } />
          <Route path="/items/:id/edit" element={
            <ProtectedRoute adminOnly><Layout><ItemForm /></Layout></ProtectedRoute>
          } />
          <Route path="/loans" element={
            <ProtectedRoute adminOnly><Layout><Loans /></Layout></ProtectedRoute>
          } />
          <Route path="/my-loans" element={
            <ProtectedRoute><Layout><MyLoans /></Layout></ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute adminOnly><Layout><Dashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
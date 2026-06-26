import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ fontSize: "72px", color: "#dc3545", marginBottom: "10px" }}>404</h1>
      <h2>Halaman Tidak Ditemukan</h2>
      <p style={{ color: "#6c757d", marginBottom: "30px" }}>
        Maaf, rute atau halaman yang Anda cari tidak tersedia di sistem.
      </p>
      
      {/* Tombol untuk kembali ke route utama */}
      <Link 
        to="/" 
        style={{ 
          padding: "10px 20px", 
          backgroundColor: "#0d6efd", 
          color: "white", 
          textDecoration: "none", 
          borderRadius: "5px" 
        }}
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;
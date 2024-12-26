import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Tasarım için ayrı bir CSS dosyası ekledik

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://edirnekupon-back.onrender.com/login", {
        username,
        password,
      });

      console.log(response.data); // Gelen yanıtı kontrol et
      
      const { role, restoranId } = response.data;

      if (restoranId) {
        localStorage.setItem("restoranId", restoranId);
      }

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "restoran") {
        navigate("/restoran");
      } else {
        setError("Geçersiz rol.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Giriş hatası");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Giriş Yap</h2>
      {error && <p className="login-error">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button type="submit" className="login-button">Giriş Yap</button>
      </form>
    </div>
  );
};

export default Login;

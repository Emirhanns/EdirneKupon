import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Admin.css"; // Tasarım için ayrı bir CSS dosyası ekledik

const Admin = () => {
  const [restoranlar, setRestoranlar] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
    restoranId: "",
  });
  const [newRestoran, setNewRestoran] = useState({ restoranName: "" });
  const [newKupon, setNewKupon] = useState({
    restoranId: "",
    kuponName: "",
    indirimDegeri: "",
    adet: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/get_restoranlar")
      .then((response) => {
        setRestoranlar(response.data);
      })
      .catch((error) => {
        console.error("Restoranları alırken bir hata oluştu", error);
      });
  }, []);

  const handleUserSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://127.0.0.1:5000/add_user", newUser)
      .then(() => {
        setMessage("Kullanıcı başarıyla oluşturuldu.");
        setNewUser({ username: "", password: "", role: "user", restoranId: "" });
      })
      .catch((error) => {
        setMessage("Kullanıcı oluşturulurken bir hata oluştu.");
        console.error(error);
      });
  };

  const handleRestoranSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://127.0.0.1:5000/add_restoran", newRestoran)
      .then(() => {
        setMessage("Restoran başarıyla eklendi.");
        setNewRestoran({ restoranName: "" });
      })
      .catch((error) => {
        setMessage("Restoran eklenirken bir hata oluştu.");
        console.error(error);
      });
  };

  const handleKuponSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://127.0.0.1:5000/add_kupon", {
        restoranId: newKupon.restoranId,
        kuponName: newKupon.kuponName,
        indirimDegeri: parseFloat(newKupon.indirimDegeri),
        adet: parseInt(newKupon.adet),
      })
      .then(() => {
        setMessage("Kupon başarıyla oluşturuldu.");
        setNewKupon({ restoranId: "", kuponName: "", indirimDegeri: "", adet: "" });
      })
      .catch((error) => {
        setMessage("Kupon oluşturulurken bir hata oluştu.");
        console.error(error.response ? error.response.data : error);
      });
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRestoranChange = (e) => {
    const { name, value } = e.target;
    setNewRestoran((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleKuponChange = (e) => {
    const { name, value } = e.target;
    setNewKupon((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Admin Paneli</h2>
      {message && <p className="admin-message">{message}</p>}

      <div className="admin-form-section">
        <h3>Yeni Kullanıcı Oluştur</h3>
        <form onSubmit={handleUserSubmit} className="admin-form">
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={newUser.username}
              onChange={handleUserChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleUserChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleUserChange}
            >
              <option value="user">Kullanıcı</option>
              <option value="admin">Admin</option>
              <option value="restoran">Restoran</option>
            </select>
          </div>
          <div className="form-group">
            <label>Restoran</label>
            <select
              name="restoranId"
              value={newUser.restoranId}
              onChange={handleUserChange}
              required
            >
              <option value="">Restoran Seçin</option>
              {restoranlar.map((restoran) => (
                <option key={restoran.restoranId} value={restoran.restoranId}>
                  {restoran.restoranName}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="admin-button">Kullanıcı Oluştur</button>
        </form>
      </div>

      <div className="admin-form-section">
        <h3>Yeni Restoran Ekle</h3>
        <form onSubmit={handleRestoranSubmit} className="admin-form">
          <div className="form-group">
            <label>Restoran Adı</label>
            <input
              type="text"
              name="restoranName"
              value={newRestoran.restoranName}
              onChange={handleRestoranChange}
              required
            />
          </div>
          <button type="submit" className="admin-button">Restoran Ekle</button>
        </form>
      </div>

      <div className="admin-form-section">
        <h3>Yeni Kupon Oluştur</h3>
        <form onSubmit={handleKuponSubmit} className="admin-form">
          <div className="form-group">
            <label>Restoran</label>
            <select
              name="restoranId"
              value={newKupon.restoranId}
              onChange={handleKuponChange}
              required
            >
              <option value="">Restoran Seçin</option>
              {restoranlar.map((restoran) => (
                <option key={restoran.restoranId} value={restoran.restoranId}>
                  {restoran.restoranName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>İndirim Değeri (%)</label>
            <input
              type="number"
              name="indirimDegeri"
              value={newKupon.indirimDegeri}
              onChange={handleKuponChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Adet</label>
            <input
              type="number"
              name="adet"
              value={newKupon.adet}
              onChange={handleKuponChange}
              required
            />
          </div>
          <button type="submit" className="admin-button">Kupon Oluştur</button>
        </form>
      </div>
    </div>
  );
};

export default Admin;

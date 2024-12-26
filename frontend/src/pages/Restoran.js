import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/Restoran.css"; // CSS dosyasını ekleyin

const Restoran = () => {
  const [kuponlar, setKuponlar] = useState([]);
  const [kuponInput, setKuponInput] = useState("");
  const [message, setMessage] = useState(null);
  const restoranId = localStorage.getItem("restoranId"); // Giriş yapan kullanıcının restoran ID'si

  // Restoran kuponlarını API'den çekme
  const fetchKuponlar = useCallback(async () => {
    try {
      const response = await axios.get(`https://edirnekupon-back.onrender.com/get_kuponlar/${restoranId}`);
      setKuponlar(response.data);
    } catch (err) {
      console.error("Kuponlar yüklenirken hata oluştu:", err);
    }
  }, [restoranId]); // restoranId bağımlılık olarak ekleniyor

  // İlk yüklemede kuponları çek
  useEffect(() => {
    fetchKuponlar();
  }, [fetchKuponlar]); // fetchKuponlar bağımlılıklar listesinde

  // Kupon doğrulama ve silme
  const handleKuponSubmit = async (e) => {
    e.preventDefault();

    const kupon = kuponlar.find((k) => k.kuponName === kuponInput);

    if (kupon) {
      if (!kupon._id) {
        console.error("Kuponun _id'si bulunamadı!");
        setMessage("Kupon doğrulama sırasında hata oluştu.");
        return;
      }

      try {
        await axios.delete(`https://edirnekupon-back.onrender.com/delete_kupon/${kupon._id}`);
        setMessage("Kuponunuz geçerli!"); // Geçerli kupon mesajı
        setKuponlar((prevKuponlar) => prevKuponlar.filter((k) => k._id !== kupon._id));
      } catch (err) {
        console.error("Kupon silinirken hata oluştu:", err);
        setMessage("Kupon doğrulama sırasında hata oluştu.");
      }
    } else {
      setMessage("Geçersiz kupon kodu."); // Hatalı kupon mesajı
    }

    setKuponInput(""); // Input alanını temizle
  };

  return (
    <div className="restoran-container">
      <h2 className="restoran-title">Restoran Kuponları</h2>

      <ul className="kupon-list">
        {kuponlar.map((kupon) => (
          <li key={kupon.kuponId} className="kupon-item">
            {kupon.kuponName} - %{kupon.indirimDegeri} indirim
          </li>
        ))}
      </ul>

      <form onSubmit={handleKuponSubmit} className="kupon-form">
        <input
          type="text"
          className="kupon-input"
          placeholder="Kupon kodu girin"
          value={kuponInput}
          onChange={(e) => setKuponInput(e.target.value)}
        />
        <button type="submit" className="kupon-button">Kuponu Doğrula</button>
      </form>

      {message && <p className="kupon-message">{message}</p>}
    </div>
  );
};

export default Restoran;

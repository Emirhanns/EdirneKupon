import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/Restoran.css"; // CSS dosyasını ekleyin

const Restoran = () => {
  const [kuponlar, setKuponlar] = useState([]);
  const [kuponInput, setKuponInput] = useState("");
  const [message, setMessage] = useState(null);
  const [kuponSelect, setKuponSelect] = useState(""); // Seçilen kupon
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
  
    const kupon = kuponlar.find((k) => k.kuponName === kuponInput || k.kuponName === kuponSelect);
  
    if (kupon) {
      if (!kupon._id) {
        console.error("Kuponun _id'si bulunamadı!");
        setMessage("Kupon doğrulama sırasında hata oluştu.");
        return;
      }
  
      try {
        await axios.delete(`https://edirnekupon-back.onrender.com/delete_kupon/${kupon._id}`);
        setMessage(`Kuponunuz geçerli! Kupon: ${kupon.kuponName} - %${kupon.indirimDegeri} indirim`);
        setKuponlar((prevKuponlar) => prevKuponlar.filter((k) => k._id !== kupon._id));
      } catch (err) {
        console.error("Kupon silinirken hata oluştu:", err);
        setMessage("Kupon doğrulama sırasında hata oluştu.");
      }
    } else {
      setMessage("Geçersiz kupon kodu."); // Hatalı kupon mesajı
    }
  
    setKuponInput(""); // Input alanını temizle
    setKuponSelect(""); // Dropdown seçim alanını temizle
  };
  

  return (
    <div className="restoran-container">
      <h2 className="restoran-title">Restoran Kuponları</h2>

      <form onSubmit={handleKuponSubmit} className="kupon-form">
        {/* Dropdown listesi */}
        <select
          className="kupon-dropdown"
          value={kuponSelect}
          onChange={(e) => setKuponSelect(e.target.value)}
        >
          <option value="">Kupon seçin</option>
          {kuponlar.map((kupon) => (
            <option key={kupon.kuponId} value={kupon.kuponName}>
              {kupon.kuponName} - %{kupon.indirimDegeri} indirim
            </option>
          ))}
        </select>

        {/* Manuel kupon kodu girişi */}
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

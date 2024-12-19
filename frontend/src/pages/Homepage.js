import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Homepage.css"; // CSS dosyasını ekleyin

const HomePage = () => {
  const navigate = useNavigate();

  const [gmail, setGmail] = useState("");
  const [otp, setOtp] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [kupon, setKupon] = useState(null);
  const [message, setMessage] = useState("");

  // Restoranları dinamik olarak çek
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/get_restoranlar");
        if (response.status === 200) {
          setRestaurants(response.data);
        } else {
          setMessage("Restoran bilgileri alınamadı.");
        }
      } catch (err) {
        console.error("Restoranları alma hatası:", err);
        setMessage("Restoranları alırken bir hata oluştu.");
      }
    };

    fetchRestaurants();
  }, []);

  // OTP gönderme fonksiyonu
  const handleSendOtp = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/send_otp", {
        email: gmail,
      });
      if (response.data.success) {
        setIsOtpSent(true);
        setMessage("OTP gönderildi. Lütfen kontrol edin.");
      } else {
        setMessage(response.data.error || "OTP gönderilemedi.");
      }
    } catch (err) {
      console.error("OTP gönderme hatası:", err);
      setMessage("OTP gönderme sırasında bir hata oluştu.");
    }
  };

  // OTP doğrulama fonksiyonu
  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/verify_otp", {
        email: gmail,
        otp,
      });

      if (response.data.success) {
        setIsOtpVerified(true);
        setMessage("OTP başarıyla doğrulandı!");
        fetchKupon();
      } else {
        setMessage("OTP doğrulama başarısız.");
      }
    } catch (err) {
      console.error("OTP doğrulama hatası:", err);
      setMessage("OTP doğrulama sırasında bir hata oluştu.");
    }
  };

  // Kupon alma fonksiyonu
  const fetchKupon = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/get_random_kupon/${selectedRestaurant}`
      );
      if (response.data.success) {
        setKupon(response.data.kupon);
        setMessage("Kupon başarıyla alındı!");
      } else {
        setMessage("Kupon bulunamadı.");
      }
    } catch (err) {
      console.error("Kupon alma hatası:", err);
      setMessage("Kupon alma sırasında bir hata oluştu.");
    }
  };

  return (
    <div>
      <button className="login-button" onClick={() => navigate("/login")}>
        Giriş Yap
      </button>
    <div className="homepage-container">
      
      <h2>Hoş Geldiniz!</h2>
      {!isOtpVerified ? (
        <div className="otp-section">
          <div className="form-group">
            <label>Gmail Adresi:</label>
            <input
              type="email"
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              placeholder="Gmail adresinizi girin"
            />
            <button onClick={handleSendOtp} disabled={!gmail}>
              Doğrulama Kodu Gönder
            </button>
          </div>
          {isOtpSent && (
            <div className="form-group">
              <label>Doğrulama Kodu:</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Doğrulama kodunu girin"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={!otp || !selectedRestaurant}
              >
                Kodu Doğrula
              </button>
            </div>
          )}
          <div className="form-group">
            <label>Restoran Seçin:</label>
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              <option value="">Bir restoran seçin</option>
              {restaurants.map((restoran) => (
                <option key={restoran.restoranId} value={restoran.restoranId}>
                  {restoran.restoranName}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="kupon-section">
          {kupon ? (
            <div>
              <h3>Kuponunuz:</h3>
              <p>Kupon Adı: {kupon.kuponName}</p>
              <p>İndirim Değeri: %{kupon.indirimDegeri}</p>
            </div>
          ) : (
            <p>Kupon bilgisi alınamadı.</p>
          )}
        </div>
      )}
      <p className="message">{message}</p>
      
    </div>
    </div>
  );
};

export default HomePage;

from flask import Blueprint, request, jsonify, current_app
from utils.db import init_db
from models import Restoran
from bson import ObjectId  # Burada ObjectId'yi import ediyoruz
from models import User
from models import Kupon
import random
import string
from flask_bcrypt import Bcrypt
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


bcrypt = Bcrypt()


admin_routes = Blueprint("admin_routes", __name__)

# Restoran ekleme
@admin_routes.route('/add_restoran', methods=['POST'])
def add_restoran():
    db = init_db(current_app)  # current_app ile uygulamaya erişim
    restoranlar = db.db.restoranlar

    # İstekten gelen veriler
    data = request.json
    restoran_name = data.get("restoranName")

    # Zorunlu alanların kontrolü
    if not restoran_name:
        return jsonify({"error": "Restoran adı gereklidir."}), 400

    # Yeni restoran oluşturma
    restoran_id = str(ObjectId())  # MongoDB'den benzersiz bir restoran_id alıyoruz
    restoran = Restoran(restoran_id, restoran_name)
    
    restoranlar.insert_one(restoran.to_dict())
    
    return jsonify({"message": "Restoran başarıyla eklendi."}), 201

# Restoran düzenleme
@admin_routes.route('/edit_restoran/<restoran_id>', methods=['PUT'])
def edit_restoran(restoran_id):
    db = init_db(current_app)  # current_app ile uygulamaya erişim
    restoranlar = db.db.restoranlar

    # İstekten gelen veriler
    data = request.json
    restoran_name = data.get("restoranName")

    # Zorunlu alanların kontrolü
    if not restoran_name:
        return jsonify({"error": "Restoran adı gereklidir."}), 400

    # Restoranı bulma ve güncelleme
    restoran = restoranlar.find_one({"restoranId": restoran_id})
    if not restoran:
        return jsonify({"error": "Restoran bulunamadı."}), 404

    restoranlar.update_one(
        {"restoranId": restoran_id},
        {"$set": {"restoranName": restoran_name}}
    )
    
    return jsonify({"message": "Restoran başarıyla güncellendi."}), 200



@admin_routes.route('/get_restoranlar', methods=['GET'])
def get_restoranlar():
    db = init_db(current_app)
    restoranlar = db.db.restoranlar
    
    # Restoranları al
    restoran_listesi = []
    for restoran in restoranlar.find():
        restoran_listesi.append({
            "restoranId": restoran["restoranId"],
            "restoranName": restoran["restoranName"]
        })

    return jsonify(restoran_listesi), 200

@admin_routes.route('/add_user', methods=['POST'])
def add_user():
    db = init_db(current_app)
    users = db.db.users
    
    # İstekten gelen veriler
    data = request.json
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")
    restoran_id = data.get("restoranId")
    
    # Zorunlu alanların kontrolü
    if not username or not password or not role or not restoran_id:
        error_message = "Eksik bilgi: "
        if not username:
            error_message += "Kullanıcı adı, "
        if not password:
            error_message += "Şifre, "
        if not role:
            error_message += "Rol, "
        if not restoran_id:
            error_message += "Restoran seçimi"
        
        return jsonify({"error": error_message.rstrip(", ")}), 400

    # Kullanıcı adı kontrolü
    if users.find_one({"username": username}):
        return jsonify({"error": "Kullanıcı adı zaten alınmış."}), 400

    # Şifreyi bcrypt ile hashleyerek saklama
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Yeni kullanıcı oluşturma
    user = User(username, hashed_password, role, restoran_id)
    users.insert_one(user.to_dict())

    return jsonify({"message": "Kullanıcı başarıyla oluşturuldu."}), 201



def generate_random_name(length=8):
    """Rastgele kupon ismi oluşturur"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# Kupon ekleme yolu
@admin_routes.route('/add_kupon', methods=['POST'])
def add_kupon():
    db = init_db(current_app)  # current_app ile uygulamaya erişim
    kuponlar = db.db.kuponlar  # Kuponların bulunduğu koleksiyon
    
    # İstekten gelen veriler
    data = request.json
    restoran_id = data.get("restoranId")
    indirim_degeri = data.get("indirimDegeri")
    adet = data.get("adet")

    # Zorunlu alanların kontrolü
    if not restoran_id or not indirim_degeri or not adet:
        return jsonify({"error": "Eksik bilgi. Restoran, indirim değeri ve adet gereklidir."}), 400

    try:
        adet = int(adet)  # String'i tam sayıya çeviriyoruz
    except ValueError:
        return jsonify({"error": "Adet geçerli bir sayı olmalıdır."}), 400

    # Verilen adet kadar kupon oluştur
    kuponlar_to_insert = []
    for _ in range(adet):
        while True:
            kupon_name = generate_random_name()  # Her kupon için farklı isim oluşturuluyor

            # Kupon adının veritabanında olup olmadığını kontrol et
            existing_kupon = kuponlar.find_one({"kuponName": kupon_name})
            if not existing_kupon:  # Eğer aynı isimde bir kupon yoksa, oluşturulacak
                break

        # Kupon ID'si oluşturuluyor (MongoDB'den benzersiz bir kupon_id alıyoruz)
        kupon_id = str(ObjectId())  # MongoDB'den benzersiz bir ID alıyoruz

        # Kupon oluşturma
        kupon = Kupon(kupon_id, restoran_id, kupon_name, indirim_degeri)
        kuponlar_to_insert.append(kupon.to_dict())  # Kuponları listeye ekle

    # Kuponları veritabanına ekle
    kuponlar.insert_many(kuponlar_to_insert)

    # Oluşturulan kuponları console'a yazdır
    for kupon in kuponlar_to_insert:
        print("Oluşturulan Kupon:", kupon)

    return jsonify({"message": f"{adet} adet kupon başarıyla oluşturuldu."}), 201


# Kuponları almak için düzenlediğiniz kod
@admin_routes.route('/get_kuponlar/<restoran_id>', methods=['GET'])
def get_kuponlar(restoran_id):
    db = init_db(current_app)
    kuponlar = db.db.kuponlar

    # Restorana ait kuponları getir
    kupon_listesi = []
    for kupon in kuponlar.find({"restoranId": restoran_id}):
        kupon_listesi.append({
            "_id": str(kupon["_id"]),  # MongoDB _id'si burada string'e dönüştürülüyor
            "kuponId": kupon["kuponId"],
            "kuponName": kupon["kuponName"],
            "indirimDegeri": kupon["indirimDegeri"]
        })

    return jsonify(kupon_listesi), 200



@admin_routes.route('/delete_kupon/<kupon_id>', methods=['DELETE'])
def delete_kupon(kupon_id):
    db = init_db(current_app)
    kuponlar = db.db.kuponlar

    try:
        # Gelen kupon_id'yi ObjectId'ye dönüştür
        kupon_object_id = ObjectId(kupon_id)
        kupon = kuponlar.find_one({"_id": kupon_object_id})

        if kupon:
            # Kuponu sil
            kuponlar.delete_one({"_id": kupon_object_id})
            return jsonify({"message": "Kupon başarıyla silindi."}), 200
        else:
            return jsonify({"error": "Kupon bulunamadı."}), 404
    except Exception as e:
        return jsonify({"error": f"Invalid Kupon ID: {e}"}), 400
    

    
    












otp_storage = {}

# Rastgele OTP oluşturucu
def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# Gmail üzerinden OTP gönderimi
def send_email(to_email, otp):
    try:
        # SMTP sunucusu yapılandırması (örnek Gmail için)
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)  # E-posta ve şifreyi .env'den alıyoruz
        subject = "Doğrulama Kodu"
        body = f"Doğrulama kodunuz: {otp}"

        email_address = "fenerliemirhan50@gmail.com"
        

        message = MIMEMultipart()
        message['From'] = email_address
        message['To'] = to_email
        message['Subject'] = subject
        message.attach(MIMEText(body, 'plain', 'utf-8'))


        server.sendmail(email_address, to_email, message.as_string())  # Düzeltme burada
        server.quit()
    except Exception as e:
        print("Email gönderim hatası:", e)
        return False
    return True

# OTP gönderme
@admin_routes.route('/send_otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"success": False, "error": "Gmail adresi gereklidir."}), 400

    otp = generate_otp()
    otp_storage[email] = {"otp": otp, "timestamp": time.time()}

    # OTP'yi Gmail üzerinden gönder
    if send_email(email, otp):
        return jsonify({"success": True, "message": "OTP gönderildi."}), 200
    else:
        return jsonify({"success": False, "error": "OTP gönderilemedi."}), 500


# OTP doğrulama
@admin_routes.route('/verify_otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({"success": False, "message": "Email ve OTP gereklidir."}), 400

    stored_data = otp_storage.get(email)
    if not stored_data:
        return jsonify({"success": False, "message": "OTP bulunamadı."}), 404

    if stored_data["otp"] == otp:
        return jsonify({"success": True, "message": "OTP doğrulandı."}), 200
    else:
        return jsonify({"success": False, "message": "OTP yanlış."}), 401


# Rastgele kupon getirme
@admin_routes.route('/get_random_kupon/<restoran_id>', methods=['GET'])
def get_random_kupon(restoran_id):
    db = init_db(current_app)
    kuponlar = db.db.kuponlar

    # Restorana ait tüm kuponları getir
    restoran_kuponlari = list(kuponlar.find({"restoranId": restoran_id}))

    if not restoran_kuponlari:
        return jsonify({"error": "Bu restorana ait kupon bulunamadı."}), 404

    # Rastgele bir kupon seç
    random_kupon = random.choice(restoran_kuponlari)

    return jsonify({
        "success": True,
        "kupon": {
            "_id": str(random_kupon["_id"]),
            "kuponId": random_kupon["kuponId"],
            "kuponName": random_kupon["kuponName"],
            "indirimDegeri": random_kupon["indirimDegeri"]
        }
    }), 200
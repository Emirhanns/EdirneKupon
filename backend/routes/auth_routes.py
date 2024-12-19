from flask import Blueprint, request, jsonify, current_app
from flask_bcrypt import Bcrypt
from utils.db import init_db
from models import User

# Blueprint ve Bcrypt tanımı
auth_routes = Blueprint("auth_routes", __name__)
bcrypt = Bcrypt()

@auth_routes.route('/register', methods=['POST'])
def register():
    db = init_db(current_app)  # current_app ile uygulamaya erişim
    users = db.db.users

    # İstekten gelen veriler
    data = request.json
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")
    restoran_id = data.get("restoranId")

    # Zorunlu alanların kontrolü
    if not username or not password or not role:
        return jsonify({"error": "Eksik bilgi. Kullanıcı adı, şifre ve rol gereklidir."}), 400

    # Kullanıcı adı kontrolü
    if users.find_one({"username": username}):
        return jsonify({"error": "Kullanıcı adı zaten alınmış."}), 400

    # Şifre hashleme
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Yeni kullanıcı oluşturma
    user = User(username, hashed_password, role, restoran_id if role == "restoran" else None)
    users.insert_one(user.to_dict())
    
    return jsonify({"message": "Kayıt başarılı"}), 201

@auth_routes.route('/login', methods=['POST'])
def login():
    db = init_db(current_app)
    users = db.db.users

    # Kullanıcı bilgilerini al
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # Kullanıcı doğrulama
    user = users.find_one({"username": username})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"error": "Geçersiz kullanıcı adı veya şifre"}), 401

    # Kullanıcı bilgileri ile restoranId'yi döndür
    return jsonify({
        "message": "Giriş başarılı",
        "restoranId": user["restoranId"],  # Restoran ID'yi yanıt olarak döndür
        "role": user["role"]
    }), 200
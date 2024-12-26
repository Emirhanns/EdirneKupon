# app.py

from flask import Flask
from utils.db import init_db
from flask_cors import CORS
from routes.auth_routes import auth_routes
from routes.admin_routes import admin_routes 
import os

app = Flask(__name__)

CORS(app)  # Cross-Origin Resource Sharing ayarları

# Veritabanı bağlantısını başlat
init_db(app)

# Blueprint ile rotaları kaydet
app.register_blueprint(auth_routes)
app.register_blueprint(admin_routes)


app.config['DEBUG'] = False  # Debug özelliğini kapat
app.config['TESTING'] = False  # Testing özelliğini kapat
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')  # Güvenli bir anahtar


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

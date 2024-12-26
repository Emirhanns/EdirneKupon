# app.py

from flask import Flask, send_from_directory
from utils.db import init_db
from flask_cors import CORS
from routes.auth_routes import auth_routes
from routes.admin_routes import admin_routes 
import os

app = Flask(__name__, static_folder='frontend/build', template_folder='frontend/build')

CORS(app)  # Cross-Origin Resource Sharing ayarları

# Veritabanı bağlantısını başlat
init_db(app)

# Blueprint ile rotaları kaydet
app.register_blueprint(auth_routes)
app.register_blueprint(admin_routes)

# React yönlendirmelerini desteklemek için catch-all route
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Eğer istenen dosya 'build' klasöründe varsa, o dosya sunuluyor
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Diğer tüm isteklerde 'index.html' döndürülerek React Router'ın devreye girmesi sağlanıyor
    return send_from_directory(app.static_folder, 'index.html')



app.config['DEBUG'] = False  # Debug özelliğini kapat
app.config['TESTING'] = False  # Testing özelliğini kapat
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')  # Güvenli bir anahtar

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

# db.py
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

load_dotenv()

mongo = None  # MongoDB bağlantısını burada başlatacağız

def init_db(app):
    global mongo
    if mongo is None:
        app.config["MONGO_URI"] = os.getenv("MONGO_URI")
        mongo = PyMongo(app)
        
        # MongoDB bağlantısının başarılı olup olmadığını test et
        try:
            # Veritabanı adını kontrol et, başarılıysa bağlantı kuruldu demektir
            mongo.db.command("ping")
            print("MongoDB bağlantısı başarılı!")
        except Exception as e:
            print(f"MongoDB bağlantı hatası: {e}")
    return mongo

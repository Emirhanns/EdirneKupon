from bson import ObjectId

class User:
    def __init__(self, username, password, role, restoran_id=None):
        self.username = username
        self.password = password
        self.role = role
        self.restoran_id = restoran_id

    def to_dict(self):
        return {
            "username": self.username,
            "password": self.password,
            "role": self.role,
            "restoranId": self.restoran_id
        }

    @staticmethod
    def from_dict(data):
        return User(
            username=data.get("username"),
            password=data.get("password"),
            role=data.get("role"),
            restoran_id=data.get("restoranId")
        )


class Restoran:
    def __init__(self, restoran_id, restoran_name):
        self.restoran_id = restoran_id
        self.restoran_name = restoran_name

    def to_dict(self):
        return {
            "restoranId": self.restoran_id,
            "restoranName": self.restoran_name
        }

    @staticmethod
    def from_dict(data):
        return Restoran(
            restoran_id=data.get("restoranId"),
            restoran_name=data.get("restoranName")
        )


class Kupon:
    def __init__(self, kupon_id, restoran_id, kupon_name, indirim_degeri):
        self.kupon_id = kupon_id
        self.restoran_id = restoran_id
        self.kupon_name = kupon_name
        self.indirim_degeri = indirim_degeri

    def to_dict(self):
        return {
            "kuponId": self.kupon_id,
            "restoranId": self.restoran_id,
            "kuponName": self.kupon_name,
            "indirimDegeri": self.indirim_degeri,
        }

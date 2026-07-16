from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import datetime
import db
import config

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    full_name = data.get("fullName", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    role = data.get("role", "buyer")

    if not full_name or not email or not password:
        return jsonify({"success": False, "message": "Full name, email, and password are required."}), 400

    existing = db.query("SELECT id FROM users WHERE email = %s", (email,))
    if existing:
        return jsonify({"success": False, "message": "Email is already registered."}), 409

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    db.execute(
        "INSERT INTO users (full_name, email, password, role) VALUES (%s, %s, %s, %s)",
        (full_name, email, hashed, role),
    )

    return jsonify({"success": True, "message": "Account created successfully."}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    role = data.get("role", "buyer")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    # For seller login, accept both 'seller' and 'provider' role names
    role_filter = "provider" if role == "seller" else role

    user = db.query(
        "SELECT * FROM users WHERE email = %s AND role = %s",
        (email, role_filter),
        fetchone=True,
    )

    if not user:
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    token = jwt.encode(
        {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1),
        },
        config.JWT_SECRET,
        algorithm="HS256",
    )

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "token": token,
        "user": {
            "id": user["id"],
            "fullName": user["full_name"],
            "email": user["email"],
            "role": user["role"],
        },
    })

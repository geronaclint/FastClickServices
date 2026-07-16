from functools import wraps
from flask import request, jsonify
import jwt
import config


def token_required(f):
    """Decorator that verifies JWT from Authorization header."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "Not authorized, no token"}), 401

        token = auth_header.split(" ")[1]

        try:
            decoded = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
            request.user = decoded
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Not authorized, token failed"}), 401

        return f(*args, **kwargs)

    return decorated


def provider_only(f):
    """Decorator that restricts access to provider or admin roles."""

    @wraps(f)
    def decorated(*args, **kwargs):
        user = getattr(request, "user", None)

        if not user or user.get("role") not in ("provider", "admin"):
            return jsonify({"success": False, "message": "Not authorized as a provider"}), 403

        return f(*args, **kwargs)

    return decorated

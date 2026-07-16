from flask import Flask, jsonify
from flask_cors import CORS
import config

from routes.auth_routes import auth_bp
from routes.service_routes import service_bp
from routes.booking_routes import booking_bp
from routes.ticket_routes import ticket_bp
from routes.service_request_routes import service_request_bp
from routes.profile_routes import profile_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(service_bp, url_prefix="/api/services")
app.register_blueprint(booking_bp, url_prefix="/api/bookings")
app.register_blueprint(ticket_bp, url_prefix="/api/tickets")
app.register_blueprint(service_request_bp, url_prefix="/api/service-requests")
app.register_blueprint(profile_bp, url_prefix="/api/profile")


@app.route("/")
def index():
    return jsonify({"message": "SureServe Flask backend is running"})


@app.route("/api/test-db")
def test_db():
    try:
        import db
        conn = db.get_db()
        conn.close()
        return jsonify({"success": True, "message": "MySQL Connected Successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.PORT, debug=True)

from flask import Blueprint, request, jsonify
import db
from auth_middleware import token_required

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("", methods=["GET"])
@token_required
def get_profile():
    user = db.query(
        "SELECT id, full_name, email, phone, address, role, created_at FROM users WHERE id = %s",
        (request.user["id"],),
        fetchone=True,
    )
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    if user.get("created_at"):
        user["created_at"] = str(user["created_at"])

    return jsonify({"success": True, "data": user})


@profile_bp.route("", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json()
    full_name = data.get("fullName")
    email = data.get("email")
    phone = data.get("phone")
    address = data.get("address")

    db.execute(
        "UPDATE users SET full_name = COALESCE(%s, full_name), email = COALESCE(%s, email), phone = COALESCE(%s, phone), address = COALESCE(%s, address) WHERE id = %s",
        (full_name, email, phone, address, request.user["id"]),
    )

    return jsonify({"success": True, "message": "Profile updated successfully"})


@profile_bp.route("/dashboard-stats", methods=["GET"])
@token_required
def dashboard_stats():
    uid = request.user["id"]

    ticket_count = db.query("SELECT COUNT(*) AS c FROM tickets WHERE user_id = %s", (uid,), fetchone=True)["c"]
    sr_count = db.query("SELECT COUNT(*) AS c FROM service_requests WHERE user_id = %s", (uid,), fetchone=True)["c"]
    pending_tickets = db.query(
        "SELECT COUNT(*) AS c FROM tickets WHERE user_id = %s AND status IN ('Pending', 'Processing')",
        (uid,), fetchone=True
    )["c"]

    return jsonify({
        "success": True,
        "data": {
            "totalTickets": ticket_count,
            "totalServiceRequests": sr_count,
            "pendingTickets": pending_tickets,
        },
    })


@profile_bp.route("/seller-stats", methods=["GET"])
@token_required
def seller_stats():
    total_requests = db.query("SELECT COUNT(*) AS c FROM service_requests", fetchone=True)["c"]
    total_tickets = db.query("SELECT COUNT(*) AS c FROM tickets", fetchone=True)["c"]
    processing_requests = db.query("SELECT COUNT(*) AS c FROM service_requests WHERE status = 'Processing'", fetchone=True)["c"]
    finished_requests = db.query("SELECT COUNT(*) AS c FROM service_requests WHERE status = 'Finished'", fetchone=True)["c"]
    pending_requests = db.query("SELECT COUNT(*) AS c FROM service_requests WHERE status = 'Pending'", fetchone=True)["c"]
    cancelled_requests = db.query("SELECT COUNT(*) AS c FROM service_requests WHERE status = 'Cancelled'", fetchone=True)["c"]
    processing_tickets = db.query("SELECT COUNT(*) AS c FROM tickets WHERE status = 'Processing'", fetchone=True)["c"]
    finished_tickets = db.query("SELECT COUNT(*) AS c FROM tickets WHERE status = 'Finished'", fetchone=True)["c"]
    pending_tickets = db.query("SELECT COUNT(*) AS c FROM tickets WHERE status = 'Pending'", fetchone=True)["c"]

    return jsonify({
        "success": True,
        "data": {
            "totalRequests": total_requests,
            "totalTickets": total_tickets,
            "processingRequests": processing_requests,
            "finishedRequests": finished_requests,
            "pendingRequests": pending_requests,
            "cancelledRequests": cancelled_requests,
            "processingTickets": processing_tickets,
            "finishedTickets": finished_tickets,
            "pendingTickets": pending_tickets,
        },
    })

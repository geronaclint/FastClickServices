from flask import Blueprint, request, jsonify
import db
from auth_middleware import token_required

service_request_bp = Blueprint("service_requests", __name__)


@service_request_bp.route("", methods=["POST"])
@token_required
def create_service_request():
    data = request.get_json()
    service_type = data.get("serviceType", "").strip()
    priority = data.get("priority", "Normal")
    location = data.get("location", "").strip()
    contact_person = data.get("contactPerson", "")
    phone = data.get("phone", "")
    preferred_date = data.get("date") or None
    preferred_time = data.get("time", "")
    description = data.get("description", "")

    if not service_type or not location:
        return jsonify({"success": False, "message": "Service type and location are required."}), 400

    new_id = db.execute(
        """INSERT INTO service_requests
           (user_id, service_type, priority, location, contact_person, phone, preferred_date, preferred_time, description)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (request.user["id"], service_type, priority, location, contact_person, phone, preferred_date, preferred_time, description),
    )

    return jsonify({"success": True, "message": "Service request created successfully", "requestId": new_id}), 201


@service_request_bp.route("", methods=["GET"])
@token_required
def get_service_requests():
    user = request.user

    if user.get("role") in ("provider", "admin"):
        requests_list = db.query(
            """SELECT sr.*, u.full_name AS customer_name, u.email AS customer_email
               FROM service_requests sr JOIN users u ON sr.user_id = u.id
               ORDER BY sr.created_at DESC"""
        )
    else:
        requests_list = db.query(
            "SELECT * FROM service_requests WHERE user_id = %s ORDER BY created_at DESC",
            (user["id"],),
        )

    for r in requests_list:
        if r.get("created_at"):
            r["created_at"] = str(r["created_at"])
        if r.get("preferred_date"):
            r["preferred_date"] = str(r["preferred_date"])

    return jsonify({"success": True, "count": len(requests_list), "data": requests_list})


@service_request_bp.route("/<int:request_id>/status", methods=["PUT"])
@token_required
def update_request_status(request_id):
    data = request.get_json()
    status = data.get("status")

    if status not in ("Pending", "Processing", "Finished", "Cancelled"):
        return jsonify({"success": False, "message": "Invalid status value"}), 400

    sr = db.query("SELECT * FROM service_requests WHERE id = %s", (request_id,), fetchone=True)
    if not sr:
        return jsonify({"success": False, "message": "Service request not found"}), 404

    user = request.user
    if sr["user_id"] != user["id"] and user.get("role") not in ("provider", "admin"):
        return jsonify({"success": False, "message": "Not authorized"}), 403

    db.execute("UPDATE service_requests SET status = %s WHERE id = %s", (status, request_id))
    return jsonify({"success": True, "message": "Service request status updated"})


@service_request_bp.route("/<int:request_id>", methods=["DELETE"])
@token_required
def delete_service_request(request_id):
    sr = db.query("SELECT * FROM service_requests WHERE id = %s", (request_id,), fetchone=True)
    if not sr:
        return jsonify({"success": False, "message": "Service request not found"}), 404

    user = request.user
    if sr["user_id"] != user["id"] and user.get("role") not in ("provider", "admin"):
        return jsonify({"success": False, "message": "Not authorized"}), 403

    db.execute("DELETE FROM service_requests WHERE id = %s", (request_id,))
    return jsonify({"success": True, "message": "Service request deleted successfully"})

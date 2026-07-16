from flask import Blueprint, request, jsonify
import db
from auth_middleware import token_required, provider_only

booking_bp = Blueprint("bookings", __name__)


@booking_bp.route("", methods=["POST"])
@token_required
def create_booking():
    data = request.get_json()
    service_id = data.get("service_id")
    booking_date = data.get("booking_date")
    booking_time = data.get("booking_time")
    notes = data.get("notes")

    if not service_id or not booking_date or not booking_time:
        return jsonify({"success": False, "message": "Service ID, Date, and Time are required."}), 400

    new_id = db.execute(
        "INSERT INTO bookings (buyer_id, service_id, booking_date, booking_time, notes) VALUES (%s, %s, %s, %s, %s)",
        (request.user["id"], service_id, booking_date, booking_time, notes),
    )

    return jsonify({"success": True, "message": "Booking created successfully", "bookingId": new_id}), 201


@booking_bp.route("", methods=["GET"])
@token_required
def get_bookings():
    user = request.user

    if user.get("role") == "provider":
        bookings = db.query(
            """SELECT b.*, s.title AS service_title, u.full_name AS buyer_name
               FROM bookings b
               JOIN services s ON b.service_id = s.id
               JOIN users u ON b.buyer_id = u.id
               WHERE s.provider_id = %s""",
            (user["id"],),
        )
    else:
        bookings = db.query(
            """SELECT b.*, s.title AS service_title, u.full_name AS provider_name
               FROM bookings b
               JOIN services s ON b.service_id = s.id
               JOIN users u ON s.provider_id = u.id
               WHERE b.buyer_id = %s""",
            (user["id"],),
        )

    # Convert date/time objects to strings for JSON serialization
    for b in bookings:
        if b.get("booking_date"):
            b["booking_date"] = str(b["booking_date"])
        if b.get("booking_time"):
            b["booking_time"] = str(b["booking_time"])
        if b.get("created_at"):
            b["created_at"] = str(b["created_at"])

    return jsonify({"success": True, "count": len(bookings), "data": bookings})


@booking_bp.route("/<int:booking_id>/status", methods=["PUT"])
@token_required
@provider_only
def update_booking_status(booking_id):
    data = request.get_json()
    status = data.get("status")

    if status not in ("pending", "confirmed", "completed", "cancelled"):
        return jsonify({"success": False, "message": "Invalid status value"}), 400

    booking = db.query(
        """SELECT b.*, s.provider_id
           FROM bookings b JOIN services s ON b.service_id = s.id
           WHERE b.id = %s""",
        (booking_id,),
        fetchone=True,
    )

    if not booking:
        return jsonify({"success": False, "message": "Booking not found"}), 404

    if booking["provider_id"] != request.user["id"] and request.user.get("role") != "admin":
        return jsonify({"success": False, "message": "Not authorized"}), 403

    db.execute("UPDATE bookings SET status = %s WHERE id = %s", (status, booking_id))
    return jsonify({"success": True, "message": "Booking status updated"})

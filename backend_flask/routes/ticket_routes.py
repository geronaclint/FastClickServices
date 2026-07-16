from flask import Blueprint, request, jsonify
import db
from auth_middleware import token_required

ticket_bp = Blueprint("tickets", __name__)


@ticket_bp.route("", methods=["POST"])
@token_required
def create_ticket():
    data = request.get_json()
    ticket_type = data.get("ticketType", "").strip()
    priority = data.get("priority", "Normal")
    description = data.get("description", "")
    contact_person = data.get("contactPerson", "")
    phone = data.get("phone", "")

    if not ticket_type:
        return jsonify({"success": False, "message": "Ticket type is required."}), 400

    new_id = db.execute(
        "INSERT INTO tickets (user_id, ticket_type, priority, contact_person, phone, description) VALUES (%s, %s, %s, %s, %s, %s)",
        (request.user["id"], ticket_type, priority, contact_person, phone, description),
    )

    return jsonify({"success": True, "message": "Ticket created successfully", "ticketId": new_id}), 201


@ticket_bp.route("", methods=["GET"])
@token_required
def get_tickets():
    user = request.user

    if user.get("role") in ("provider", "admin"):
        tickets = db.query(
            """SELECT t.*, u.full_name AS customer_name, u.email AS customer_email
               FROM tickets t JOIN users u ON t.user_id = u.id
               ORDER BY t.created_at DESC"""
        )
    else:
        tickets = db.query(
            "SELECT * FROM tickets WHERE user_id = %s ORDER BY created_at DESC",
            (user["id"],),
        )

    for t in tickets:
        if t.get("created_at"):
            t["created_at"] = str(t["created_at"])

    return jsonify({"success": True, "count": len(tickets), "data": tickets})


@ticket_bp.route("/<int:ticket_id>", methods=["GET"])
@token_required
def get_ticket(ticket_id):
    ticket = db.query("SELECT * FROM tickets WHERE id = %s", (ticket_id,), fetchone=True)
    if not ticket:
        return jsonify({"success": False, "message": "Ticket not found"}), 404
    if ticket.get("created_at"):
        ticket["created_at"] = str(ticket["created_at"])
    return jsonify({"success": True, "data": ticket})


@ticket_bp.route("/<int:ticket_id>/status", methods=["PUT"])
@token_required
def update_ticket_status(ticket_id):
    data = request.get_json()
    status = data.get("status")

    if status not in ("Pending", "Processing", "Finished", "Cancelled"):
        return jsonify({"success": False, "message": "Invalid status value"}), 400

    ticket = db.query("SELECT * FROM tickets WHERE id = %s", (ticket_id,), fetchone=True)
    if not ticket:
        return jsonify({"success": False, "message": "Ticket not found"}), 404

    # Only the ticket owner, provider, or admin can update
    user = request.user
    if ticket["user_id"] != user["id"] and user.get("role") not in ("provider", "admin"):
        return jsonify({"success": False, "message": "Not authorized"}), 403

    db.execute("UPDATE tickets SET status = %s WHERE id = %s", (status, ticket_id))
    return jsonify({"success": True, "message": "Ticket status updated"})


@ticket_bp.route("/<int:ticket_id>", methods=["DELETE"])
@token_required
def delete_ticket(ticket_id):
    ticket = db.query("SELECT * FROM tickets WHERE id = %s", (ticket_id,), fetchone=True)
    if not ticket:
        return jsonify({"success": False, "message": "Ticket not found"}), 404

    user = request.user
    if ticket["user_id"] != user["id"] and user.get("role") not in ("provider", "admin"):
        return jsonify({"success": False, "message": "Not authorized"}), 403

    db.execute("DELETE FROM tickets WHERE id = %s", (ticket_id,))
    return jsonify({"success": True, "message": "Ticket deleted successfully"})

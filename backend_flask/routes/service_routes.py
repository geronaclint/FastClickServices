from flask import Blueprint, request, jsonify
import db
from auth_middleware import token_required, provider_only

service_bp = Blueprint("services", __name__)


@service_bp.route("", methods=["GET"])
def get_services():
    services = db.query(
        "SELECT s.*, u.full_name AS provider_name FROM services s JOIN users u ON s.provider_id = u.id"
    )
    return jsonify({"success": True, "count": len(services), "data": services})


@service_bp.route("/<int:service_id>", methods=["GET"])
def get_service(service_id):
    service = db.query(
        "SELECT s.*, u.full_name AS provider_name FROM services s JOIN users u ON s.provider_id = u.id WHERE s.id = %s",
        (service_id,),
        fetchone=True,
    )
    if not service:
        return jsonify({"success": False, "message": "Service not found"}), 404
    return jsonify({"success": True, "data": service})


@service_bp.route("", methods=["POST"])
@token_required
@provider_only
def create_service():
    data = request.get_json()
    title = data.get("title", "")
    price = data.get("price")

    if not title or price is None:
        return jsonify({"success": False, "message": "Title and price are required."}), 400

    new_id = db.execute(
        "INSERT INTO services (provider_id, title, description, price, category, image_url) VALUES (%s, %s, %s, %s, %s, %s)",
        (
            request.user["id"],
            title,
            data.get("description"),
            price,
            data.get("category"),
            data.get("image_url"),
        ),
    )

    return jsonify({"success": True, "message": "Service created successfully", "serviceId": new_id}), 201


@service_bp.route("/<int:service_id>", methods=["PUT"])
@token_required
@provider_only
def update_service(service_id):
    service = db.query("SELECT * FROM services WHERE id = %s", (service_id,), fetchone=True)
    if not service:
        return jsonify({"success": False, "message": "Service not found"}), 404
    if service["provider_id"] != request.user["id"] and request.user.get("role") != "admin":
        return jsonify({"success": False, "message": "Not authorized"}), 403

    data = request.get_json()
    db.execute(
        "UPDATE services SET title = COALESCE(%s, title), description = COALESCE(%s, description), price = COALESCE(%s, price), category = COALESCE(%s, category), image_url = COALESCE(%s, image_url) WHERE id = %s",
        (data.get("title"), data.get("description"), data.get("price"), data.get("category"), data.get("image_url"), service_id),
    )
    return jsonify({"success": True, "message": "Service updated successfully"})


@service_bp.route("/<int:service_id>", methods=["DELETE"])
@token_required
@provider_only
def delete_service(service_id):
    service = db.query("SELECT * FROM services WHERE id = %s", (service_id,), fetchone=True)
    if not service:
        return jsonify({"success": False, "message": "Service not found"}), 404
    if service["provider_id"] != request.user["id"] and request.user.get("role") != "admin":
        return jsonify({"success": False, "message": "Not authorized"}), 403

    db.execute("DELETE FROM services WHERE id = %s", (service_id,))
    return jsonify({"success": True, "message": "Service deleted successfully"})

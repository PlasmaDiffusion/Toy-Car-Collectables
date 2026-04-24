from flask import Blueprint, jsonify, abort, request
from ..extensions import db
from ..models.category import Category, CategoryTypeEnum
from ..schemas.category import CategorySchema
from ..schemas.car import CarSummarySchema

categories_bp    = Blueprint("categories", __name__)
category_schema  = CategorySchema()
categories_schema= CategorySchema(many=True)
cars_schema      = CarSummarySchema(many=True)


# ── GET /api/categories ──────────────────────────────────────────────────────
@categories_bp.get("/")
def list_categories():
    """Optional ?type= filter (era | brand | scale | vehicleType | condition | material)."""
    cat_type = request.args.get("type")
    query    = Category.query

    if cat_type:
        try:
            query = query.filter(Category.type == CategoryTypeEnum(cat_type))
        except ValueError:
            abort(400, description=f"Invalid category type: {cat_type!r}")

    categories = query.order_by(Category.name).all()
    return jsonify(categories_schema.dump(categories))


# ── GET /api/categories/<id> ─────────────────────────────────────────────────
@categories_bp.get("/<string:category_id>")
def get_category(category_id: str):
    category = Category.query.get_or_404(category_id)
    return jsonify(category_schema.dump(category))


# ── GET /api/categories/slug/<slug> ─────────────────────────────────────────
@categories_bp.get("/slug/<string:slug>")
def get_category_by_slug(slug: str):
    category = Category.query.filter_by(slug=slug).first_or_404()
    return jsonify(category_schema.dump(category))


# ── GET /api/categories/<id>/cars ───────────────────────────────────────────
@categories_bp.get("/<string:category_id>/cars")
def get_cars_in_category(category_id: str):
    category = Category.query.get_or_404(category_id)
    return jsonify(cars_schema.dump(category.cars))


# ── POST /api/categories ─────────────────────────────────────────────────────
@categories_bp.post("/")
def create_category():
    data   = request.get_json(silent=True) or {}
    errors = category_schema.validate(data)
    if errors:
        abort(422, description=errors)

    category = category_schema.load(data, session=db.session)
    db.session.add(category)
    db.session.commit()
    return jsonify(category_schema.dump(category)), 201


# ── PUT /api/categories/<id> ─────────────────────────────────────────────────
@categories_bp.put("/<string:category_id>")
def update_category(category_id: str):
    category = Category.query.get_or_404(category_id)
    data     = request.get_json(silent=True) or {}

    errors = category_schema.validate(data, partial=True)
    if errors:
        abort(422, description=errors)

    category_schema.load(data, instance=category, partial=True, session=db.session)
    db.session.commit()
    return jsonify(category_schema.dump(category))


# ── DELETE /api/categories/<id> ──────────────────────────────────────────────
@categories_bp.delete("/<string:category_id>")
def delete_category(category_id: str):
    category = Category.query.get_or_404(category_id)
    db.session.delete(category)
    db.session.commit()
    return "", 204

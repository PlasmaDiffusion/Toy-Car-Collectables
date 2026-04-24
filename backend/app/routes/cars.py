from flask import Blueprint, request, jsonify, abort
from sqlalchemy import or_, and_
from ..extensions import db
from ..models.car import Car, ConditionEnum, ScaleEnum, VehicleTypeEnum, MaterialEnum
from ..schemas.car import CarSchema, CarSummarySchema

cars_bp = Blueprint("cars", __name__)

car_schema         = CarSchema()
cars_summary_schema = CarSummarySchema(many=True)


# ── GET /api/cars ────────────────────────────────────────────────────────────
@cars_bp.get("/")
def list_cars():
    """
    Query params:
      q            – full-text search across name, brand, description, tags
      brand        – exact brand name
      scale        – e.g. "1:64"
      condition    – e.g. "Mint in Box"
      vehicle_type – e.g. "Muscle Car"
      material     – e.g. "Diecast"
      min_price    – float USD
      max_price    – float USD
      featured     – "true" | "false"
      in_stock     – "true" to show only stock_quantity > 0
      category_id  – filter by associated category id
      page         – page number (default 1)
      per_page     – results per page (default 24, max 100)
    """
    q           = request.args.get("q", "").strip()
    brand       = request.args.get("brand")
    scale       = request.args.get("scale")
    condition   = request.args.get("condition")
    vehicle_type= request.args.get("vehicle_type")
    material    = request.args.get("material")
    min_price   = request.args.get("min_price", type=float)
    max_price   = request.args.get("max_price", type=float)
    featured    = request.args.get("featured")
    in_stock    = request.args.get("in_stock")
    category_id = request.args.get("category_id")
    page        = request.args.get("page", 1, type=int)
    per_page    = min(request.args.get("per_page", 24, type=int), 100)

    query = Car.query

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Car.name.ilike(like),
                Car.brand.ilike(like),
                Car.description.ilike(like),
                Car.tags.any(like),          # Postgres ARRAY @> operator via .any()
            )
        )

    if brand:
        query = query.filter(Car.brand.ilike(f"%{brand}%"))

    if scale:
        try:
            query = query.filter(Car.scale == ScaleEnum(scale))
        except ValueError:
            abort(400, description=f"Invalid scale value: {scale!r}")

    if condition:
        try:
            query = query.filter(Car.condition == ConditionEnum(condition))
        except ValueError:
            abort(400, description=f"Invalid condition value: {condition!r}")

    if vehicle_type:
        try:
            query = query.filter(Car.vehicle_type == VehicleTypeEnum(vehicle_type))
        except ValueError:
            abort(400, description=f"Invalid vehicle_type value: {vehicle_type!r}")

    if material:
        try:
            query = query.filter(Car.material == MaterialEnum(material))
        except ValueError:
            abort(400, description=f"Invalid material value: {material!r}")

    if min_price is not None:
        query = query.filter(Car.price_cents >= int(min_price * 100))

    if max_price is not None:
        query = query.filter(Car.price_cents <= int(max_price * 100))

    if featured == "true":
        query = query.filter(Car.featured.is_(True))

    if in_stock == "true":
        query = query.filter(Car.stock_quantity > 0)

    if category_id:
        from ..models.category import Category
        query = query.filter(Car.categories.any(Category.id == category_id))

    pagination = query.order_by(Car.name).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items":    cars_summary_schema.dump(pagination.items),
        "total":    pagination.total,
        "page":     pagination.page,
        "per_page": pagination.per_page,
        "pages":    pagination.pages,
    })


# ── GET /api/cars/featured ───────────────────────────────────────────────────
@cars_bp.get("/featured")
def list_featured():
    cars = Car.query.filter_by(featured=True).order_by(Car.name).all()
    return jsonify(cars_summary_schema.dump(cars))


# ── GET /api/cars/<id> ───────────────────────────────────────────────────────
@cars_bp.get("/<string:car_id>")
def get_car(car_id: str):
    car = Car.query.get_or_404(car_id, description=f"Car '{car_id}' not found")
    return jsonify(car_schema.dump(car))


# ── POST /api/cars ───────────────────────────────────────────────────────────
@cars_bp.post("/")
def create_car():
    data = request.get_json(silent=True) or {}
    errors = car_schema.validate(data)
    if errors:
        abort(422, description=errors)

    car = car_schema.load(data, session=db.session)
    _attach_categories(car, data.get("category_ids", []))

    db.session.add(car)
    db.session.commit()
    return jsonify(car_schema.dump(car)), 201


# ── PUT /api/cars/<id> ───────────────────────────────────────────────────────
@cars_bp.put("/<string:car_id>")
def update_car(car_id: str):
    car = Car.query.get_or_404(car_id)
    data = request.get_json(silent=True) or {}

    errors = car_schema.validate(data, partial=True)
    if errors:
        abort(422, description=errors)

    car_schema.load(data, instance=car, partial=True, session=db.session)

    if "category_ids" in data:
        _attach_categories(car, data["category_ids"])

    db.session.commit()
    return jsonify(car_schema.dump(car))


# ── PATCH /api/cars/<id>/stock ───────────────────────────────────────────────
@cars_bp.patch("/<string:car_id>/stock")
def update_stock(car_id: str):
    """Lightweight endpoint just for updating stock quantity."""
    car  = Car.query.get_or_404(car_id)
    data = request.get_json(silent=True) or {}

    qty = data.get("stock_quantity")
    if qty is None or not isinstance(qty, int) or qty < 0:
        abort(400, description="Provide a non-negative integer 'stock_quantity'")

    car.stock_quantity = qty
    db.session.commit()
    return jsonify({"id": car.id, "stock_quantity": car.stock_quantity})


# ── DELETE /api/cars/<id> ────────────────────────────────────────────────────
@cars_bp.delete("/<string:car_id>")
def delete_car(car_id: str):
    car = Car.query.get_or_404(car_id)
    db.session.delete(car)
    db.session.commit()
    return "", 204


# ── Helpers ──────────────────────────────────────────────────────────────────

def _attach_categories(car: Car, category_ids: list[str]) -> None:
    from ..models.category import Category
    categories = Category.query.filter(Category.id.in_(category_ids)).all()
    car.categories = categories

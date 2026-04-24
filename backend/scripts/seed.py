"""
Seed the database from the existing JSON mock data.

Usage (from the backend/ directory):
    FLASK_ENV=development python -m scripts.seed

Or with an explicit config:
    FLASK_CONFIG=production python -m scripts.seed
"""
import json
import os
import sys
from pathlib import Path

# Allow running from the backend/ directory directly
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app
from app.extensions import db
from app.models.car import Car, ConditionEnum, ScaleEnum, VehicleTypeEnum, MaterialEnum
from app.models.category import Category, CategoryTypeEnum

# Path to the existing frontend mock data
DATA_DIR = Path(__file__).resolve().parents[2] / "data"

CATEGORY_TYPE_MAP = {
    "era":         CategoryTypeEnum.era,
    "brand":       CategoryTypeEnum.brand,
    "scale":       CategoryTypeEnum.scale,
    "vehicleType": CategoryTypeEnum.vehicle_type,
    "condition":   CategoryTypeEnum.condition,
    "material":    CategoryTypeEnum.material,
}


def seed_categories(session) -> dict[str, Category]:
    raw = json.loads((DATA_DIR / "categories.json").read_text())
    categories: dict[str, Category] = {}

    for item in raw:
        existing = session.get(Category, item["id"])
        if existing:
            categories[item["id"]] = existing
            continue

        cat = Category(
            id          = item["id"],
            name        = item["name"],
            slug        = item["slug"],
            type        = CATEGORY_TYPE_MAP[item["type"]],
            description = item.get("description", ""),
            image_url   = item.get("imageUrl", ""),
        )
        session.add(cat)
        categories[item["id"]] = cat
        print(f"  + category: {cat.id}")

    return categories


def seed_cars(session, categories: dict[str, Category]) -> None:
    raw = json.loads((DATA_DIR / "cars.json").read_text())

    for item in raw:
        existing = session.get(Car, item["id"])
        if existing:
            print(f"  ~ car already exists, skipping: {item['id']}")
            continue

        price_cents = round(item["price"] * 100) if item.get("price") is not None else None

        car = Car(
            id              = item["id"],
            name            = item["name"],
            brand           = item["brand"],
            description     = item.get("description", ""),
            production_year = item["productionYear"],
            model_year      = item["modelYear"],
            scale           = ScaleEnum(item["scale"]),
            condition       = ConditionEnum(item["condition"]),
            vehicle_type    = VehicleTypeEnum(item["vehicleType"]),
            material        = MaterialEnum(item["material"]),
            price_cents     = price_cents,
            marketplace_url = item.get("facebookMarketplaceUrl"),
            # Default every seeded listing to 1 unit in stock.
            # Adjust per-listing in the admin panel after seeding.
            stock_quantity  = 1,
            images          = item.get("images", []),
            tags            = item.get("tags", []),
            featured        = item.get("featured", False),
        )

        # Wire up categories
        car.categories = [
            categories[cid]
            for cid in item.get("categoryIds", [])
            if cid in categories
        ]

        session.add(car)
        print(f"  + car: {car.id}")


def main() -> None:
    config_name = os.getenv("FLASK_CONFIG", os.getenv("FLASK_ENV", "development"))
    app = create_app(config_name)

    print(f"Seeding database (config={config_name!r}) ...")

    with app.app_context():
        db.create_all()
        print("Tables ensured.")

        categories = seed_categories(db.session)
        seed_cars(db.session, categories)
        db.session.commit()

    print("Seed complete.")


if __name__ == "__main__":
    main()

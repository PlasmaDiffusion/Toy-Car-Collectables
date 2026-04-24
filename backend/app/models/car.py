import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Numeric, Boolean, Text,
    DateTime, Enum as PgEnum, ForeignKey, Table
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import relationship, validates
from ..extensions import db


# --- Enums (mirror TypeScript union types) ---

class ConditionEnum(str, enum.Enum):
    mint_in_box = "Mint in Box"
    near_mint   = "Near Mint"
    excellent   = "Excellent"
    good        = "Good"
    fair        = "Fair"


class ScaleEnum(str, enum.Enum):
    scale_1_18  = "1:18"
    scale_1_24  = "1:24"
    scale_1_43  = "1:43"
    scale_1_64  = "1:64"
    scale_1_87  = "1:87"
    other       = "Other"


class VehicleTypeEnum(str, enum.Enum):
    muscle_car        = "Muscle Car"
    sports_car        = "Sports Car"
    race_car          = "Race Car"
    movie_and_tv      = "Movie & TV"
    truck_and_van     = "Truck & Van"
    emergency_vehicle = "Emergency Vehicle"
    motorcycle        = "Motorcycle"
    classic           = "Classic"


class MaterialEnum(str, enum.Enum):
    diecast = "Diecast"
    plastic = "Plastic"
    tin     = "Tin"
    resin   = "Resin"


# --- Association table for many-to-many Car <-> Category ---

car_categories = Table(
    "car_categories",
    db.metadata,
    Column("car_id",      String(120), ForeignKey("cars.id",       ondelete="CASCADE"), primary_key=True),
    Column("category_id", String(120), ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)


# --- Car model ---

class Car(db.Model):
    __tablename__ = "cars"

    # Primary key matches the slug-style IDs from the frontend (e.g. "hw-1969-mustang-boss-redline")
    id = Column(String(120), primary_key=True)

    name            = Column(String(255), nullable=False)
    brand           = Column(String(100), nullable=False, index=True)
    description     = Column(Text, nullable=False)

    # Year this specific toy was manufactured
    production_year = Column(Integer, nullable=False, index=True)
    # Year of the real-world vehicle being modeled
    model_year      = Column(Integer, nullable=False)

    scale        = Column(PgEnum(ScaleEnum,       name="scale_enum"),        nullable=False)
    condition    = Column(PgEnum(ConditionEnum,   name="condition_enum"),    nullable=False, index=True)
    vehicle_type = Column(PgEnum(VehicleTypeEnum, name="vehicle_type_enum"), nullable=False, index=True)
    material     = Column(PgEnum(MaterialEnum,    name="material_enum"),     nullable=False)

    # Asking price in USD cents to avoid float precision issues; NULL = price on request
    price_cents = Column(Integer, nullable=True)

    # Direct link to a Facebook Marketplace (or other) listing; NULL = coming soon
    marketplace_url = Column(Text, nullable=True)

    # Units currently available for sale (0 = sold / out of stock)
    stock_quantity = Column(Integer, nullable=False, default=1)

    # PostgreSQL ARRAY / JSONB for multi-value fields
    # Falls back to JSONB text[] on any Postgres version; swap to JSON for SQLite in tests
    images = Column(ARRAY(Text), nullable=False, default=list)
    tags   = Column(ARRAY(Text), nullable=False, default=list)

    featured = Column(Boolean, nullable=False, default=False, index=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationship
    categories = relationship(
        "Category",
        secondary=car_categories,
        back_populates="cars",
        lazy="select",
    )

    # --- Computed helpers ---

    @property
    def price(self) -> float | None:
        return self.price_cents / 100 if self.price_cents is not None else None

    @price.setter
    def price(self, value: float | None) -> None:
        self.price_cents = round(value * 100) if value is not None else None

    @property
    def category_ids(self) -> list[str]:
        return [c.id for c in self.categories]

    # --- Validation ---

    @validates("production_year", "model_year")
    def validate_year(self, key, value):
        if not (1900 <= value <= 2100):
            raise ValueError(f"{key} must be between 1900 and 2100, got {value}")
        return value

    @validates("stock_quantity")
    def validate_stock(self, key, value):
        if value < 0:
            raise ValueError("stock_quantity cannot be negative")
        return value

    def __repr__(self) -> str:
        return f"<Car id={self.id!r} name={self.name!r}>"

import enum
from sqlalchemy import Column, String, Integer, Text, Enum as PgEnum
from sqlalchemy.orm import relationship
from ..extensions import db
from .car import car_categories


class CategoryTypeEnum(str, enum.Enum):
    era          = "era"
    brand        = "brand"
    scale        = "scale"
    vehicle_type = "vehicleType"
    condition    = "condition"
    material     = "material"


class Category(db.Model):
    __tablename__ = "categories"

    id          = Column(String(120), primary_key=True)
    name        = Column(String(100), nullable=False)
    slug        = Column(String(120), nullable=False, unique=True, index=True)
    type        = Column(PgEnum(CategoryTypeEnum, name="category_type_enum"), nullable=False, index=True)
    description = Column(Text, nullable=False, default="")
    image_url   = Column(Text, nullable=False, default="")

    cars = relationship(
        "Car",
        secondary=car_categories,
        back_populates="categories",
        lazy="select",
    )

    @property
    def count(self) -> int:
        return len(self.cars)

    def __repr__(self) -> str:
        return f"<Category id={self.id!r} name={self.name!r}>"

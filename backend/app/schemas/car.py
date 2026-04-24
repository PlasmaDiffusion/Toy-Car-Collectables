from marshmallow import fields, post_dump
from ..extensions import ma
from ..models.car import Car


class CarSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Car
        load_instance = True
        include_relationships = True
        # Exclude raw cents column — expose price as float via the property
        exclude = ("price_cents",)

    # Computed / property fields
    price       = fields.Float(allow_none=True, dump_only=True)
    category_ids = fields.List(fields.String(), dump_only=True)

    # Nested categories as simple id strings (full category objects via CategorySchema)
    categories  = fields.List(fields.Nested(lambda: CategorySchema(only=("id", "name", "slug", "type"))), dump_only=True)

    @post_dump
    def coerce_enums(self, data, **kwargs):
        # Marshmallow serialises IntEnum/StrEnum as objects in some versions; ensure plain strings
        for enum_field in ("scale", "condition", "vehicle_type", "material"):
            if isinstance(data.get(enum_field), dict):
                data[enum_field] = data[enum_field].get("value", data[enum_field])
        return data


class CarSummarySchema(ma.SQLAlchemyAutoSchema):
    """Lightweight schema for list endpoints — omits description and images."""
    class Meta:
        model = Car
        load_instance = False
        fields = (
            "id", "name", "brand", "production_year", "model_year",
            "scale", "condition", "vehicle_type", "material",
            "price", "marketplace_url", "stock_quantity",
            "featured", "tags", "category_ids",
        )

    price        = fields.Float(allow_none=True, dump_only=True)
    category_ids = fields.List(fields.String(), dump_only=True)

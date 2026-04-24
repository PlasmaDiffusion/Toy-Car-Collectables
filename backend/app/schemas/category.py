from marshmallow import fields
from ..extensions import ma
from ..models.category import Category


class CategorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Category
        load_instance = True
        include_relationships = False

    count = fields.Integer(dump_only=True)

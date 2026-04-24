from flask import Flask
from .config import config_by_name
from .extensions import db, migrate, cors, ma


def create_app(config_name: str = "development") -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    ma.init_app(app)

    from .routes.cars import cars_bp
    from .routes.categories import categories_bp

    app.register_blueprint(cars_bp, url_prefix="/api/cars")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")

    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "diecast-vault-api"}

    return app

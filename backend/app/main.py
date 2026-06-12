from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import create_db_and_tables, settings
from app.routers import properties, tenants, payments, dashboard

# Importar todos los modelos para que SQLModel los registre
from app.models import Property, Tenant, Payment  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: crear tablas si no existen
    create_db_and_tables()
    yield
    # Shutdown: nada que limpiar


app = FastAPI(
    title="AlquiControl API",
    description="Gestor inteligente de alquileres para pequeños propietarios",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — permitir requests desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(properties.router)
app.include_router(tenants.router)
app.include_router(payments.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {
        "app": "AlquiControl API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}

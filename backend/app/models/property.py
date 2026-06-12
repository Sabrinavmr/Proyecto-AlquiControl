from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from .tenant import Tenant
    from .payment import Payment


class PropertyType(str, Enum):
    departamento = "Departamento"
    habitacion = "Habitación"
    local = "Local"
    casa = "Casa"
    otro = "Otro"


class PropertyStatus(str, Enum):
    disponible = "Disponible"
    alquilada = "Alquilada"
    mantenimiento = "En mantenimiento"


class Property(SQLModel, table=True):
    __tablename__ = "properties"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    address: str
    type: PropertyType = PropertyType.departamento
    monthly_price: float
    status: PropertyStatus = PropertyStatus.disponible
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relaciones
    tenants: List["Tenant"] = Relationship(back_populates="property")
    payments: List["Payment"] = Relationship(back_populates="property")

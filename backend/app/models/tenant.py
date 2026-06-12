from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import date, datetime
from enum import Enum

if TYPE_CHECKING:
    from .property import Property
    from .payment import Payment


class TenantStatus(str, Enum):
    activo = "Activo"
    finalizado = "Finalizado"


class Tenant(SQLModel, table=True):
    __tablename__ = "tenants"

    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str = Field(index=True)
    phone: str
    email: str = Field(index=True)
    property_id: Optional[int] = Field(default=None, foreign_key="properties.id")
    move_in_date: date
    status: TenantStatus = TenantStatus.activo
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relaciones
    property: Optional["Property"] = Relationship(back_populates="tenants")
    payments: List["Payment"] = Relationship(back_populates="tenant")

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import date, datetime
from enum import Enum

if TYPE_CHECKING:
    from .property import Property
    from .tenant import Tenant


class PaymentStatus(str, Enum):
    pendiente = "Pendiente"
    pagado = "Pagado"
    vencido = "Vencido"


class PaymentMethod(str, Enum):
    efectivo = "Efectivo"
    transferencia = "Transferencia"
    mercado_pago = "Mercado Pago"
    otro = "Otro"


class Payment(SQLModel, table=True):
    __tablename__ = "payments"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key="tenants.id")
    property_id: int = Field(foreign_key="properties.id")
    month: str  # Ej: "Junio 2026"
    amount: float
    due_date: date
    paid_date: Optional[date] = None
    payment_method: PaymentMethod = PaymentMethod.transferencia
    status: PaymentStatus = PaymentStatus.pendiente
    notes: Optional[str] = None
    email_sent: bool = Field(default=False)
    email_sent_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relaciones
    tenant: Optional["Tenant"] = Relationship(back_populates="payments")
    property: Optional["Property"] = Relationship(back_populates="payments")

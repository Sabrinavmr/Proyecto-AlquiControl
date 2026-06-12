from sqlmodel import SQLModel
from typing import Optional
from datetime import date, datetime
from app.models.payment import PaymentStatus, PaymentMethod
from app.schemas.property_schema import PropertyRead
from app.schemas.tenant_schema import TenantRead


class PaymentBase(SQLModel):
    tenant_id: int
    property_id: int
    month: str
    amount: float
    due_date: date
    payment_method: PaymentMethod = PaymentMethod.transferencia
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(SQLModel):
    month: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[date] = None
    payment_method: Optional[PaymentMethod] = None
    status: Optional[PaymentStatus] = None
    notes: Optional[str] = None


class PaymentMarkPaid(SQLModel):
    paid_date: date
    payment_method: Optional[PaymentMethod] = None


class PaymentRead(PaymentBase):
    id: int
    status: PaymentStatus
    paid_date: Optional[date] = None
    email_sent: bool
    email_sent_at: Optional[datetime] = None
    created_at: datetime
    tenant: Optional[TenantRead] = None
    property: Optional[PropertyRead] = None

    class Config:
        from_attributes = True


class AssistantRequest(SQLModel):
    payment_id: int
    tone: str = "amable"  # amable | formal | urgente
    send_email: bool = True


class AssistantResponse(SQLModel):
    message: str
    email_sent: bool
    email_to: Optional[str] = None

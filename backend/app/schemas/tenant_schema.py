from sqlmodel import SQLModel
from typing import Optional
from datetime import date, datetime
from app.models.tenant import TenantStatus
from app.schemas.property_schema import PropertyRead


class TenantBase(SQLModel):
    full_name: str
    phone: str
    email: str
    property_id: Optional[int] = None
    move_in_date: date
    status: TenantStatus = TenantStatus.activo
    notes: Optional[str] = None


class TenantCreate(TenantBase):
    pass


class TenantUpdate(SQLModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    property_id: Optional[int] = None
    move_in_date: Optional[date] = None
    status: Optional[TenantStatus] = None
    notes: Optional[str] = None


class TenantRead(TenantBase):
    id: int
    created_at: datetime
    property: Optional[PropertyRead] = None

    class Config:
        from_attributes = True

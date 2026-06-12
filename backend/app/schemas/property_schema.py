from sqlmodel import SQLModel
from typing import Optional
from datetime import datetime
from app.models.property import PropertyType, PropertyStatus


class PropertyBase(SQLModel):
    name: str
    address: str
    type: PropertyType = PropertyType.departamento
    monthly_price: float
    status: PropertyStatus = PropertyStatus.disponible
    notes: Optional[str] = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(SQLModel):
    name: Optional[str] = None
    address: Optional[str] = None
    type: Optional[PropertyType] = None
    monthly_price: Optional[float] = None
    status: Optional[PropertyStatus] = None
    notes: Optional[str] = None


class PropertyRead(PropertyBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

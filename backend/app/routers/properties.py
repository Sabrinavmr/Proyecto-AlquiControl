from fastapi import APIRouter, HTTPException, Depends, Query
from sqlmodel import Session, select
from typing import List, Optional
from app.database import get_session
from app.models.property import Property
from app.models.property import PropertyStatus
from app.schemas.property_schema import PropertyCreate, PropertyRead, PropertyUpdate

router = APIRouter(prefix="/api/properties", tags=["properties"])


@router.get("/", response_model=List[PropertyRead])
def list_properties(
    status: Optional[PropertyStatus] = Query(default=None),
    session: Session = Depends(get_session),
):
    query = select(Property)
    if status:
        query = query.where(Property.status == status)
    return session.exec(query.order_by(Property.created_at.desc())).all()


@router.post("/", response_model=PropertyRead, status_code=201)
def create_property(data: PropertyCreate, session: Session = Depends(get_session)):
    property = Property.model_validate(data)
    session.add(property)
    session.commit()
    session.refresh(property)
    return property


@router.get("/{property_id}", response_model=PropertyRead)
def get_property(property_id: int, session: Session = Depends(get_session)):
    property = session.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return property


@router.put("/{property_id}", response_model=PropertyRead)
def update_property(
    property_id: int,
    data: PropertyUpdate,
    session: Session = Depends(get_session),
):
    property = session.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(property, key, value)

    session.add(property)
    session.commit()
    session.refresh(property)
    return property


@router.delete("/{property_id}", status_code=204)
def delete_property(property_id: int, session: Session = Depends(get_session)):
    property = session.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    session.delete(property)
    session.commit()

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlmodel import Session, select
from typing import List, Optional
from app.database import get_session
from app.models.tenant import Tenant, TenantStatus
from app.schemas.tenant_schema import TenantCreate, TenantRead, TenantUpdate

router = APIRouter(prefix="/api/tenants", tags=["tenants"])


@router.get("/", response_model=List[TenantRead])
def list_tenants(
    status: Optional[TenantStatus] = Query(default=None),
    property_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
):
    query = select(Tenant)
    if status:
        query = query.where(Tenant.status == status)
    if property_id:
        query = query.where(Tenant.property_id == property_id)

    tenants = session.exec(query.order_by(Tenant.created_at.desc())).all()

    # Cargar relación property
    for tenant in tenants:
        _ = tenant.property

    return tenants


@router.post("/", response_model=TenantRead, status_code=201)
def create_tenant(data: TenantCreate, session: Session = Depends(get_session)):
    # Validar que la propiedad exista si se asigna
    if data.property_id:
        from app.models.property import Property
        prop = session.get(Property, data.property_id)
        if not prop:
            raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    tenant = Tenant.model_validate(data)
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    _ = tenant.property
    return tenant


@router.get("/{tenant_id}", response_model=TenantRead)
def get_tenant(tenant_id: int, session: Session = Depends(get_session)):
    tenant = session.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
    _ = tenant.property
    return tenant


@router.put("/{tenant_id}", response_model=TenantRead)
def update_tenant(
    tenant_id: int,
    data: TenantUpdate,
    session: Session = Depends(get_session),
):
    tenant = session.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tenant, key, value)

    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    _ = tenant.property
    return tenant


@router.delete("/{tenant_id}", status_code=204)
def delete_tenant(tenant_id: int, session: Session = Depends(get_session)):
    tenant = session.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
    session.delete(tenant)
    session.commit()

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlmodel import Session, select
from sqlalchemy import or_
from typing import List, Optional
from datetime import date, datetime
from app.database import get_session
from app.models.payment import Payment, PaymentStatus
from app.schemas.payment_schema import (
    PaymentCreate, PaymentRead, PaymentUpdate,
    PaymentMarkPaid, AssistantRequest, AssistantResponse,
)
from app.services.payment_service import calculate_payment_status, get_payment_with_relations
from app.services.assistant_service import generate_message, send_email

router = APIRouter(prefix="/api/payments", tags=["payments"])


def _load_payment_relations(payment: Payment):
    _ = payment.tenant
    _ = payment.property
    if payment.tenant:
        _ = payment.tenant.property


@router.get("/", response_model=List[PaymentRead])
def list_payments(
    status: Optional[PaymentStatus] = Query(default=None),
    tenant_id: Optional[int] = Query(default=None),
    property_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
):
    query = select(Payment)
    if status:
        query = query.where(Payment.status == status)
    if tenant_id:
        query = query.where(Payment.tenant_id == tenant_id)
    if property_id:
        query = query.where(Payment.property_id == property_id)

    payments = session.exec(query.order_by(Payment.due_date.desc())).all()
    for p in payments:
        _load_payment_relations(p)
    return payments


@router.post("/", response_model=PaymentRead, status_code=201)
def create_payment(data: PaymentCreate, session: Session = Depends(get_session)):
    payment = Payment.model_validate(data)
    # Calcular estado inicial
    payment.status = calculate_payment_status(payment)

    session.add(payment)
    session.commit()
    session.refresh(payment)
    _load_payment_relations(payment)
    return payment


@router.get("/{payment_id}", response_model=PaymentRead)
def get_payment(payment_id: int, session: Session = Depends(get_session)):
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    _load_payment_relations(payment)
    return payment


@router.put("/{payment_id}", response_model=PaymentRead)
def update_payment(
    payment_id: int,
    data: PaymentUpdate,
    session: Session = Depends(get_session),
):
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(payment, key, value)

    # Recalcular estado si no se especificó explícitamente
    if "status" not in update_data:
        payment.status = calculate_payment_status(payment)

    session.add(payment)
    session.commit()
    session.refresh(payment)
    _load_payment_relations(payment)
    return payment


@router.patch("/{payment_id}/mark-paid", response_model=PaymentRead)
def mark_payment_paid(
    payment_id: int,
    data: PaymentMarkPaid,
    session: Session = Depends(get_session),
):
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    payment.status = PaymentStatus.pagado
    payment.paid_date = data.paid_date
    if data.payment_method:
        payment.payment_method = data.payment_method

    session.add(payment)
    session.commit()
    session.refresh(payment)
    _load_payment_relations(payment)
    return payment


@router.delete("/{payment_id}", status_code=204)
def delete_payment(payment_id: int, session: Session = Depends(get_session)):
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    session.delete(payment)
    session.commit()


@router.post("/{payment_id}/send-reminder", response_model=AssistantResponse)
def send_payment_reminder(
    payment_id: int,
    request: AssistantRequest,
    session: Session = Depends(get_session),
):
    """El endpoint clave: Claude genera el mensaje y Resend lo envía automáticamente."""
    payment = get_payment_with_relations(payment_id, session)
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    if payment.status == PaymentStatus.pagado:
        raise HTTPException(
            status_code=400,
            detail="El pago ya fue marcado como pagado"
        )

    # 1. Generar mensaje con IA
    try:
        message = generate_message(payment, tone=request.tone)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando mensaje: {str(e)}")

    # 2. Enviar email automáticamente
    email_sent = False
    email_to = None
    if request.send_email and payment.tenant and payment.tenant.email:
        email_sent = send_email(payment, message)
        email_to = payment.tenant.email

        if email_sent:
            payment.email_sent = True
            payment.email_sent_at = datetime.utcnow()
            session.add(payment)
            session.commit()

    return AssistantResponse(
        message=message,
        email_sent=email_sent,
        email_to=email_to,
    )

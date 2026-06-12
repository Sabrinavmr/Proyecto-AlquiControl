from datetime import date
from sqlmodel import Session, select
from app.models.payment import Payment, PaymentStatus
from app.models.tenant import Tenant
from app.models.property import Property


def calculate_payment_status(payment: Payment) -> PaymentStatus:
    """Regla de negocio central: determina el estado real del pago."""
    if payment.status == PaymentStatus.pagado:
        return PaymentStatus.pagado
    if payment.due_date < date.today():
        return PaymentStatus.vencido
    return PaymentStatus.pendiente


def sync_payment_statuses(session: Session):
    """Actualiza automáticamente los estados vencidos. Se puede llamar en startup o via cron."""
    payments = session.exec(
        select(Payment).where(Payment.status == PaymentStatus.pendiente)
    ).all()

    updated = 0
    for payment in payments:
        new_status = calculate_payment_status(payment)
        if new_status != payment.status:
            payment.status = new_status
            session.add(payment)
            updated += 1

    if updated > 0:
        session.commit()

    return updated


def get_payment_with_relations(payment_id: int, session: Session) -> Payment | None:
    payment = session.get(Payment, payment_id)
    if payment:
        # Cargar relaciones
        _ = payment.tenant
        _ = payment.property
        if payment.tenant:
            _ = payment.tenant.property
    return payment

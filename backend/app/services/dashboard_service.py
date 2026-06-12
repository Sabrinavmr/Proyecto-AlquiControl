from sqlmodel import Session, select, func
from datetime import date
from app.models.property import Property, PropertyStatus
from app.models.tenant import Tenant, TenantStatus
from app.models.payment import Payment, PaymentStatus
from app.services.payment_service import sync_payment_statuses


def get_dashboard_summary(session: Session) -> dict:
    # Sincronizar estados vencidos antes de calcular
    sync_payment_statuses(session)

    # Propiedades
    total_properties = session.exec(select(func.count(Property.id))).one()
    rented = session.exec(
        select(func.count(Property.id)).where(Property.status == PropertyStatus.alquilada)
    ).one()
    available = session.exec(
        select(func.count(Property.id)).where(Property.status == PropertyStatus.disponible)
    ).one()

    # Inquilinos
    active_tenants = session.exec(
        select(func.count(Tenant.id)).where(Tenant.status == TenantStatus.activo)
    ).one()

    # Pagos del mes actual
    current_month = date.today().strftime("%B %Y")  # Ej: "June 2026" — ajustar a español abajo

    pending_payments = session.exec(
        select(func.count(Payment.id)).where(Payment.status == PaymentStatus.pendiente)
    ).one()

    overdue_payments = session.exec(
        select(func.count(Payment.id)).where(Payment.status == PaymentStatus.vencido)
    ).one()

    # Monto cobrado este mes
    collected = session.exec(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(
            Payment.status == PaymentStatus.pagado,
            func.strftime("%Y-%m", Payment.paid_date) == date.today().strftime("%Y-%m"),
        )
    ).one()

    # Monto por cobrar (pendientes + vencidos)
    to_collect = session.exec(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(
            Payment.status.in_([PaymentStatus.pendiente, PaymentStatus.vencido])
        )
    ).one()

    # Últimos pagos vencidos (para alertas en el dashboard)
    overdue_list = session.exec(
        select(Payment)
        .where(Payment.status == PaymentStatus.vencido)
        .order_by(Payment.due_date.asc())
        .limit(5)
    ).all()

    return {
        "total_properties": total_properties,
        "rented_properties": rented,
        "available_properties": available,
        "active_tenants": active_tenants,
        "pending_payments": pending_payments,
        "overdue_payments": overdue_payments,
        "collected_this_month": float(collected),
        "amount_to_collect": float(to_collect),
        "overdue_alerts": [
            {
                "id": p.id,
                "tenant_name": p.tenant.full_name if p.tenant else "",
                "property_name": p.property.name if p.property else "",
                "month": p.month,
                "amount": p.amount,
                "days_overdue": (date.today() - p.due_date).days,
            }
            for p in overdue_list
        ],
    }

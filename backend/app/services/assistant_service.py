import resend
from google import genai
from datetime import datetime
from app.database import settings
from app.models.payment import Payment, PaymentStatus


def _build_prompt(payment: Payment, tone: str) -> str:
    tenant_name = payment.tenant.full_name if payment.tenant else "Inquilino"
    property_name = payment.property.name if payment.property else "la propiedad"
    amount_formatted = f"${payment.amount:,.0f}".replace(",", ".")
    due_date_formatted = payment.due_date.strftime("%d/%m/%Y")

    tone_instruction = {
        "amable": "Usá un tono amable, cercano y cordial. Usá tuteo (vos).",
        "formal": "Usá un tono formal y profesional. Usá usted.",
        "urgente": "El tono debe ser claro y directo, pero sin ser agresivo. Dejá en claro que necesitás una respuesta pronto.",
    }.get(tone, "Usá un tono amable y cordial.")

    status_context = {
        PaymentStatus.pendiente: f"El pago del alquiler vence el {due_date_formatted} y aún no fue realizado.",
        PaymentStatus.vencido: f"El pago del alquiler venció el {due_date_formatted} y figura como impago.",
        PaymentStatus.pagado: f"El pago fue recibido correctamente.",
    }.get(payment.status, "")

    return f"""Sos el asistente de AlquiControl, una app de gestión de alquileres.
Generá un mensaje corto para enviar por email al inquilino sobre su pago.

Datos del pago:
- Inquilino: {tenant_name}
- Propiedad: {property_name}
- Mes: {payment.month}
- Monto: {amount_formatted}
- Vencimiento: {due_date_formatted}
- Estado: {payment.status.value}
- Situación: {status_context}

Instrucciones de tono: {tone_instruction}

El mensaje debe:
1. Saludar al inquilino por su nombre
2. Mencionar claramente la propiedad y el mes
3. Indicar el monto
4. Según el estado: recordar el vencimiento (pendiente), pedir regularización (vencido), o confirmar recepción (pagado)
5. Cerrar cordialmente con el nombre "AlquiControl"

Respondé SOLO con el texto del mensaje, sin asunto, sin etiquetas, sin explicaciones."""



def generate_message(payment: Payment, tone: str = "amable") -> str:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=_build_prompt(payment, tone)
    )
    return response.text.strip()


def send_email(payment: Payment, message: str) -> bool:
    """Envía el email generado usando Resend."""
    if not settings.RESEND_API_KEY:
        return False

    resend.api_key = settings.RESEND_API_KEY

    tenant_name = payment.tenant.full_name if payment.tenant else "Inquilino"
    tenant_email = payment.tenant.email if payment.tenant else None

    if not tenant_email:
        return False

    subject_map = {
        PaymentStatus.pendiente: f"Recordatorio de pago — {payment.month}",
        PaymentStatus.vencido: f"Pago vencido — {payment.month}",
        PaymentStatus.pagado: f"Confirmación de pago recibido — {payment.month}",
    }

    subject = subject_map.get(payment.status, f"AlquiControl — {payment.month}")

    params: resend.Emails.SendParams = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [tenant_email],
        "subject": subject,
        "text": message,
        "html": _message_to_html(tenant_name, message),
    }

    try:
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False


def _message_to_html(tenant_name: str, message: str) -> str:
    """Convierte el mensaje en un email HTML simple pero prolijo."""
    paragraphs = "".join(
        f"<p style='margin:0 0 12px 0;line-height:1.6'>{line}</p>"
        for line in message.split("\n")
        if line.strip()
    )
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
             background:#f5f5f5;margin:0;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;
              border-radius:12px;overflow:hidden;
              box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <div style="background:#1a56db;padding:24px 28px">
      <span style="color:#fff;font-size:18px;font-weight:600">AlquiControl</span>
    </div>
    <div style="padding:28px">
      {paragraphs}
    </div>
    <div style="padding:16px 28px;border-top:1px solid #f0f0f0;
                font-size:12px;color:#999;text-align:center">
      Este mensaje fue generado automáticamente por AlquiControl.
    </div>
  </div>
</body>
</html>"""

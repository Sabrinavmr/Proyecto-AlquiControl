# AlquiControl 🏠

**Gestor inteligente de alquileres para pequeños propietarios**

AlquiControl es una aplicación web full stack que permite administrar propiedades, inquilinos y pagos mensuales desde un panel centralizado. Incluye detección automática de pagos vencidos, dashboard financiero y un **asistente de IA** que genera mensajes personalizados y los envía por email automáticamente al inquilino.

[![CI](https://github.com/Sabrinavmr/Proyecto-AlquiControl/actions/workflows/ci.yml/badge.svg)](https://github.com/Sabrinavmr/Proyecto-AlquiControl/actions)

---

## Demo

🌐 **Frontend:** [proyecto-alqui-control.vercel.app](https://proyecto-alqui-control.vercel.app)
⚙️ **API:** [alquicontrol.onrender.com/docs](https://alquicontrol.onrender.com/docs)

> **Nota:** El backend usa Render (plan gratuito) y puede tardar hasta 30 segundos en responder la primera vez (cold start). Luego responde con normalidad.

---

## Funcionalidades

- **Propiedades** — CRUD completo con tipos y estados (disponible, alquilada, en mantenimiento)
- **Inquilinos** — Registro con asignación a propiedad, teléfono y email
- **Pagos** — Registro mensual con cálculo automático de estados vencidos
- **Dashboard** — Métricas en tiempo real: cobrado, por cobrar, alertas de vencidos
- **Asistente IA** — Gemini genera un mensaje personalizado (tono amable/formal/urgente) y lo envía por email automáticamente al inquilino via Resend
- **WhatsApp Web** — Link prellenado como canal alternativo

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | FastAPI + Python 3.13 |
| ORM | SQLModel (SQLAlchemy) |
| Base de datos | SQLite (dev) |
| IA | Google Gemini API (gemini-3-flash-preview) |
| Email | Resend |
| Deploy frontend | Vercel |
| Deploy backend | Render |
| CI/CD | GitHub Actions |

---

## IA utilizada

### Durante el desarrollo
- **Claude (claude.ai)** — Arquitectura del proyecto, diseño de entidades, revisión de código, generación de componentes, depuración de errores
- **Claude Code** — Generación de boilerplate, estructura de routers y servicios

### En la funcionalidad del sistema
El asistente de IA está integrado directamente en el flujo de pagos:
1. El sistema detecta un pago pendiente o vencido
2. El usuario elige el tono del mensaje (amable / formal / urgente)
3. **Google Gemini** genera un mensaje personalizado considerando: nombre del inquilino, propiedad, mes, monto, fecha de vencimiento y estado
4. **Resend** envía el email automáticamente al inquilino
5. El sistema registra que el email fue enviado (campo `email_sent`)

---

## Instalación local

### Requisitos
- Python 3.11+
- Node.js 20+

### Backend

```bash
cd backend
cp .env.example .env
# Completar .env con tus keys
pip install -r requirements.txt
uvicorn app.main:app --reload
```

La API queda disponible en `http://localhost:8000`
Documentación interactiva: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
cp .env.example .env
# En .env dejar VITE_API_URL vacío para desarrollo local
npm install --legacy-peer-deps
npm run dev
```

El frontend queda disponible en `http://localhost:5173`

---

## Variables de entorno

### Backend (`.env`)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | `sqlite:///./alquicontrol.db` para desarrollo local |
| `GEMINI_API_KEY` | API key de [aistudio.google.com](https://aistudio.google.com) (gratuita) |
| `RESEND_API_KEY` | API key de [resend.com](https://resend.com) (gratuita, 3000 emails/mes) |
| `RESEND_FROM_EMAIL` | Email remitente (ej: `AlquiControl <onboarding@resend.dev>`) |
| `FRONTEND_URL` | URL del frontend para CORS |

### Frontend (`.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del backend (vacío en dev usa el proxy de Vite) |

---

## Endpoints principales

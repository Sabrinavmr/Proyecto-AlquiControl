# AlquiControl 🏠

**Gestor inteligente de alquileres para pequeños propietarios**

AlquiControl es una aplicación web full stack que permite administrar propiedades, inquilinos y pagos mensuales desde un panel centralizado. Incluye detección automática de pagos vencidos, dashboard financiero y un **asistente de IA** que genera mensajes personalizados y los envía por email automáticamente al inquilino.

[![CI](https://github.com/TU_USUARIO/alquicontrol/actions/workflows/ci.yml/badge.svg)](https://github.com/TU_USUARIO/alquicontrol/actions)

---

## Demo

🌐 **Frontend:** [alquicontrol.vercel.app](https://alquicontrol.vercel.app)
⚙️ **API:** [alquicontrol-api.onrender.com](https://alquicontrol-api.onrender.com/docs)

> **Nota:** El backend usa Render (plan gratuito) y puede tardar hasta 30 segundos en responder la primera vez (cold start). Luego responde con normalidad.

---

## Funcionalidades

- **Propiedades** — CRUD completo con tipos y estados (disponible, alquilada, en mantenimiento)
- **Inquilinos** — Registro con asignación a propiedad, teléfono y email
- **Pagos** — Registro mensual con cálculo automático de estados vencidos
- **Dashboard** — Métricas en tiempo real: cobrado, por cobrar, alertas de vencidos
- **Asistente IA** — Claude genera un mensaje personalizado (tono amable/formal/urgente) y lo envía por email automáticamente al inquilino
- **WhatsApp Web** — Link prellenado como canal alternativo

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI + Python 3.11 |
| ORM | SQLModel (SQLAlchemy) |
| Base de datos | SQLite (dev) / PostgreSQL (prod) |
| IA | Anthropic Claude API |
| Email | Resend |
| Deploy frontend | Vercel |
| Deploy backend | Render |
| Base de datos cloud | Supabase |
| CI/CD | GitHub Actions |

---

## IA utilizada

### Durante el desarrollo
- **Claude (claude.ai)** — Arquitectura del proyecto, diseño de entidades, revisión de código, generación de componentes, depuración de errores
- **Claude Code** — Generación de boilerplate, refactoring, estructura de routers y servicios

### En la funcionalidad del sistema
El asistente de IA está integrado directamente en el flujo de pagos:
1. El sistema detecta un pago pendiente o vencido
2. El usuario elige el tono del mensaje (amable / formal / urgente)
3. **Claude (claude-opus-4-6)** genera un mensaje personalizado considerando: nombre del inquilino, propiedad, mes, monto, fecha de vencimiento y días de atraso
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
# En .env: VITE_API_URL=http://localhost:8000
npm install --legacy-peer-deps
npm run dev
```

El frontend queda disponible en `http://localhost:5173`

---

## Variables de entorno

### Backend (`.env`)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de PostgreSQL o `sqlite:///./alquicontrol.db` |
| `ANTHROPIC_API_KEY` | API key de [console.anthropic.com](https://console.anthropic.com) |
| `RESEND_API_KEY` | API key de [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | Email remitente (ej: `AlquiControl <noreply@tudominio.com>`) |
| `FRONTEND_URL` | URL del frontend para CORS |

### Frontend (`.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del backend (vacío en dev usa el proxy de Vite) |

---

## Endpoints principales

```
GET    /api/dashboard/summary        → Métricas generales
GET    /api/properties               → Listar propiedades
POST   /api/properties               → Crear propiedad
GET    /api/tenants                  → Listar inquilinos
POST   /api/tenants                  → Crear inquilino
GET    /api/payments                 → Listar pagos
POST   /api/payments                 → Registrar pago
PATCH  /api/payments/{id}/mark-paid  → Marcar como pagado
POST   /api/payments/{id}/send-reminder → Generar y enviar email con IA
```

---

## CI/CD

GitHub Actions ejecuta automáticamente en cada push a `main`:
1. Instala dependencias de Python y valida el backend
2. Instala dependencias de Node y ejecuta `npm run build`

El deploy en Vercel y Render se activa automáticamente desde GitHub.

---

## Agentes de IA

Ver carpeta [`docs/ai-agents/`](docs/ai-agents/) para los prompts especializados utilizados durante el desarrollo.

---

## Mejoras futuras

- Autenticación con login por propietario
- Notificaciones automáticas programadas (cron)
- Integración con WhatsApp Business API
- Generación de comprobantes PDF
- Exportación a Excel
- Módulo de mantenimiento de propiedades

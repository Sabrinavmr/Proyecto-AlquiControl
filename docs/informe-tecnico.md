# Informe técnico — AlquiControl

**Materia:** Desarrollo Ágil Asistido por IA
**Proyecto:** AlquiControl — Gestor inteligente de alquileres
**Alumna:** [Tu nombre]

---

## 1. Introducción

AlquiControl es una aplicación web full stack desarrollada como Trabajo Práctico Integrador. El sistema permite a pequeños propietarios gestionar propiedades, inquilinos y pagos de alquiler desde un panel centralizado, incorporando un asistente de IA que genera mensajes personalizados y los envía automáticamente por email.

---

## 2. Problema detectado

Muchos propietarios particulares administran sus alquileres con herramientas dispersas: Excel, WhatsApp, notas del celular y memoria. Esto genera pagos olvidados, falta de seguimiento y comunicación manual repetitiva con inquilinos.

---

## 3. Objetivo del proyecto

Desarrollar una aplicación web que centralice la gestión de alquileres e incorpore IA para automatizar la comunicación con inquilinos ante pagos pendientes o vencidos.

---

## 4. Alcance

### Incluido en el MVP
- CRUD de propiedades, inquilinos y pagos
- Cálculo automático de pagos vencidos
- Dashboard con métricas financieras
- Asistente IA (Claude) que genera mensajes según el estado del pago
- Envío automático de email con Resend
- Link de WhatsApp Web como canal alternativo
- CI/CD con GitHub Actions
- Deploy en Vercel (frontend) y Render (backend)

### Fuera del alcance
- Login y autenticación
- WhatsApp Business API oficial
- Generación de PDF
- Panel multiusuario

---

## 5. Tecnologías utilizadas

| Tecnología | Uso |
|-----------|-----|
| FastAPI | API REST backend |
| SQLModel | ORM con soporte Pydantic v2 |
| SQLite / PostgreSQL | Base de datos dev / prod |
| React 18 + Vite | Interfaz de usuario |
| Tailwind CSS | Estilos utilitarios |
| Anthropic API | Generación de mensajes con IA |
| Resend | Envío de emails transaccionales |
| GitHub Actions | CI/CD |
| Vercel | Deploy frontend |
| Render | Deploy backend |
| Supabase | PostgreSQL cloud gratuito |

---

## 6. Arquitectura del sistema

```
Usuario → React (Vercel)
            ↓ HTTP / Axios
         FastAPI (Render)
            ↓
         SQLModel ORM
            ↓
         PostgreSQL (Supabase)
            ↓ (cuando se envía recordatorio)
         Anthropic API → genera mensaje
         Resend → envía email al inquilino
```

---

## 7. Modelo de datos

### Property
`id | name | address | type | monthly_price | status | notes | created_at`

### Tenant
`id | full_name | phone | email | property_id | move_in_date | status | notes | created_at`

### Payment
`id | tenant_id | property_id | month | amount | due_date | paid_date | payment_method | status | email_sent | email_sent_at | created_at`

---

## 8. Funcionalidades implementadas

### Detección automática de vencidos
La función `calculate_payment_status()` evalúa en cada request si la fecha de vencimiento ya pasó y el pago no fue marcado como pagado. El dashboard sincroniza todos los estados al cargar.

### Asistente IA (endpoint `/api/payments/{id}/send-reminder`)
1. Recibe el ID del pago y el tono deseado (amable / formal / urgente)
2. Construye un prompt con todos los datos del pago e inquilino
3. Llama a `claude-opus-4-6` con ese prompt
4. Recibe el mensaje generado
5. Llama a Resend para enviarlo al email del inquilino
6. Registra `email_sent = True` y `email_sent_at` en la base de datos

---

## 9. Integración de IA en el desarrollo

### Herramientas utilizadas
- **Claude (claude.ai):** Diseño de arquitectura, revisión de código, depuración, generación de prompts
- **Claude Code:** Generación de boilerplate de FastAPI, estructura de routers, componentes React

### ¿Cómo ayudó la IA?
- Aceleró la generación de código repetitivo (schemas, CRUD endpoints)
- Detectó problemas con el lazy loading de relaciones en SQLModel
- Sugirió la estrategia de sincronización de estados vencidos en el dashboard
- Ayudó a estructurar el prompt del asistente para generar mensajes coherentes según el estado del pago

### ¿Dónde falló o requirió corrección?
- El primer intento de configuración de Tailwind generó errores de compatibilidad con Vite que requirieron ajuste manual del `postcss.config.js`
- La carga de relaciones en SQLModel requirió acceso explícito (`_ = payment.tenant`) por el lazy loading por defecto

---

## 10. Agentes de IA

Se definieron agentes especializados como prompts reutilizables:

| Agente | Rol |
|--------|-----|
| Product Owner | Definir y acotar el MVP |
| Backend Reviewer | Revisar estructura de API y modelos |
| Frontend Reviewer | Revisar componentes y UX |
| QA Tester | Generar casos de prueba |
| Documentation Agent | Mejorar README e informe |

Ver detalles en `docs/ai-agents/`.

---

## 11. CI/CD con GitHub Actions

El workflow `.github/workflows/ci.yml` se ejecuta en cada push a `main`:
1. Valida el backend: instala dependencias Python e importa la app
2. Valida el frontend: instala dependencias Node y ejecuta `npm run build`

El deploy en Vercel y Render se activa automáticamente desde el repo.

---

## 12. Despliegue

| Servicio | URL |
|---------|-----|
| Frontend (Vercel) | https://alquicontrol.vercel.app |
| Backend (Render) | https://alquicontrol-api.onrender.com |
| API Docs | https://alquicontrol-api.onrender.com/docs |

---

## 13. Desafíos encontrados

1. **SQLModel lazy loading:** Las relaciones no se cargan automáticamente al serializar. Solución: acceder explícitamente a cada relación antes de retornar.
2. **Cold start de Render:** El backend gratuito se apaga tras 15 minutos de inactividad. La primera request puede tardar 30 segundos.
3. **CORS en producción:** Fue necesario configurar explícitamente los dominios permitidos en el middleware de FastAPI.

---

## 14. Lecciones aprendidas

- La IA acelera significativamente el boilerplate pero requiere revisión humana en los detalles de integración
- Separar lógica en servicios (`payment_service`, `assistant_service`) facilita el testing y el mantenimiento
- Definir el alcance del MVP antes de codificar evita el scope creep
- El deploy temprano (desde el día 1) permite detectar problemas de entorno antes del deadline

---

## 15. Mejoras futuras

- Autenticación JWT por propietario
- Notificaciones automáticas programadas (cron job)
- Integración con WhatsApp Business API oficial
- Generación de comprobantes en PDF
- Exportación de datos a Excel
- Panel multiusuario para administradoras

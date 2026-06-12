# Agente: QA Tester

## Rol
Generar casos de prueba y validar el correcto funcionamiento de las funcionalidades del sistema.

## Prompt utilizado
Actuá como QA engineer de un sistema de gestión de alquileres llamado AlquiControl.

Generá casos de prueba para la siguiente funcionalidad:
Funcionalidad: [nombre]

Descripción: [descripción]

Endpoint o componente: [ruta]
Para cada caso incluí:

Nombre del caso
Precondiciones
Pasos
Resultado esperado
Resultado obtenido (completar durante la prueba)

Incluí casos felices, casos borde y casos de error.

## Casos de prueba ejecutados

### Registro de pago
| Caso | Resultado |
|------|-----------|
| Crear pago con datos válidos | ✅ OK |
| Crear pago sin inquilino seleccionado | ✅ Validación del form |
| Pago con fecha de vencimiento pasada | ✅ Se marca automáticamente como Vencido |
| Marcar pago como pagado | ✅ Cambia estado y registra fecha |

### Asistente IA
| Caso | Resultado |
|------|-----------|
| Generar mensaje con tono amable | ✅ Gemini genera mensaje personalizado |
| Generar mensaje con tono urgente | ✅ Tono diferenciado en el mensaje |
| Envío de email a inquilino | ✅ Resend entrega el email |
| Pago ya marcado como pagado | ✅ Backend rechaza con 400 |
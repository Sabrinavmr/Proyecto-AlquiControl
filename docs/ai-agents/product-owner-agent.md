# Agente: Product Owner

## Rol
Definir el alcance del MVP, priorizar funcionalidades y evitar que el proyecto se vuelva demasiado grande.

## Prompt utilizado

```
Actuá como Product Owner de un proyecto académico llamado AlquiControl.
Es una app web para que pequeños propietarios gestionen alquileres.

Tu tarea:
1. Analizá el siguiente listado de funcionalidades y clasificalas en: MVP obligatorio / Mejora futura / Fuera del alcance.
2. Si detectás que el alcance es demasiado grande para 5 días de desarrollo, proponé qué recortar.
3. Priorizá según impacto para el usuario y valor académico demostrable.

Funcionalidades propuestas: [listado]
Stack: FastAPI + React + SQLite/PostgreSQL + Anthropic API + Resend
Tiempo disponible: 5 días
```

## Resultado obtenido
El agente identificó que el módulo de login, los contratos legales y la integración con WhatsApp Business API eran funcionalidades que debían quedar fuera del MVP inicial. Priorizó el email automático con IA como diferenciador central.

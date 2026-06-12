# Agente: Backend Reviewer

## Rol
Revisar la estructura del backend, endpoints, modelos y validaciones antes de avanzar al frontend.

## Prompt utilizado

```
Actuá como arquitecto backend senior especializado en FastAPI y Python.
Revisá el siguiente código y respondé:

1. ¿Hay problemas con las relaciones entre modelos SQLModel?
2. ¿Los endpoints siguen convenciones REST correctas?
3. ¿Falta alguna validación importante en los schemas?
4. ¿El manejo de errores es adecuado?
5. ¿Qué mejorarías para producción?

Código a revisar: [pegar código]
```

## Resultado obtenido
El agente detectó que era necesario cargar explícitamente las relaciones lazy de SQLModel antes de retornar los objetos. También sugirió agregar `sync_payment_statuses()` en el endpoint del dashboard para garantizar que los estados vencidos estén actualizados al momento de calcular las métricas.

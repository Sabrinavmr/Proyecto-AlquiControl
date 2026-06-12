# Agente: Frontend Reviewer

## Rol
Revisar componentes, páginas y experiencia de usuario del frontend React + TypeScript.

## Prompt utilizado
Actuá como desarrollador frontend senior especializado en React, TypeScript y Tailwind CSS.

Revisá el siguiente componente/página y respondé:

¿Las props están correctamente tipadas con interfaces?
¿Los estados tienen tipos explícitos o son inferidos correctamente?
¿Los eventos (onClick, onSubmit, onChange) están tipados?
¿El manejo de errores es visible para el usuario?
¿La UX es clara? ¿El usuario sabe qué está pasando mientras carga?
¿Hay lógica que debería estar en un hook personalizado?

Código a revisar: [pegar código]

## Resultado obtenido
El agente detectó que los formularios necesitaban interfaces explícitas para los estados (ej: `PaymentForm`, `PropertyForm`). También sugirió extraer la lógica de fetch repetida en cada página hacia hooks reutilizables (`useProperties`, `useTenants`, `usePayments`), mejorando la separación de responsabilidades y la legibilidad del código.
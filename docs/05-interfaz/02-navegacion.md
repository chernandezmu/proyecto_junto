[Documentación](../README.md) › [05 · Interfaz](README.md) › Navegación

# Navegación

## Barra inferior

Tres destinos permanentes, disponibles una vez el usuario está dentro:

| Destino | Función |
|---|---|
| **Inicio** | Interfaz principal: próximo plan y accesos de módulo |
| **Crear** | Publicar un evento o una ruta Wheels |
| **Mis planes** | Planes a los que el usuario está inscrito, con su racha |

El perfil y los ajustes se alcanzan desde el avatar en la cabecera, no desde la barra.

---

## Jerarquía

```
Inicio
├── Eventos
│   ├── Descubrir → feed → detalle → confirmación → chat → día del plan → calificación
│   └── Crear → publicado → solicitudes
├── Wheels
│   ├── Pasajero → buscar → perfil del conductor → reserva → viaje → pago → calificación
│   └── Conductor → vehículo → publicar ruta → solicitudes → viaje → cierre
├── Tours
│   ├── Con grupo → catálogo
│   └── Solo → emparejamiento → catálogo
│       └── detalle → coordinación → inscripción → chat → reseña
├── Crear (atajo directo al formulario)
├── Mis planes
└── Perfil
    ├── Ajustes
    └── Privacidad y seguridad
```

---

## Patrón de entrada a cada módulo

Los tres módulos abren con la misma estructura: **una pregunta que bifurca el flujo en dos roles o dos situaciones.**

| Módulo | Pregunta de entrada | Opciones |
|---|---|---|
| Eventos | ¿Te unes o lo armas tú? | Descubrir planes / Crear un plan |
| Wheels | ¿Cómo te mueves hoy? | Soy pasajero / Soy conductor |
| Tours | ¿Ya tienes con quién ir? | Sí, tengo grupo / Voy solo/a |

Este patrón repetido es deliberado: el usuario aprende una vez cómo funciona la entrada y la reconoce en los tres módulos.

---

## Retorno

Cada flujo termina devolviendo al usuario al punto donde puede volver a empezar:

| Flujo | Retorno |
|---|---|
| Eventos | «Enviar y ver más planes» → feed |
| Wheels | Calificación → interfaz principal |
| Tours | Reseña publicada → interfaz principal |

El retorno al feed en Eventos, y no a la interfaz principal, es intencional: es el módulo de frecuencia, y el objetivo es que el ciclo siga.

---

## Flecha de retroceso

Todas las pantallas interiores llevan una flecha de retroceso en la cabecera. Las pantallas de confirmación y los estados finales usan en cambio botones explícitos («Volver al inicio», «Ver otros planes»), porque retroceder desde ellas sería ambiguo.

---

**Anterior:** [01 · Inventario de pantallas](01-inventario-pantallas.md) · **Siguiente:** [03 · Estados límite](03-estados-limite.md)

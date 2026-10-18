[Documentación](../README.md) › [03 · Producto](README.md) › Módulo Eventos

# Módulo Eventos

El módulo del MVP. Resuelve la necesidad estrella: ocasiones concretas para socializar dentro del propio campus.

---

## Roles

| Rol | Qué hace | Requisito |
|---|---|---|
| **Asistente** | Descubre planes en el feed, se inscribe, asiste y califica | Verificación básica |
| **Organizador** | Publica un plan, define cupos y acceso, gestiona solicitudes | Verificación básica |

Cualquier estudiante verificado puede ser las dos cosas. No hay un rol de organizador aparte ni requisitos adicionales para publicar: esa es la decisión que separa a Junto de Meetup.

---

## Funciones del asistente

### Descubrir
Feed de swipe con los planes del propio campus. Cada tarjeta muestra:

- Icono y foto del plan
- Fecha y hora
- Título
- Lugar
- Cupos disponibles

**Izquierda:** pasa al siguiente plan.
**Derecha:** abre el detalle.

### Detalle del plan
Añade sobre la tarjeta:

- Organizador con verificación y calificación
- Sección «Quién va» con los asistentes confirmados
- Etiquetas del plan
- Opción de reportar el plan
- Guardar y compartir

### Confirmación de inscripción
Antes de ocupar el cupo, el usuario ve una pantalla de confirmación con:

- Cupos disponibles
- Hasta cuándo puede cancelar gratis
- Que se unirá al chat del plan
- Que el organizador verá su perfil
- Aviso: si no asiste sin cancelar a tiempo, baja su calificación en la comunidad

### Después de inscribirse
- Recordatorio una hora antes
- Chat del plan, con mensaje fijado del organizador
- El día del plan: mapa del punto de encuentro, código de asistencia de 4 dígitos, «Ya llegué» y «Avisar que voy tarde»
- Al terminar: calificación del plan y de los asistentes

---

## Funciones del organizador

### Crear un plan
Campos: tipo (evento o ruta), título, fecha y hora, lugar, cupos.

**Control de acceso:**
- *Todo mi campus* — cualquier estudiante verificado entra directo
- *Apruebo yo* — las inscripciones llegan como solicitudes

### Gestionar el plan publicado
- Contador de vistas y de unidos
- Bandeja de solicitudes con aceptar o rechazar
- Edición del plan

---

## Ciclo de vida de un plan

```
Borrador → Publicado → Lleno (opcional) → En curso → Terminado → Calificado
                ↓
           Cancelado
```

| Estado | Qué puede pasar |
|---|---|
| **Publicado** | Aparece en el feed; recibe inscripciones o solicitudes |
| **Lleno** | Sale del feed activo; se ofrece aviso de liberación de cupo |
| **En curso** | Se habilita el código de asistencia |
| **Terminado** | Se habilita la calificación mutua |

---

## Estados límite cubiertos

| Estado | Qué ofrece el producto |
|---|---|
| Plan lleno | «Avisarme si se libera» un cupo, y ver otros planes |
| Cancelación dentro del plazo | Cancelación libre, con motivo opcional |
| Cancelación fuera de plazo | Avisar en el chat del plan; afecta la calificación |
| Cancelación confirmada | Libera el cupo, avisa al organizador y saca del chat |

Ver [Estados límite](../05-interfaz/03-estados-limite.md).

---

## Referencias que sostienen este módulo

- **Bumble BFF:** el swipe es sobre planes, no sobre personas.
- **Strava:** «Quién va» hace visible la participación.
- **Timeleft:** el ritual semanal ancla el hábito por encima del catálogo.
- **Airbnb:** calificación mutua a doble ciego.

Ver [Referencias aplicadas](../02-investigacion/05-referencias-aplicadas.md).

---

**Anterior:** [01 · Arquitectura](01-arquitectura.md) · **Siguiente:** [03 · Módulo Wheels](03-modulo-wheels.md) · **Flujo:** [Flujo Eventos](../04-flujos/02-flujo-eventos.md)

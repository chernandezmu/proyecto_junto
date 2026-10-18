[Documentación](../README.md) › [05 · Interfaz](README.md) › Sistema visual

# Sistema visual

Lo que el prototipo establece como sistema. No es una guía de marca cerrada: es el registro de lo que ya está decidido y usado de forma consistente.

---

## Tema

El producto soporta **modo oscuro y modo claro**, conmutables desde Perfil → Ajustes → Apariencia.

El modo oscuro es el predeterminado del prototipo.

---

## Tipos de pantalla

El prototipo usa cinco tipos de pantalla recurrentes. Reconocerlos permite construir nuevas pantallas sin inventar patrones.

| Tipo | Cuándo se usa | Estructura |
|---|---|---|
| **Bifurcación** | Entrada a cada módulo | Pregunta + dos tarjetas con icono, título y descripción |
| **Formulario por pasos** | Registro, conductor, tours | Indicador «paso N de 3», campos, botón de avance |
| **Tarjeta de contenido** | Feed, detalle de plan o tour | Imagen o icono, metadatos, acciones |
| **Confirmación** | Antes de un compromiso | Resumen, consecuencias, dos acciones |
| **Estado final** | Después de una acción | Icono, titular, qué pasó, dos salidas |

---

## Componentes recurrentes

| Componente | Dónde aparece |
|---|---|
| Insignia de verificación | Perfil, organizador, conductor, operador de tour |
| Contador de cupos | Tarjeta del plan, detalle, inscripción |
| Avatares apilados con «+N» | «Quién va», grupos de Tours |
| Calificación con estrella | Organizador, conductor, perfil |
| Selector de cantidad −/+ | Cupos, personas, tarifa |
| Chips de selección | Intereses, días de la semana, filtros, motivos |
| Mensaje fijado | Chat del plan y chat del grupo |

---

## Iconografía

El prototipo usa iconos de Material Symbols, con un icono asignado por concepto:

| Concepto | Icono |
|---|---|
| Eventos | `celebration` |
| Wheels | `directions_car` |
| Tours | `landscape` |
| Pasajero | `hail` |
| Verificación | `verified`, `verified_user` |
| Seguridad | `sos`, `contact_emergency` |
| Tiempo | `schedule`, `timer`, `alarm` |
| Lugar | `location_on`, `pin_drop`, `trip_origin` |
| Racha | `local_fire_department` |

---

## Tono de la copia

El prototipo mantiene un registro consistente:

- **Segunda persona informal:** «¿Te unes o lo armas tú?», «¿Cómo te mueves hoy?»
- **Preguntas como títulos de bifurcación**, no sustantivos.
- **Consecuencias explícitas antes de actuar:** «Si no asistes sin cancelar a tiempo, baja tu calificación en la comunidad».
- **Confirmaciones que describen lo que pasó**, no felicitaciones vacías: «Liberaste tu cupo. Le avisamos al organizador y saliste del chat».

---

## Pendiente

No están definidos todavía: paleta con valores exactos, escala tipográfica, sistema de espaciado y tokens. El prototipo es consistente, pero el sistema no está formalizado.

Ver [Decisiones pendientes](../08-anexos/03-decisiones-pendientes.md).

---

**Anterior:** [03 · Estados límite](03-estados-limite.md) · **Siguiente apartado:** [06 · Negocio](../06-negocio/)

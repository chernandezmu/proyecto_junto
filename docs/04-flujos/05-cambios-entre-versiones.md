[Documentación](../README.md) › [04 · Flujos](README.md) › Cambios entre versiones

# Cambios entre la primera y la segunda versión

El board de FigJam conserva las dos versiones del flujo. La **segunda versión** es la vigente y la que está documentada en este apartado. Este archivo registra qué cambió y por qué, para que las decisiones no se vuelvan a discutir desde cero.

---

## 1 · Se eliminó la recomendación de moto o carro

**Primera versión:** cuando el pasajero no encontraba Wheels, el flujo pasaba por «Se recomienda el servicio de moto o carro», con ramas de aceptar y negar, y una decisión posterior de «¿Volver a encontrar?».

**Segunda versión:** el nodo es «Amplía el radio o pide otro servicio», que devuelve a la búsqueda.

**Por qué es mejor:** la primera versión comprometía a Junto con un inventario de transporte propio o con una integración de terceros que no está en el alcance. La segunda mantiene al usuario dentro del producto sin prometer un servicio que Junto no opera.

---

## 2 · La base de datos dejó de ser un nodo del flujo

**Primera versión:** incluía un nodo explícito de «Base de datos» por el que pasaban tanto el inicio de sesión como el registro antes de validar credenciales.

**Segunda versión:** la validación es una decisión del flujo («¿Credenciales válidas?»), sin representar la infraestructura.

**Por qué es mejor:** un diagrama de flujo de usuario describe lo que la persona hace, no dónde se guardan los datos. La capa técnica se documenta aparte.

---

## 3 · El registro se desglosó en tres pasos

**Primera versión:** «Registro» → «Crear perfil, llenar información básica».

**Segunda versión:** «Registro con correo institucional» → «Verificación de identidad estudiantil» → «Crear perfil e intereses».

**Por qué es mejor:** la verificación de identidad es la capa que sostiene todo el producto. Tenerla implícita dentro de «registro» la volvía invisible en el diagrama.

---

## 4 · Eventos ganó el ciclo completo de post-evento

**Primera versión:** terminaba en «Inscripción».

**Segunda versión:** continúa con chat y recordatorio, asistencia, calificación del plan y de los asistentes, y regreso al feed.

**Por qué es mejor:** el ciclo que genera frecuencia y reputación es justamente el que faltaba. Sin calificación no hay confianza acumulada; sin regreso al feed no hay recurrencia.

---

## 5 · Wheels y Tours cerraron su ciclo

**Primera versión:** Wheels terminaba en la búsqueda; Tours terminaba en «Inscripción (concordar fecha, personas)».

**Segunda versión:** ambos cierran con viaje, pago, calificación y regreso a la interfaz principal.

---

## Resumen

| # | Cambio | Efecto |
|---|---|---|
| 1 | Fuera la recomendación de moto o carro | No compromete inventario de transporte |
| 2 | Fuera el nodo de base de datos | El diagrama describe al usuario, no la infraestructura |
| 3 | Registro en tres pasos | La verificación queda visible |
| 4 | Post-evento completo en Eventos | Cierra el ciclo de frecuencia y reputación |
| 5 | Cierre de ciclo en Wheels y Tours | Los tres módulos terminan en calificación |

---

**Anterior:** [04 · Flujo Tours](04-flujo-tours.md) · **Siguiente apartado:** [05 · Interfaz](../05-interfaz/)

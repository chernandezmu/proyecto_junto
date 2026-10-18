[Documentación](../README.md) › [05 · Interfaz](README.md) › Estados límite

# Estados límite

Lo que pasa cuando algo se llena, falla o sale mal. En un producto de encuentros entre desconocidos, estos estados no son casos raros: son donde se gana o se pierde la confianza.

---

## Acceso

### Credenciales inválidas
**Mensaje:** «Credenciales inválidas. Usa un correo `.edu.co` y una contraseña de 4+ caracteres.»

**Por qué así:** el error no se limita a negar el acceso; dice qué se espera. Un estudiante que se equivocó de correo entiende de inmediato que el problema es el dominio.

---

## Eventos

### Plan lleno
**Pantalla:** «Este plan se llenó. [Título] ya no tiene cupos. Te avisamos si alguien cancela.»

**Acciones:** avisarme si se libera · ver otros planes.

**Por qué así:** convierte un rechazo en una suscripción. El usuario sale con algo, no con nada.

### Cancelación dentro del plazo
**Pantalla:** tiempo restante explícito, motivo opcional.

**Acciones:** sí, cancelar mi asistencia · mejor sigo inscrito.

**Por qué así:** cancelar a tiempo es el comportamiento que el producto quiere fomentar. No debe tener fricción ni castigo.

### Cancelación fuera del plazo
**Pantalla:** «Ya pasó el límite. La cancelación cerraba [hora]. Avísale al organizador si no puedes ir.»

**Acciones:** avisar en el chat del plan · volver.

**Por qué así:** el producto no bloquea al usuario ni lo deja sin salida: lo redirige al canal donde todavía puede reducir el daño.

### Cancelación confirmada
**Pantalla:** «Liberaste tu cupo en [plan]. Le avisamos al organizador y saliste del chat.»

**Por qué así:** confirma las tres consecuencias de la acción, para que no haya sorpresas después.

---

## Wheels

### Sin rutas compatibles
**Pantalla:** «Nadie pasa tan cerca. Amplía tu radio o te avisamos cuando aparezca una ruta.»

**Acciones:** ampliar a 2 km · avisarme.

**Por qué así:** es el estado más probable en el arranque del módulo, cuando la densidad todavía es baja. Debe estar diseñado, no improvisado. Ver [Riesgos](../07-riesgos/01-riesgos-y-mitigaciones.md).

### Sin pasajeros confirmados
**Mensaje:** «Sin pasajeros confirmados en este viaje.»

**Por qué así:** el conductor sabe a qué atenerse antes de salir.

### Pasajero que no ha pagado
**Pantalla de cobro:** monto debido y deslizador «Desliza si ya te pagó».

**Por qué así:** reconoce que el pago en efectivo puede ocurrir, y le da al conductor una forma de cerrar la transacción sin dejar el registro incompleto.

---

## Tours

### Confirmaciones pendientes del grupo
**Pantalla:** lista de integrantes con estado: confirmado o pendiente.

**Por qué así:** el bloqueo de un viaje en grupo casi siempre es una persona que no respondió. Hacerlo visible evita que el grupo se quede esperando sin saber a quién.

---

## Principio común

Los cuatro estados límite mejor resueltos del prototipo comparten la misma estructura:

1. **Dicen qué pasó**, en una frase.
2. **Dicen qué significa** para el usuario.
3. **Ofrecen dos salidas**, una de las cuales mantiene al usuario dentro del producto.

Ninguno deja al usuario en un callejón sin salida, y ninguno se limita a un mensaje de error.

---

**Anterior:** [02 · Navegación](02-navegacion.md) · **Siguiente:** [04 · Sistema visual](04-sistema-visual.md)

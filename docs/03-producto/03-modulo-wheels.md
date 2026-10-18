[Documentación](../README.md) › [03 · Producto](README.md) › Módulo Wheels

# Módulo Wheels

Carpooling entre estudiantes de una misma universidad, en la ruta habitual a clase. Fase 3 del roadmap.

---

## Roles

| Rol | Qué hace | Requisito |
|---|---|---|
| **Pasajero** | Busca cupo en la ruta de alguien | Verificación básica |
| **Conductor** | Lleva compañeros y comparte gastos | Verificación básica **+ vehículo verificado** |

Un pasajero no necesita crear nada para empezar. Un conductor pasa una sola vez por el registro de vehículo.

---

## Funciones del pasajero

### Definir la ruta
- Origen, con mapa
- Campus de destino
- Hora de llegada
- Días de la semana

### Buscar
Rutas cercanas dentro de un radio ajustable. Cada resultado muestra conductor, calificación, descripción de la ruta y precio por puesto.

### Perfil del conductor
- Nombre, carrera
- Licencia verificada
- Calificación y número de viajes
- Indicador de puntualidad
- Vehículo, placa y SOAT vigente
- Reseñas de otros pasajeros

### Reservar
Punto de recogida editable, horario y días, precio por puesto. El pago se hace en la app al terminar el viaje.

### Durante el viaje
Mapa en vivo, botón SOS, llamada y chat con el conductor.

### Pagar y calificar
Desglose: puesto + servicio ($600) = total. Métodos de pago seleccionables. Después, calificación del viaje con etiquetas de lo mejor.

---

## Funciones del conductor

### Paso 1 · Vehículo y documentos
Licencia, SOAT y tecnomecánica. Se hace una sola vez y queda en revisión.

### Paso 2 · Publicar la ruta
- Trazado de la ruta
- Hora de salida
- Cupos
- Días de la semana
- Tarifa por puesto, con rango sugerido de **$5.500 – $7.000**

### Paso 3 · Operar
- Bandeja de solicitudes: aceptar o rechazar
- Iniciar viaje
- Cobrar a cada pasajero durante el trayecto
- Finalizar viaje

### Cierre
Resumen de ganancias del día, con la nota de que el dinero se abona cuando los pasajeros pagan en la app. Calificación de los pasajeros.

---

## Estados límite cubiertos

| Estado | Qué ofrece el producto |
|---|---|
| Sin rutas compatibles en 500 m | Ampliar el radio a 2 km, o pedir aviso cuando aparezca una ruta |
| Sin pasajeros confirmados | Mensaje explícito en la pantalla del viaje |
| Pasajero que no ha pagado | Pantalla de cobro con deslizar para confirmar el pago recibido |

---

## Dependencia crítica

Wheels necesita **densidad**: sin suficientes estudiantes verificados en el campus no existen rutas compatibles y la búsqueda devuelve vacío.

Por eso no se activa hasta la fase 3, cuando Eventos ya generó la base. Ver [Riesgos](../07-riesgos/01-riesgos-y-mitigaciones.md).

---

## Competencia

Vai y Cupo ya operan con capital levantado. La ventaja de Junto no es el producto de transporte, sino el contexto: conductor y pasajero comparten campus, perfil verificado e historial de planes.

Ver [Diferenciador](../02-investigacion/07-diferenciador.md).

---

**Anterior:** [02 · Módulo Eventos](02-modulo-eventos.md) · **Siguiente:** [04 · Módulo Tours](04-modulo-tours.md) · **Flujo:** [Flujo Wheels](../04-flujos/03-flujo-wheels.md)

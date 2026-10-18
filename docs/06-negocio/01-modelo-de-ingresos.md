[Documentación](../README.md) › [06 · Negocio](README.md) › Modelo de ingresos

# Modelo de ingresos

## El principio

> El ingreso sale de la transacción, nunca de la oferta.

Meetup documenta el costo de cobrarle al lado que crea la oferta: reduce el número de grupos activos en mercados de bajo poder adquisitivo. En un mercado de estudiantes bogotanos ese efecto sería más fuerte. Por eso crear un plan es gratis en todas las fases.

---

## Por módulo

### Eventos — gratis en ambos lados

Crear y unirse no cuesta nada.

**Qué compra esta decisión:** adopción y frecuencia, que son el activo que sostiene a los otros dos módulos. Sin base de usuarios verificados, Wheels no tiene rutas compatibles y Tours no tiene grupos que llenar.

**Ingreso en el MVP:** $0. Es deliberado.

---

### Wheels — comisión por puesto

| Concepto | Valor |
|---|---|
| Tarifa por puesto | $5.500 – $7.000 (la define el conductor; el rango es sugerido) |
| Comisión de servicio | $600 por viaje, la paga el pasajero |
| Momento del cobro | Al terminar el viaje, dentro de la app |

**Por qué funciona:** es el único módulo con frecuencia diaria. Un pasajero que usa Wheels de lunes a viernes genera hasta diez trayectos por semana contando ida y vuelta.

**Riesgo:** el pago por fuera de la app elimina la comisión. Por eso el cierre del viaje y el pago están integrados en el mismo flujo, y el conductor tiene una pantalla de cobro explícita.

---

### Tours — margen sobre el operador

| Concepto | Valor |
|---|---|
| Abono en la inscripción | 30% del total |
| Margen | Acordado con operadores verificados |

**Por qué es el último:** ticket alto y frecuencia baja. Genera ingreso por volumen de grupo, no por usuario recurrente.

**Dependencia:** exige acuerdos comerciales con operadores y un proceso de verificación que todavía no está definido.

---

## Palanca futura: planes patrocinados del campus

Grupos estudiantiles, bienestar universitario y negocios de la zona pueden destacar un plan en el feed.

**Condición para que no rompa el producto:** los planes orgánicos siguen siendo mayoría. En el momento en que el feed se perciba como catálogo comercial, Junto se convierte en Fever a escala de campus y pierde su diferenciador.

---

## Lo que no se hará

### Suscripción del organizador

Cobrar por crear planes es la mecánica que más daño haría al arranque en frío: sin oferta no hay feed, y sin feed no hay razón para abrir la app.

Esta decisión no está sujeta a revisión mientras Eventos sea el módulo de adopción.

Ver [Casos límite · Meetup](../02-investigacion/06-casos-limite.md).

---

## Resumen

| Módulo | Quién paga | Cuánto | Cuándo |
|---|---|---|---|
| Eventos | Nadie | $0 | — |
| Wheels | Pasajero | Tarifa + $600 de servicio | Al terminar el viaje |
| Tours | Grupo | Abono 30% + margen del operador | En la inscripción |

---

**Siguiente:** [02 · MVP y fases](02-mvp-y-fases.md)

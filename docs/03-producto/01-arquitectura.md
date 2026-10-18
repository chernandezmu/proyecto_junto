[Documentación](../README.md) › [03 · Producto](README.md) › Arquitectura

# Arquitectura del producto

## Estructura general

```
┌─────────────────────────────────────────────────────┐
│                  INTERFAZ PRINCIPAL                  │
│         Próximo plan · tres accesos de módulo        │
└───────────┬─────────────┬─────────────┬─────────────┘
            │             │             │
      ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
      │  EVENTOS  │ │  WHEELS   │ │   TOURS   │
      │ asistente │ │ pasajero  │ │  solo /   │
      │organizador│ │ conductor │ │ con grupo │
      └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
            │             │             │
┌───────────▼─────────────▼─────────────▼─────────────┐
│          CAPA DE IDENTIDAD Y CONFIANZA               │
│  verificación · perfil · calificación · reputación   │
├──────────────────────────────────────────────────────┤
│          CAPA DE SEGURIDAD Y PRIVACIDAD              │
│    SOS · ubicación acotada · reporte · bloqueo       │
└──────────────────────────────────────────────────────┘
```

Los tres módulos son independientes entre sí en la navegación, pero comparten las dos capas inferiores. Ningún módulo puede usarse sin pasar por la verificación.

---

## Capa de identidad y confianza

Es el activo que ningún competidor de escala de ciudad puede copiar.

- Correo institucional `.edu.co` con código de 4 dígitos.
- Carné o certificado de matrícula vigente, con revisión en menos de 24 horas.
- Perfil con carrera, semestre e intereses.
- Calificación mutua y reputación acumulada.
- Documentos de vehículo para el rol de conductor.

Detalle: [Identidad y confianza](05-identidad-y-confianza.md).

---

## Capa de seguridad y privacidad

- Botón SOS activo durante los viajes.
- Ubicación compartida solo mientras un viaje o tour está activo.
- Mensajes limitados a los planes a los que perteneces.
- Contacto de emergencia, bloqueo, reporte y normas de la comunidad.
- Verificación en dos pasos, descarga de datos y eliminación de cuenta.

Detalle: [Seguridad y privacidad](07-seguridad-y-privacidad.md).

---

## Los tres módulos en comparación

| | Eventos | Wheels | Tours |
|---|---|---|---|
| **Roles** | Asistente / organizador | Pasajero / conductor | Solo / con grupo |
| **Frecuencia esperada** | Semanal | Diaria (lunes a viernes) | Mensual o menos |
| **Requisito de entrada** | Verificación básica | Verificación + documentos del vehículo (conductor) | Verificación básica |
| **Depende de densidad** | Media | **Alta** | Baja |
| **Transacción** | Ninguna | Tarifa por puesto + comisión | Abono del 30% |
| **Fase** | 1 | 3 | 4 |

---

## Principio de dependencia entre módulos

Wheels y Tours no son módulos paralelos que se puedan lanzar en cualquier orden: **dependen de la base de usuarios verificados que genera Eventos.**

- Wheels sin densidad produce búsquedas sin resultado.
- Tours sin comunidad produce grupos que no se llenan.

Por eso el orden de fases es fijo. Ver [MVP y fases](../06-negocio/02-mvp-y-fases.md).

---

**Siguiente:** [02 · Módulo Eventos](02-modulo-eventos.md)

[Documentación](../README.md) › [07 · Riesgos](README.md) › Riesgos y mitigaciones

# Riesgos y mitigaciones

## Riesgos heredados del mercado

Mecánicas con costo ya documentado en otros productos. La mitigación es una decisión de diseño tomada desde el principio.

| Riesgo | Evidencia | Mitigación en Junto |
|---|---|---|
| **Acoso en un espacio cerrado** | Yik Yak cerró en 2017 tras casos sostenidos de acoso | Cero anonimato, identidad verificada, reporte en cada plan, bloqueo y normas |
| **Frenar la oferta al cobrarla** | Meetup reduce grupos activos en mercados de bajo poder adquisitivo | Crear un plan es gratis en todas las fases |
| **Depender de inventario comercial** | Fever exige un equipo de oferta y excluye lo informal | La oferta la pone el propio estudiante |
| **Presión diaria inadecuada** | La racha de Duolingo no traslada a actividades presenciales | La racha es semanal |
| **Ticket alto como puerta de entrada** | WeRoad: baja frecuencia, no genera uso recurrente | Tours es fase 4 |
| **Lectura de app de citas** | Tinder: el swipe sobre personas quedó asociado a lo romántico | Se desliza sobre planes |

Detalle: [Casos límite](../02-investigacion/06-casos-limite.md).

---

## Riesgos propios

### R1 · El feed se vacía entre semanas

**Probabilidad:** alta en el arranque.
**Impacto:** crítico. Un usuario que abre la app y no ve nada no vuelve.

**Por qué pasa:** un catálogo abierto depende de que alguien publique. En las primeras semanas no hay masa de organizadores.

**Mitigación:** ritual semanal fijo garantizado por el equipo y los grupos estudiantiles, además del feed abierto. Referencia: Timeleft.

**Señal de alarma:** caída de planes activos por día. Ver [Métricas](../06-negocio/03-metricas.md).

---

### R2 · Wheels se activa antes de tiempo

**Probabilidad:** media, depende de la disciplina del equipo.
**Impacto:** alto. Una búsqueda sin resultados quema el módulo en el primer intento.

**Por qué pasa:** el carpooling necesita densidad para que existan rutas compatibles, y la tentación de lanzar el módulo que genera ingreso es fuerte.

**Mitigación:** umbral de densidad de campus como condición de activación, no como recomendación. Hasta entonces, la pantalla de «nadie pasa tan cerca» está diseñada, pero no debería ser la experiencia normal.

---

### R3 · Competencia establecida en carpooling

**Probabilidad:** alta, ya es un hecho.
**Impacto:** medio en el MVP, alto en la fase 3.

**Por qué pasa:** Vai levantó US$530k pre-seed y Cupo opera en varias ciudades.

**Mitigación:** no competir en el terreno de ellos. Wheels entra cuando Junto ya tiene una base de estudiantes verificados que se conocen de los planes, que es la ventaja que ni Vai ni Cupo pueden construir desde el transporte.

---

### R4 · No-show del lado del organizador

**Probabilidad:** media.
**Impacto:** alto. Es el daño que silencia la oferta.

**Por qué pasa:** inscribirse es gratis y sin consecuencia inmediata.

**Mitigación:** aviso explícito antes de confirmar el cupo, efecto en la calificación, cancelación fácil dentro del plazo y código de asistencia que distingue inscripción de asistencia real.

---

### R5 · El producto se lee como app de citas

**Probabilidad:** media.
**Impacto:** alto. Cambia el público y expulsa al segmento objetivo.

**Por qué pasa:** el swipe arrastra asociación con Tinder, y el brief mismo describe la mecánica como «swipe tipo Tinder».

**Mitigación en producto:** la tarjeta siempre es un plan.
**Mitigación en comunicación:** el lenguaje de lanzamiento no debe usar la comparación con Tinder de cara al usuario, aunque sirva internamente para explicar la mecánica.

---

### R6 · Cumplimiento de datos personales

**Probabilidad:** alta si no se atiende.
**Impacto:** alto. El producto recoge documentos de identidad estudiantil, ubicación y documentos de vehículo.

**Mitigación pendiente:** política de tratamiento de datos conforme a la Ley 1581 de 2012, autorización explícita en el registro y canal de ejercicio de derechos.

Ver [Decisiones pendientes](../08-anexos/03-decisiones-pendientes.md).

---

## Matriz

| # | Riesgo | Probabilidad | Impacto | Estado de la mitigación |
|---|---|---|---|---|
| R1 | Feed vacío | Alta | Crítico | Diseñada, no probada |
| R2 | Wheels prematuro | Media | Alto | Depende de disciplina del equipo |
| R3 | Competencia en carpooling | Alta | Medio / Alto | Estrategia definida |
| R4 | No-show | Media | Alto | Implementada en el prototipo |
| R5 | Lectura de app de citas | Media | Alto | Producto sí, comunicación pendiente |
| R6 | Datos personales | Alta | Alto | **Pendiente** |

---

**Siguiente apartado:** [08 · Anexos](../08-anexos/)

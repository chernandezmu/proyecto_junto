[Documentación](../README.md) › [06 · Negocio](README.md) › Métricas

# Métricas de validación

El objetivo de negocio es uso recurrente y semanal. Estas son las métricas que lo comprueban, en orden de importancia.

> **Nota de origen:** ninguna pieza del proyecto definía métricas. Esta propuesta se deriva del objetivo de negocio del brief y de las mecánicas del prototipo. Los umbrales los define el equipo antes de lanzar.

---

## 1 · Asistencias por semana

**Qué mide:** estudiantes que asisten a al menos un plan por semana, confirmado con el código de asistencia de 4 dígitos.

**Por qué es la primera:** es la definición operativa literal del objetivo de negocio. Todas las demás métricas existen para explicar el movimiento de esta.

---

## 2 · Retención en la semana 4

**Qué mide:** porcentaje del registro inicial que sigue asistiendo cuatro semanas después.

**Por qué importa:** separa la curiosidad del hábito. Un pico de registros en la semana de lanzamiento no dice nada.

**Criterio de avance:** es la métrica que habilita la fase 2.

---

## 3 · Densidad de campus

**Qué mide:** estudiantes verificados sobre el total de matriculados en la universidad.

**Por qué importa:** Facebook no abrió un segundo campus hasta saturar el primero. Es también la condición técnica de Wheels: sin densidad no hay rutas compatibles.

**Criterio de avance:** habilita la fase 3.

---

## 4 · Planes activos por día

**Qué mide:** planes publicados con al menos un inscrito.

**Por qué importa:** sin oferta el feed está vacío y el swipe no tiene sentido. Es la métrica de salud del lado de la oferta, que no se cobra y por tanto no se mide por ingresos.

**Señal de alarma:** si cae por debajo del mínimo que sostiene el feed, se activa el ritual semanal garantizado por el equipo. Ver [Riesgos](../07-riesgos/01-riesgos-y-mitigaciones.md).

---

## 5 · Conversión de swipe a inscripción

**Qué mide:** swipes a la derecha que terminan en cupo confirmado.

**Por qué importa:** aísla el problema. Si el usuario desliza a la derecha pero no se inscribe, el problema está en el detalle del plan o en la pantalla de confirmación, no en el feed.

---

## 6 · Tasa de no-show

**Qué mide:** inscritos que no asisten ni cancelan a tiempo.

**Por qué importa:** es el daño que rompe la confianza del organizador. Un organizador que arma tres planes y tiene la mitad de sillas vacías deja de publicar, y sin oferta no hay producto.

**Mecanismo de control:** aviso explícito antes de confirmar el cupo y efecto en la calificación. Ver [Reglas de producto](../03-producto/06-reglas-de-producto.md).

---

## 7 · Primer plan en menos de 7 días

**Qué mide:** nuevos usuarios que asisten a su primer plan dentro de su primera semana.

**Por qué importa:** traduce el objetivo de experiencia —unirse a un plan en minutos— a un hecho verificable. Un usuario que pasa su primera semana sin asistir a nada difícilmente vuelve.

---

## Tabla resumen

| # | Métrica | Qué valida | Fase donde importa |
|---|---|---|---|
| 1 | Asistencias por semana | Objetivo de negocio | 1 en adelante |
| 2 | Retención semana 4 | Hábito | 1 → 2 |
| 3 | Densidad de campus | Saturación | 2 → 3 |
| 4 | Planes activos por día | Salud de la oferta | 1 en adelante |
| 5 | Conversión swipe → inscripción | Calidad del detalle | 1 |
| 6 | Tasa de no-show | Confianza del organizador | 1 en adelante |
| 7 | Primer plan < 7 días | Objetivo de experiencia | 1 |

---

## Qué no se mide en el MVP

- Descargas. Una descarga sin asistencia no valida nada.
- Usuarios activos diarios. La unidad de este producto es la semana.
- Ingresos. En la fase 1 son $0 por diseño.

---

**Anterior:** [02 · MVP y fases](02-mvp-y-fases.md) · **Siguiente apartado:** [07 · Riesgos](../07-riesgos/)

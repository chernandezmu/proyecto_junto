# Proyecto Junto

App que conecta estudiantes universitarios de Bogotá alrededor de planes del campus, carpooling y viajes en grupo, entre estudiantes verificados de la misma universidad.

**Equipo:** Carlos Hernández · Juan Miguel Fossi · Juan Sebastián Rangel
**MVP:** módulo de Eventos, en una sola universidad.

---

## Documentación

Toda la documentación está en [`docs/`](docs/), organizada por apartados.

| # | Apartado | Qué contiene |
|---|---|---|
| 01 | [Contexto](docs/01-contexto/) | Qué es Junto, objetivos, problema, público y evidencia |
| 02 | [Investigación](docs/02-investigacion/) | Mapa de mercado, competencia, referencias y casos límite |
| 03 | [Producto](docs/03-producto/) | Arquitectura, los tres módulos, identidad y reglas |
| 04 | [Flujos](docs/04-flujos/) | Los cuatro recorridos, con diagramas Mermaid |
| 05 | [Interfaz](docs/05-interfaz/) | Inventario de pantallas, navegación y estados límite |
| 06 | [Negocio](docs/06-negocio/) | Modelo de ingresos, MVP por fases y métricas |
| 07 | [Riesgos](docs/07-riesgos/) | Riesgos del mercado y riesgos propios |
| 08 | [Anexos](docs/08-anexos/) | Fuentes, glosario y decisiones pendientes |

**Empieza por:** [índice de la documentación](docs/README.md).

---

## La app

App móvil (Expo + React Native + TypeScript) con backend en Supabase. **Entrega: demo en celulares el 16 de noviembre de 2026.**
- Estado por etapas: [`ROADMAP.md`](ROADMAP.md).
- Seguridad: [`SECURITY.md`](SECURITY.md).
- Guion de la presentación: [`DEMO.md`](DEMO.md).

| Carpeta | Qué es | Cómo empezar |
|---|---|---|
| [`mobile/`](mobile/) | La app (36 pantallas del MVP de Eventos) | [`mobile/README.md`](mobile/README.md): correr en Expo Go y generar el APK |
| [`supabase/`](supabase/) | Base de datos, seguridad (RLS + RPC), pruebas y datos de demo | [`supabase/README.md`](supabase/README.md): crear el proyecto, aplicar las migraciones, aprobar carnés |
| [`design/`](design/) | Sistema de diseño y pantallas | [`DESIGN.md`](DESIGN.md) · [`design/preview.html`](design/preview.html) |
| [`docs/`](docs/) | Documentación de producto | [Índice](docs/README.md) |

Puesta en marcha, en resumen:
1. Supabase: crear el proyecto y ejecutar las migraciones (`supabase/README.md`).
2. Crear `mobile/.env`.
3. `cd mobile && npm install && npx expo start`.
4. Escanear el QR con Expo Go.

---

## Los tres módulos

- **Eventos** — descubrir y crear planes del campus con swipe. Es el MVP.
- **Wheels** — carpooling entre estudiantes de la misma universidad, en la ruta habitual a clase.
- **Tours** — viajes en grupo, con emparejamiento para quien no tiene con quién ir.

Los tres se apoyan en una capa común de identidad estudiantil verificada.

---

## Enlaces del proyecto

- [Diagrama de flujo (FigJam)](https://www.figma.com/board/xIzglMlvBBqPUCMYuZ64w3)
- [Prototipo navegable](https://claude.ai/artifact/6QYgNHT3xDMk7zeR5sUyZ8)

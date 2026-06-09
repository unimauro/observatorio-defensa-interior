# Observatorio del Sector Defensa e Interior del Perú 🛡️

Tablero de **inteligencia financiera** del aparato de seguridad del Estado peruano:
las empresas industriales del **Sector Defensa** bajo FONAFE — **SIMA** (naval),
**FAME** (armas y municiones) y **SEMAN** (mantenimiento aeronáutico) — y el
**presupuesto del Sector Interior** (MININTER / PNP).

> **Encuadre honesto (anti-overclaiming).** Este tablero es el **motor**: cargado
> con los estados financieros reales del cliente entrega KPIs, ejecución
> presupuestal, rankings, detección de anomalías, transparencia y analítica de
> contrataciones (OCDS). Las **series financieras de la demo son ILUSTRATIVAS** y
> están marcadas como tales; las cifras presupuestales del sector están
> **verificadas con fuente** (ver `docs/investigacion/` y la página _Defensa e Interior_).

## Hallazgo que estructura el tablero

| | **Defensa** | **Interior** |
|---|---|---|
| Naturaleza | Brazo **industrial/empresarial** (FONAFE) | **Administrativo-regulatorio** |
| Entidades | 3 empresas: SIMA, FAME, SEMAN | Ministerio + PNP + SUCAMEC + MIGRACIONES + SALUDPOL |
| Empresas FONAFE | **3** | **0** |
| Materialidad | Finanzas corporativas, EBITDA, inversión | **Presupuesto y compras** |
| Presupuesto 2025 (PIA) | ≈ S/ 8,893 MM | ≈ S/ 12,215 MM |

→ El ángulo de Defensa son **empresas/finanzas**; el de Interior, **presupuesto/contrataciones**.

## Stack

- **Frontend** React + Vite + TypeScript + Tailwind + ECharts (dashboard estático).
- **Datos** en `frontend/public/data/latest/dataset.json` (esquema versionado).
- **Asistente IA** (`AskBot`): chat en el navegador que inyecta el dataset como
  contexto y consulta **Gemini Flash** (capa gratuita). La API key se guarda solo
  en el navegador del usuario; nunca se versiona.
- **Deploy**: GitHub Pages (`.github/workflows/deploy.yml`).

## Desarrollo

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Fuentes

FONAFE, MEF (Consulta Amigable / Ley de Presupuesto), Congreso, OECE/OCDS y prensa
(Gestión, El Peruano, Andina, Infodefensa). Detalle y URLs en `docs/investigacion/`.

---
_Cifras presupuestales verificadas; series financieras de empresas ilustrativas hasta cargar EE.FF. oficiales. Construido para una demostración de capacidad, sin overclaiming._
</content>

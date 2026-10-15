# Skills Go

Prototipo de **PWA de práctica de inglés tipo Duolingo** para **Skills English Institute** (Córdoba, Argentina), pensado para mejorar la retención de alumnos de 12 a 18 años durante las vacaciones. Datos mock, sin backend.

- Qué es y qué incluye: [`PLANIFICACION.md`](./PLANIFICACION.md)
- Identidad visual, tono y componentes: [`MANUAL_DE_MARCA.md`](./MANUAL_DE_MARCA.md)
- Contratos entre módulos: [`docs/CONTRATOS.md`](./docs/CONTRATOS.md)

## Correr

```bash
npm install
npm run dev        # desarrollo
npm test           # tests de dominio, contenido, liga, misiones, dashboard (106)
npm run build      # build de producción (PWA con service worker)
npm run preview    # servir el build
npm run e2e        # flujos completos con Playwright en viewport de celular (390×844)
```

## Cómo mostrarlo (guion de 5 minutos)

1. Abrir en el celular → "Agregar a inicio" → splash.
2. **Empezar** (o "Entrar con perfil demo") → primera lección: acertar, equivocarse (pierde un corazón), terminar con festejo y racha.
3. Mapa, misiones, liga, logros, tienda.
4. **Panel de demo**: 3 toques seguidos sobre el escudo (arriba a la izquierda del mapa) o `Ctrl/Cmd + Shift + D`. Permite pasar días, quedarse sin corazones, disparar notificaciones, cerrar la semana de la liga, cargar un "alumno con 12 días de racha", etc.
5. **Desafío de Vacaciones** y **Mis premios** (canje en la academia).
6. **Dashboard de la academia**: `/admin` (login simulado) → retención, alumnos en riesgo, "Enviar mensaje".

## Deploy (GitHub Pages)

El workflow `.github/workflows/deploy.yml` publica en cada push a `main` (o a mano desde la pestaña Actions).
Requiere habilitar **Settings → Pages → Source: GitHub Actions**. Para otro hosting estático alcanza con `npm run build` y servir `dist/` con fallback a `index.html`; si no está en la raíz, definir `BASE_PATH=/subcarpeta/`.

## Stack

React 18 · Vite · TypeScript · Tailwind · Zustand · React Router · Framer Motion · Recharts · vite-plugin-pwa · Vitest · Playwright.

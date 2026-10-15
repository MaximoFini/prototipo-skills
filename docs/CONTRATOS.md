# Contratos para la implementación en paralelo (Skills Go)

Leer primero: `PLANIFICACION.md` (qué se construye) y `MANUAL_DE_MARCA.md` (cómo se ve y suena).
Stack: React 18 + Vite + TS + Tailwind + Zustand + React Router 6 + Framer Motion. Alias `@/` = `src/`.

## Reglas de convivencia (IMPORTANTE)
- Cada subagente **solo edita archivos de su propiedad** (tabla al final). Los STUBS de Fase 0 que te tocan se reemplazan por completo, manteniendo el `export` (default o nombrado) y las props del contrato.
- **No ejecutes `npm install`** ni toques `package.json`, `vite.config.ts`, `tailwind.config.js`, `src/domain/*`, `src/store/*`, `src/design/*`, `src/app/*`. Si necesitás algo ahí, resolvelo dentro de tu carpeta o dejalo anotado en tu informe final.
- **No hagas commits ni push.** Lo hace el orquestador.
- Otros agentes están escribiendo a la vez: si `npx tsc -b` muestra errores en archivos que no son tuyos, ignoralos. Verificá tu parte con `npx tsc -b 2>&1 | grep -E "src/(features/<tuCarpeta>|data/<tuArchivo>)"`.
- No uses `npm run build` (pisa `dist` en paralelo). Para probar visualmente podés correr `npx vite --port <puerto único>` en background y usar Playwright con Chromium (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, `executablePath: '/opt/pw-browsers/chromium'`, viewport 390×844). Cerrá el server al terminar.
- Español rioplatense (voseo) con tono Duolingo: juguetón, corto, alentador. Sin tuteo ("Seguí", "Practicá", "Tenés").
- Usá SIEMPRE tokens/clases del tema (`bg-go-primary`, `text-go-muted`, `rounded-go`, `font-display`, `.btn-3d`, `.card-go`) y componentes de `@/design`. No hardcodees colores fuera de los de marca.
- Hora: usá `now()`, `today()` de `@/domain/clock` (NO `Date.now()`), así funciona "pasar días" del demo.
- Accesibilidad: contraste AA, `aria-label` en botones de solo ícono, estado correcto/incorrecto con ícono + texto (no solo color), áreas táctiles ≥ 44px, respetar `prefers-reduced-motion`.
- Mobile-first 360–430 px. Cada pantalla de alumno llena el alto (`h-full flex flex-col`) y scrollea adentro (`.scroll-y flex-1`). El `PhoneFrame` ya limita el ancho.

## Estado global — `useApp` (`@/store/useApp`)
`const x = useApp(s => s.xp)`; acciones: `useApp.getState().addGems(5)`.
- Datos: ver `UserState` en `@/domain/types`.
- Acciones: `completeOnboarding`, `setSettings`, `setProfile`, `refresh`, `loseHeart`, `addHearts(n)`, `refillHearts()` (350 gemas, devuelve boolean), `addGems`, `spendGems(n)`, `addXp(n, source)`, `recordMistakes(lessonId, exs)`, `clearMistake(key)`, `buyFreeze()`, `buyDoubleXp()`, `finishLesson(lessonId, result)` → `LessonSummary`, `finishPractice(result, {healHeart})`, `pushNotification({kind,title,body})`, `dismissNotification(id)`, `patch(partial | fn)` (para quests/league/vacation/achievements), `advanceDays(n)`, `reset()`.
- `selectXpToday` para el XP del día. Persistencia automática en localStorage (`skills-go-v1`).

## Reglas de dominio — `@/domain/rules`
Constantes (`HEARTS_MAX`, `REFILL_COST`, `FREEZE_COST`, `PRACTICE_EXERCISES`, `GOAL_LABELS`…) y funciones puras (`regenHearts`, `loseHeart`, `msToNextHeart`, `formatCountdown`, `resolveStreak`, `applyActivity`, `streakAtRisk`, `lessonXp`, `lessonGems`).
Validación — `@/domain/validate`: `checkTyped(input, accepted)` → `{verdict:'correct'|'almost'|'wrong', best}`, `checkBuilt(words, accepted)`, `correctAnswerText(ex)`, `normalize`.
Fechas — `@/domain/clock`: `now`, `today`, `dayKey`, `addDays`, `diffDays`, `weekStart`, `DAY`, `HOUR`.

## Eventos — `@/domain/events`
`on('lesson-finished' | 'xp-gained' | 'heart-lost' | 'day-changed' | 'streak-changed', handler)` devuelve unsubscribe; `emit(...)`. `finishLesson` ya emite `xp-gained`, `streak-changed` y `lesson-finished`. El store emite `day-changed` desde `refresh()` cuando `quests.day !== today()`.

## Contenido — `@/data/content`
`levels`, `allUnits`, `allLessons` (orden lineal), `getLesson(id)`, `getUnitOfLesson(id)`, `currentLessonId(completed)`, `isLessonUnlocked(id, completed)`, `placementTest`, `placementLevelFor(correctIds)`.
Archivos de datos: `src/data/levels/{a1,a2,b1,placement}.ts` exportan `a1Units`, `a2Units`, `b1Units` (`Unit[]`) y `placementTest` (`Exercise[]`, ids `p1..p8`).
La lección de ejemplo de `a1.ts` usa los 9 tipos (útil para probar el motor).

## Diseño — `@/design` (barrel)
`Button` (variants primary|secondary|danger|xp|ghost, `block`), `ProgressBar`, `Ribbon` (cabecera de unidad), `ShieldNode` (nodo del mapa: state active|done|locked), `Avatar`/`AVATAR_IDS`, `Modal` (bottom sheet), `HeartChip`/`StreakChip`/`GemChip`/`XpChip`, `ScreenHeader`, `BottomNav` (ya montada por el router), `DemoTrigger` (envolver el logo: 3 toques abren el panel de demo), `Skilly` (mood: happy|cheer|sad|sleepy|think|wink), `ShieldMark`, `Lockup`, íconos `HeartIcon`, `FlameIcon`, `BoltIcon`, `GemIcon`, `ChestIcon`, `TrophyIcon`, `CheckIcon`, `CrossIcon`, `LockIcon`, `StarIcon`. Íconos de UI generales: `lucide-react`.
Utilidades: `@/lib/sfx` (`sfx.correct/wrong/tap/finish/streak/heartLost/gem/notify`), `@/lib/tts` (`speak(text,{slow})`, `ttsAvailable()`), `@/lib/confetti` (`burst()`, `celebrate()`).

## Rutas (ya definidas en `src/app/App.tsx`)
`/welcome` onboarding · `/` mapa · `/league` · `/quests` · `/profile` (con barra inferior) · `/placement` · `/lesson/:lessonId` · `/practice` · `/practice/session?heal=1` · `/practice/vocabulary` · `/shop` · `/vacation` · `/profile/achievements|stats|friends|rewards` · `/settings` · `/settings/reminders` · `/admin/*`.
Después del onboarding: si eligió "test de nivel" → `/placement`; luego `/`.

## Componentes con contrato (stubs en el repo; el dueño implementa, los demás importan)
- `features/lesson/LessonRunner` (A): `LessonRunnerProps` (ver archivo). Usado por LessonPage (A), Placement (B), PracticeSession (C).
- `features/lesson/OutOfHeartsModal` (A): `{open,onClose,onPractice}`. Lo usa PathPage (B) al tocar un nodo con 0 corazones.
- `features/gamification/StreakExtendedScreen` (C1): `{streak,onContinue}`. La usa LessonPage (A) tras el resumen si `summary.streakExtended`.
- `features/gamification/DailyGoalCelebration` (C1): `{goal,onContinue}`. La usa LessonPage (A) si `summary.goalReached`.
- `features/vacation/VacationBanner` (C2): sin props. La usa PathPage (B).
- `features/notifications/NotificationHost` (C1) y `features/demo/DemoPanel` (C2): montados en App.
- `features/gamification/register.ts` (C1): `registerGamification()` se llama en `main.tsx` y llama a `registerLeague()` (`features/league/register.ts`, C2) y `registerVacation()` (`features/vacation/register.ts`, C2).
- Orden del flujo al terminar una lección (LessonPage, A): resumen → (si `goalReached`) DailyGoalCelebration → (si `streakExtended`) StreakExtendedScreen → volver a `/`. Si el alumno se queda sin corazones: `OutOfHeartsModal`.
- Dueños del estado: **C1** → `quests`, `achievements`; **C2** → `league`, `vacation`. Se inicializan en sus `register*()` y se actualizan escuchando eventos con `useApp.getState().patch(...)`. B y A solo leen.
- `features/league/register.ts` también exporta `closeLeagueWeek()` (lo usa el panel de demo, C2).

## Propiedad de archivos
| Agente | Carpetas / archivos |
|---|---|
| A — Motor de lección | `src/features/lesson/**` (LessonPage, LessonRunner, OutOfHeartsModal, componentes de cada ejercicio, LessonResultScreen), `src/features/results/**` |
| B — Mapa/onboarding/perfil | `src/features/onboarding/**`, `placement/**`, `path/**`, `profile/**`, `friends/**` y `src/data/friends.ts` |
| C1 — Misiones/logros/tienda/notificaciones | `src/features/gamification/**` (QuestsPage, AchievementsPage, ShopPage, StreakExtendedScreen, DailyGoalCelebration, register.ts), `src/features/notifications/**`, `src/data/achievements.ts` |
| C2 — Liga/vacaciones/práctica/demo | `src/features/league/**`, `vacation/**`, `practice/**`, `demo/**`, `src/data/{bots,rewards}.ts` |
| D1 — Contenido A1 | `src/data/levels/a1.ts`, `src/data/levels/placement.ts` |
| D2 — Contenido A2/B1 | `src/data/levels/a2.ts`, `src/data/levels/b1.ts` |
| E — Dashboard academia | `src/features/admin/**`, `src/data/admin/**` |

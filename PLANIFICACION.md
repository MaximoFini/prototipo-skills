# Planificación — **Skills Go** (PWA tipo Duolingo para Skills English Institute, Córdoba)

> Documento vivo y **fuente única de verdad** para implementar el prototipo (lo van a leer los subagentes).
> Estado: **v1.1 — prototipo IMPLEMENTADO** (ver `README.md` para correrlo). Fase 0, Fase 1 (7 subagentes) y Fase 2 (integración + QA) completas. Quedan pendientes los puntos de la sección 11.
> Documento hermano: [`MANUAL_DE_MARCA.md`](./MANUAL_DE_MARCA.md) (colores, tipografía, tono, componentes).

---

## 1. Contexto y objetivo

- **Cliente:** Skills English Institute (Av. Elías Yofre 1079, Barrio Jardín, Córdoba). +25 años. Firma: *Building Skills*.
- **Producto:** **Skills Go**, PWA de práctica de inglés gamificada, **calco funcional de Duolingo** con la marca de Skills.
- **Público:** adolescentes de **12 a 18 años** (alumnos de la academia).
- **Para qué:** se lanza en las **vacaciones** para **mejorar la retención**: que el alumno no desconecte del inglés ni abandone entre ciclos.
- **Qué es este entregable:** un **prototipo navegable** para acompañar el presupuesto. Datos mock, sin backend. Tiene que "sentirse real".
- **Prioridad:** velocidad de entrega. Se implementa **todo de una vez con Claude + subagentes** (sección 10).

### Qué tiene que lograr el prototipo
1. Que el cliente lo **toque en el celular** y diga "quiero esto".
2. Que muestre **cómo ataca la retención** (racha, corazones, liga, misiones, desafío de vacaciones, recordatorios, dashboard).
3. Que sirva de base creíble para el presupuesto (lo que se ve = alcance; lo que no se ve = fase 2).

---

## 2. Decisiones tomadas (registro)

| Fecha | Decisión |
|---|---|
| 2026-10-15 | Público 12–18 años |
| 2026-10-15 | Niveles estándar CEFR (A1, A2, B1); Skills no tiene los suyos definidos |
| 2026-10-15 | Nombre: **Skills Go** · Plataforma: **PWA** |
| 2026-10-15 | Dashboard de academia **incluido** en el prototipo |
| 2026-10-15 | Vidas/corazones **incluidos**, funcionamiento **calco de Duolingo** |
| 2026-10-15 | Marca tomada de la web de Skills (capturas + logo); Instagram descartado |
| 2026-10-15 | Colores extra aprobados: naranja (racha) y amarillo (XP) |
| 2026-10-15 | **Mascota:** el escudo con expresiones (nombre propuesto: **"Skilly"**) |
| 2026-10-15 | Tono **estilo Duolingo** (juguetón, con picardía), rioplatense neutro, sin cordobesismos |
| 2026-10-15 | Sin desglose de presupuesto en este repo; lo hace el usuario |
| 2026-10-15 | Implementación en una sola pasada con subagentes en paralelo |

---

## 3. Alcance funcional (CERRADO)

### 3.1 Experiencia del alumno

**A. Entrada**
- Splash (escudo + "Skills Go" + *Building Skills*).
- Onboarding estilo Duolingo: mascota habla → "¿Cómo te llamás?" → "¿Cuál es tu nivel?" (**Empezar desde cero** / **Hacer test de nivel**) → "¿Cuánto querés practicar por día?" (Casual 5 min = 10 XP · Regular 10 min = 20 XP · Serio 15 min = 30 XP · Intenso 20 min = 50 XP) → permiso de notificaciones (mock) → arranca la primera lección.
- Login/registro **simulado** (nombre + avatar; sin contraseña real). Perfil demo precargado como atajo.
- **Test de nivel**: 8 preguntas de dificultad creciente que ubican en A1, A2 o B1.

**B. Aprender (pantalla principal)**
- Header fijo: curso, racha (llama), XP del día / gemas, corazones.
- **Mapa de unidades** con camino sinuoso. Nodos **con forma de escudo** (activo, completado dorado, bloqueado gris cinta).
- Cabecera de unidad con **cinta verde** (título + descripción).
- Mascota "Skilly" parada junto al nodo activo con globito.
- Cofres de recompensa en el camino (gemas/XP).
- Bloqueo/desbloqueo secuencial. Tocar un nodo abre popup "Empezar +10 XP".

**C. Lección (núcleo del producto)** — tipos de ejercicio en 3.3
- Pantalla completa: ✕ para salir (con confirmación "¿Seguro? perdés tu progreso"), **barra de progreso**, **corazones**.
- 8–10 ejercicios por lección. Botón **COMPROBAR** deshabilitado hasta responder.
- **Panel de feedback inferior** (verde correcto / rojo incorrecto) con respuesta correcta, explicación breve y botón **CONTINUAR**. Mensaje aleatorio según el tono del manual.
- Errores: se pierde **1 corazón**; el ejercicio fallado **se repite al final** de la lección (como Duolingo).
- Racha de aciertos dentro de la lección ("¡3 seguidas!") con efecto.
- **0 corazones** → se corta la lección y aparece el modal **"¡Te quedaste sin vidas!"** (ver 3.2).
- **Pantalla de fin de lección:** mascota festejando, XP ganado, precisión %, tiempo, bono por "lección perfecta" y por rapidez; si fue la primera del día → animación de **racha extendida** con calendario semanal.
- Botón de **sonido/altavoz** en frases de inglés (TTS) y modo "lento".

**D. Corazones (calco Duolingo)**
- Máximo **5**. Se pierde 1 por error. Regeneran **1 cada 5 h** (en el demo se acelera con el panel de demo, ver 3.5).
- Sin corazones: modal con salidas: **Practicar para ganar 1 corazón** (lección corta de repaso de errores), **Recargar con 350 gemas**, **Esperar** (cuenta regresiva) o volver al inicio.
- Con corazones llenos, el repaso no consume vidas.

**E. Gamificación**
- **XP** por lección (10 base + 5 perfecta + 3 rápida), **gemas** por lecciones, misiones y cofres.
- **Racha** diaria con llama (naranja), calendario de racha, **congelar racha** (comprable con gemas), alerta "tu racha está en peligro".
- **Meta diaria** configurable con aro de progreso y celebración al cumplirla.
- **Misiones diarias** (3 por día: "Ganá 30 XP", "Completá 2 lecciones", "Hacé una lección sin errores") con barra y cofre al completar. **Misión del mes** de vacaciones.
- **Liga semanal** (pestaña propia): 30 participantes (alumnos ficticios con nombres de adolescentes argentinos), **Bronce → Plata → Oro → Zafiro → Rubí**, el **top 10 asciende**, los **últimos 5 descienden**, cuenta regresiva hasta el domingo. Los bots suman XP durante el demo.
- **Logros** (≈ 20): primera lección, racha 3/7/14/21, 100 XP, lección perfecta, 10 lecciones, madrugador/noctámbulo, liga de oro, etc., con niveles bronce/plata/oro.
- **Tienda**: recargar corazones, congelar racha, doble XP por 15 min.

**F. Skills Go especial: Desafío de Vacaciones (diferencial de retención)**
- Campaña con fecha: **"21 días de racha"** (calendario con casillero por día + premios por hitos: día 7, 14, 21).
- **Premios Skills** canjeables **en la academia** (mock): clase de conversación gratis, descuento en la próxima cuota, merch Skills, entrada a evento. Cada premio con código/ID simulado en Perfil → "Mis premios".
- Banner en la pantalla principal y mensajes de la mascota.
- Compartir progreso (mock que genera una imagen para Instagram/WhatsApp).

**G. Perfil y estadísticas**
- Avatar, nombre, nivel, "en Skills desde", racha, XP total, liga, logros destacados.
- Estadísticas: lecciones, XP semanal (gráfico), palabras aprendidas, precisión.
- **Amigos** (mock): compañeros de comisión, seguir, ver su racha, "amigo de racha".
- Configuración: meta diaria, sonidos, notificaciones, cerrar sesión, borrar progreso.

**H. Práctica**
- **"Practicá tus errores"**: repaso con ejercicios fallados (da XP, no gasta corazones, recupera 1).
- Lista de **vocabulario aprendido** con audio.

**I. Recordatorios (simulados)**
- **Notificación push mock** (banner estilo sistema dentro del demo) disparable desde el panel de demo, con la mascota y tono Duolingo.
- Pantalla de **ajustes de recordatorio** (hora, días).

### 3.2 Reglas de negocio (comportamiento exacto)

| Regla | Valor |
|---|---|
| Corazones máximos / iniciales | 5 / 5 |
| Pérdida por error | 1 |
| Regeneración | 1 cada 5 h (acelerable en demo) |
| Repaso con corazones llenos | no consume |
| Recarga completa | 350 gemas |
| Práctica para ganar corazón | 1 lección corta (5 ejercicios) → +1 corazón |
| Gemas por lección | 5 (+5 si es perfecta) |
| Cofre de misión | 10–30 gemas |
| Congelar racha | 200 gemas; cubre 1 día sin práctica |
| Racha | +1 por día con ≥ 1 lección completada; se corta tras 1 día sin actividad (salvo congelador) |
| Meta diaria | XP objetivo elegido en onboarding |
| Liga: ascenso / descenso | Top 10 / últimos 5 |
| Cierre de semana de liga | domingo 23:59 (en demo: botón "Cerrar semana") |

### 3.3 Tipos de ejercicio

| # | Tipo | Dinámica | Notas |
|---|---|---|---|
| 1 | **Elegir traducción** | Frase en inglés, 3–4 opciones en español (o al revés) | Con audio |
| 2 | **Armar la oración** | Banco de palabras tocables, se acomodan en la línea | Distractores; acepta variantes válidas |
| 3 | **Escribir la traducción** | Input libre ES→EN | Tolerancia a mayúsculas/puntuación/acentos; "casi correcto" con 1 typo |
| 4 | **Unir pares** | 5 pares inglés ↔ español | Audio al tocar |
| 5 | **Escuchar y escribir** | Reproduce audio y el alumno escribe | TTS, botón "lento" |
| 6 | **Escuchar y elegir** | Audio → elegir la frase correcta | |
| 7 | **Completar el hueco** | Frase con espacio y opciones | Gramática en contexto |
| 8 | **Elegir la imagen** | Palabra en inglés + 4 imágenes | Vocabulario; emojis aceptables como ilustración de contenido (no para UI) |
| ⊕ | **Hablar (mock)** | "Decí esta frase": micrófono que simula reconocimiento | Opcional, con "omitir"; marcado como *mock* |

### 3.4 Contenido (muestra jugable)

Criterio: **calidad sobre cantidad**, pero que se vea lleno. Temas pensados para adolescentes argentinos.

| Nivel | Unidades | Lecciones | Estado |
|---|---|---|---|
| **A1 Starter** | 1. *Hello!* (saludos, presentaciones) · 2. *Me & my world* (familia, amigos, edad, números) · 3. *My day* (rutina, hora, escuela) · 4. *Food & hangouts* (comida, pedir, gustos) | 3 por unidad = **12** | **Jugable completo** |
| **A2 Elementary** | 5. *Weekend plans* · 6. *Social media & tech* | 2 por unidad = **4** | Jugable |
| **B1 Intermediate** | 7. *Travel & dreams* | 1 jugable, resto visible bloqueado | Parcial |
| **Total** | 7 unidades | **≈ 17 lecciones · ≈ 150 ejercicios** | |

- Cada lección: 8–10 ejercicios mezclando tipos, con **explicación en español** de cada respuesta.
- **Test de nivel**: banco aparte de 8 preguntas.
- Audio: **Web Speech API** (voz en inglés del dispositivo).

### 3.5 Panel de demo (para presentarle al cliente)

Botón oculto (triple tap en el logo) que abre atajos para mostrar todo sin esperar:
- Simular **paso de días** (+1 día: ver racha/ruptura).
- **0 corazones** / **llenar corazones** / **acelerar regeneración**.
- Dar **XP / gemas**.
- **Disparar notificación** mock (racha en peligro, liga, desafío de vacaciones).
- **Cerrar semana de liga** (ver ascenso/descenso).
- **Completar la lección** actual (atajo).
- **Resetear** datos / cargar perfil **"Alumno con 12 días de racha"**.
- Ir al **Dashboard de la academia**.

### 3.6 Panel de la academia (`/admin`, vista web de escritorio)

Login simulado ("Dirección" / "Docente"). Datos ficticios coherentes con la app (≈ 120 alumnos, 8 comisiones).
- **KPIs:** alumnos activos hoy/semana/mes · **tasa de retención en vacaciones** · racha promedio · lecciones/día · XP semanal · alumnos en el Desafío de Vacaciones.
- **Gráficos:** actividad diaria (línea), activos por comisión (barras), distribución de rachas (histograma), retención por cohorte vs. año anterior.
- **Alumnos en riesgo:** tabla con quienes llevan 3+ días sin practicar, racha perdida, última actividad, con botón **"Enviar mensaje"** (mock de WhatsApp) y semáforo de riesgo.
- **Ranking de comisiones** y de docentes (participación).
- **Detalle de alumno:** actividad, racha, progreso por unidad, premios canjeados.
- **Campaña:** progreso del Desafío de Vacaciones, premios canjeados, costo estimado.
- Estética de la web de Skills (header blanco con logo, barra negra, cards verdes, botón rojo); gráficos con la paleta de marca siguiendo la skill `dataviz`.
- **Exportar CSV** (mock).

### 3.7 Fuera del prototipo (Fase 2 en el presupuesto)
- Backend real, base de datos, autenticación real, sincronización multi-dispositivo.
- **Notificaciones push reales** (Web Push / FCM, programadas por servidor).
- Integración con el sistema de gestión de la academia (alumnos, comisiones, cuotas, pagos).
- Panel de **carga y edición de contenido** (CMS) por docentes.
- Reconocimiento de voz real, pronunciación con IA.
- Repaso espaciado con algoritmo completo (el prototipo hace un repaso simple).
- Publicación en App Store / Google Play (o PWA empaquetada).
- Analítica real, A/B testing, moderación y seguridad de menores (consentimiento parental, privacidad).
- Contenido pedagógico completo de todos los niveles.
- Modo oscuro e interfaz multi-idioma.

---

## 4. Arquitectura técnica

| Capa | Elección |
|---|---|
| Framework | **React 18 + Vite + TypeScript** |
| Estilos | **Tailwind CSS** con tokens de `MANUAL_DE_MARCA.md` |
| Estado | **Zustand** con persistencia en `localStorage` |
| Rutas | React Router |
| Animación | Framer Motion (+ confeti ligero) |
| PWA | `vite-plugin-pwa` (manifest, service worker, offline, instalable) |
| Audio | Web Speech API (TTS) + sonidos sintetizados con WebAudio (sin archivos) |
| Gráficos (admin) | Recharts |
| Íconos | Lucide + íconos de juego propios en SVG (corazón, llama, rayo, gema, cofre, escudo) |
| Fuentes | Gabarito + Roboto vía `@fontsource` (offline) |
| Tests | Vitest (lógica de ejercicios, corazones, racha, liga) + Playwright (flujos en viewport móvil) |
| Deploy | Hosting estático → un link para el cliente |

**Estructura propuesta**
```
src/
  app/            # router, layout, providers
  design/         # tokens, componentes UI base (Button, Chip, Progress, Panel...)
  assets/         # svg del escudo, íconos, mascota (Skilly)
  data/           # contenido: levels/*.json, placement.json, bots, admin mock
  domain/         # tipos, motor de ejercicios, reglas (hearts, streak, xp, league, quests)
  store/          # zustand (progress, settings, demo)
  features/
    onboarding/ placement/ path/ lesson/ results/
    gamification/ (quests, achievements, shop, streak)
    league/ profile/ friends/ vacation/ practice/ notifications/
    demo/         # panel de demo
    admin/        # dashboard
public/           # íconos PWA, manifest
```

**Contrato de datos compartido (Fase 0)** — tipos en `src/domain/types.ts`:
`Level`, `Unit`, `Lesson`, `Exercise` (unión discriminada por `type`), `Answer`, `LessonResult`, `UserState` (hearts, gems, xp, streak, goal, completed, mistakes, quests, achievements, league), `League`, `Quest`, `Reward`, `AdminStudent`.

---

## 5. Pantallas (inventario final)

**Alumno:** Splash · Onboarding (6 pasos) · Test de nivel · Aprender (mapa) · Popup de nodo · Lección (8 tipos) · Fin de lección · Racha extendida · Sin vidas · Tienda · Misiones · Liga · Fin de semana de liga · Logros · Perfil · Estadísticas · Amigos · Mis premios · Desafío de vacaciones · Práctica · Vocabulario · Configuración · Ajustes de recordatorio · Notificación (mock) · Panel de demo.
**Academia:** Login · Resumen · Alumnos · Alumnos en riesgo · Comisiones · Detalle de alumno · Campaña.

---

## 6. Criterios de aceptación (definición de "listo")

1. Se instala como PWA en Android/iOS y funciona **offline** (después de la primera carga).
2. Se completa una lección A1 de punta a punta con los 8 tipos de ejercicio.
3. Los **corazones** se pierden, se corta la lección con 0, y se recuperan por práctica/gemas/tiempo.
4. **Racha, XP, meta diaria, misiones y liga** persisten tras recargar la página.
5. El test de nivel ubica correctamente a A1/A2/B1.
6. El **panel de demo** permite recorrer todos los casos en menos de 5 minutos.
7. Dashboard `/admin` con KPIs, gráficos y alumnos en riesgo, coherente con los datos de la app.
8. Respeta el manual de marca (colores, tipografía, tono, componentes) y pasa **contraste AA**.
9. Build sin errores, tests de dominio en verde, sin warnings de lint.
10. Se ve bien de 360×640 a 430×932; en desktop se muestra dentro de un marco de teléfono.

---

## 7. Guion de presentación del prototipo (5 min)

1. Abrir en el celular → instalar → splash con escudo.
2. Onboarding rápido → primera lección: acertar, equivocarse (corazón), terminar con festejo y racha.
3. Mapa, misiones, liga, logros.
4. **Panel de demo:** quedarse sin corazones → modal → práctica para recuperar.
5. Notificación "tu racha está en peligro".
6. **Desafío de Vacaciones** y premios canjeables en la academia.
7. Saltar al **Dashboard**: retención, alumnos en riesgo, "Enviar mensaje".
8. Cierre: *"Tu inglés no se toma vacaciones."*

---

## 8. Riesgos y supuestos

- **Calco funcional ≠ copia de assets:** se replica el comportamiento, no se usa material de Duolingo (mascota, fuentes, sonidos, textos). Todo es propio de Skills Go.
- **TTS depende del dispositivo:** si no hay voz inglesa, mostrar aviso y el texto igual.
- **iOS PWA:** el push real no está en el prototipo (es mock); instalación manual con "Compartir → Agregar a inicio".
- **Contenido pedagógico:** es una muestra; Skills debería validarlo antes de producción.
- **Datos de menores:** en producción hay temas legales (consentimiento, privacidad); fuera del prototipo pero a mencionar en el presupuesto.
- **Logo:** falta SVG limpio y versión reversa; se re-traza en Fase 0.

---

## 9. Decisiones pendientes (mínimas)

- [x] Nombre de la mascota: **"Skilly"** (aprobado).
- [x] Hosting: GitHub Pages (workflow incluido; hay que habilitar Pages → Source: GitHub Actions).
- [x] Premios Skills: clase de conversación gratis, 10 % de descuento en cuota, remera Skills, entrada a evento.

---

## 10. Plan de implementación (una sola pasada, subagentes en paralelo)

**Fase 0 — Fundaciones (yo, secuencial):** scaffold Vite+React+TS+Tailwind, PWA, tokens de marca, componentes UI base, SVG del escudo + Skilly (mascota con 6 expresiones), íconos de juego, tipos y contrato de datos, store con persistencia, reglas de dominio (corazones, racha, XP, misiones, liga) con tests.

**Fase 1 — Módulos en paralelo (cada uno con archivos propios, sin pisarse):**

| Subagente | Dueño de | Entrega |
|---|---|---|
| **A. Motor de lección** | `features/lesson`, `features/results` | 8 tipos de ejercicio, validación/tolerancia, panel de feedback, corazones, repetición de errores, fin de lección, sin vidas |
| **B. Mapa, onboarding, test de nivel, perfil** | `features/onboarding`, `placement`, `path`, `profile`, `friends` | Camino con nodos-escudo, onboarding, test, perfil, estadísticas, configuración |
| **C. Gamificación y retención** | `features/gamification`, `league`, `vacation`, `notifications`, `practice`, `demo` | Misiones, logros, tienda, liga con bots, racha, desafío de vacaciones, premios, práctica de errores, notificaciones mock, panel de demo |
| **D1. Contenido A1** | `data/levels/a1.*` | 12 lecciones jugables + test de nivel |
| **D2. Contenido A2/B1** | `data/levels/a2.*`, `b1.*` | 5 lecciones + unidades bloqueadas |
| **E. Dashboard academia** | `features/admin`, `data/admin` | Todas las vistas de 3.6 con datos mock coherentes |

**Fase 2 — Integración y QA (yo, secuencial):** unir, `build`/`lint`/`typecheck`, Vitest, flujos con Playwright en móvil, revisión contra el manual de marca y los criterios de la sección 6, íconos PWA, deploy estático y entrega del link.

**Reglas para los subagentes:** leer `PLANIFICACION.md` y `MANUAL_DE_MARCA.md` antes de empezar; usar solo componentes y tokens de `src/design`; no editar archivos fuera de su carpeta; tipos solo de `src/domain/types.ts` (si falta algo, avisar); español rioplatense con tono Duolingo; sin dependencias nuevas sin avisar.

---

## 11. Estado final y pendientes

**Hecho:** todo el alcance de la sección 3 (alumno + academia), 106 tests unitarios, 6 flujos e2e con Playwright (lección completa con los 9 tipos, errores y corazones, todas las pantallas, panel de demo, dashboard, PWA instalable y **offline**), build de producción verificado.

**Decisiones de implementación a tener presentes**
- *Unir pares:* falla con 3 o más errores (no resta un corazón por cada par equivocado como en Duolingo).
- *Recargar corazones* desde el modal en una lección cortada vuelve al mapa (no retoma la lección).
- *Dashboard:* usa datos propios de demostración, independientes de lo que haga el alumno en la app.
- *Liga:* los bots avanzan "en vivo" mientras se mira la pantalla para que se vea el movimiento en el demo.
- *Desafío de Vacaciones:* se corta si se saltea un día (con opción de reiniciar).

**Pendientes / a validar con el cliente**
- [ ] Contenido pedagógico: validación de Skills (niveles reales, método).
- [ ] Logo: re-trazado vectorial propio (el escudo es una reproducción); HEX/Pantone oficiales.
- [ ] Emojis de bandera (Windows los muestra como letras) y de vocabulario: reemplazar por ilustraciones en producción.
- [ ] Habilitar GitHub Pages para tener el link de demo.
- [ ] Fase 2 (producto real): ver sección 3.7.

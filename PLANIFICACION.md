# Planificación — App de práctica tipo Duolingo para Skills (Córdoba Capital)

> Documento vivo. Se actualiza a medida que charlamos. Estado: **BORRADOR v0.3 — nombre y plataforma definidos; falta identidad de marca**.
> Documento hermano (a crear después): `MANUAL_DE_MARCA.md`.

---

## 1. Contexto y objetivo

- **Cliente:** Skills, academia de inglés en Córdoba Capital, Argentina.
- **Qué es:** una app de práctica de inglés gamificada (estilo Duolingo) con la marca de Skills.
- **Para qué:** se lanza en las **vacaciones** (receso de verano / invierno) para **mejorar la retención de alumnos**: que no "desconecten" del inglés ni abandonen la academia entre ciclos.
- **Qué estamos haciendo ahora:** un **prototipo** para acompañar el **presupuesto**. No es el producto final: es una demostración convincente de lo que el cliente va a recibir.

### Objetivo del prototipo
1. Que el cliente **vea y toque** la experiencia (se enamore de la idea).
2. Que justifique el presupuesto: se ve qué es MVP, qué es fase 2 y qué cuesta cada cosa.
3. Que demuestre cómo la app **ataca la retención** (rachas, recordatorios, ligas, panel para la academia).

### Métrica de éxito del producto real (para argumentar en el presupuesto)
- % de alumnos activos durante las vacaciones.
- Racha promedio / días activos por semana.
- % de alumnos que se re-inscriben al ciclo siguiente (vs. año anterior).

---

## 2. Usuarios

| Rol | Qué necesita | En el prototipo |
|---|---|---|
| **Alumno** | Practicar cada día en 5–10 min, sentir progreso, mantener la racha | Sí, es el foco |
| **Docente** | Ver quién practica, asignar contenido, reforzar | Versión liviana (solo lectura) |
| **Administración / Dirección** | Ver retención, engagement, alumnos en riesgo | Dashboard demo con datos ficticios |

---

## 3. Propuesta de alcance (a discutir)

### 3.1 Núcleo — DEBE estar en el prototipo (MVP demo)

**Alumno**
- [ ] Onboarding: elegir nivel (o test corto de ubicación) y meta diaria.
- [ ] Login simulado (sin backend real).
- [ ] **Mapa de unidades/lecciones** (camino tipo Duolingo) con bloqueo/desbloqueo.
- [ ] **Lecciones** con 6–8 ejercicios cada una. Tipos de ejercicio a incluir:
  - Opción múltiple
  - Completar la oración (fill-in-the-blank)
  - Ordenar palabras para armar la oración
  - Traducir (ES→EN y EN→ES) con tolerancia a errores menores
  - Unir pares (matching)
  - Escuchar y elegir/escribir (listening con Text-to-Speech del navegador)
- [ ] Feedback inmediato (correcto/incorrecto + explicación breve).
- [ ] **Gamificación:** XP, **racha diaria**, vidas/corazones (o alternativa más amable), meta diaria, celebraciones al terminar la lección.
- [ ] Pantalla de **perfil** con estadísticas y logros/insignias.
- [ ] **Ranking/Liga semanal** (con alumnos ficticios).
- [ ] **Recordatorio simulado** ("Tu racha de 5 días está en peligro") — mostrado como mock de notificación.

**Academia**
- [ ] **Dashboard demo** (vista web de escritorio) con métricas de retención y engagement con datos ficticios realistas.

### 3.2 Deseable — si el tiempo y el presupuesto lo permiten
- [ ] Modo "Desafío de vacaciones" (campaña con calendario: ej. "21 días de racha = premio en la academia").
- [ ] Recompensas canjeables en la academia (descuento, merch, clase gratis).
- [ ] Práctica de pronunciación (reconocimiento de voz).
- [ ] Repaso espaciado ("Practicá tus errores").
- [ ] Vista docente para asignar lecciones.

### 3.3 Fuera del prototipo (se menciona en el presupuesto como Fase 2 / producto real)
- Backend real, base de datos, autenticación real.
- Notificaciones push reales (PWA / app nativa).
- Integración con el sistema de gestión de la academia (alumnos, niveles, comisiones).
- Panel de administración para cargar contenido.
- Publicación en App Store / Google Play.
- Pagos, licencias, analytics reales.
- Contenido pedagógico completo (el prototipo trae solo una muestra).

---

## 4. Contenido del prototipo (muestra)

Propuesta mínima para que se vea "lleno" sin ser un proyecto de contenido:

- **2 niveles** de ejemplo (ej. *Beginner / A1* y *Elementary / A2*) — a confirmar con los niveles reales de Skills.
- **3–4 unidades** por nivel, **2–3 lecciones** por unidad → ~20–30 lecciones jugables, o menos con 1–2 lecciones muy pulidas + el resto "bloqueado".
- Temas ideales para Argentina/Córdoba: presentaciones, rutina diaria, comida y pedir en un restaurante, viajes, trabajo, etc.
- Voz en inglés vía **Web Speech API** (gratis, sin backend).

> **Decisión pendiente:** ¿cantidad vs. calidad? Recomendación: **menos lecciones, mejor pulidas** + resto del mapa visible pero bloqueado.

---

## 5. Retención: qué mecánicas vamos a mostrar (el corazón de la propuesta)

| Mecánica | Por qué ayuda en vacaciones |
|---|---|
| Racha diaria | Crea hábito; el alumno no quiere "perderla" |
| Meta diaria flexible (5/10/15 min) | Baja la barrera de entrada |
| Liga semanal | Competencia social liviana |
| "Desafío de vacaciones" | Da un objetivo con fecha y premio |
| Recordatorios | Reactiva al alumno dormido |
| Logros/insignias | Refuerzo positivo |
| Dashboard para la academia | La academia detecta alumnos en riesgo y los contacta |
| Vínculo con la academia (premios, clases) | Conecta el uso de la app con volver a cursar |

---

## 6. Propuesta técnica (para el prototipo)

> Principio: **rápido, mobile-first, sin backend**, fácil de compartir con un link.

- **Web app tipo PWA, mobile-first** (se ve como app en el celular, se muestra en desktop con marco de teléfono).
- **Frontend:** React + Vite + TypeScript + Tailwind (o similar).
- **Datos:** JSON local (contenido) + `localStorage` (progreso, racha, XP). Sin servidor.
- **Audio:** Web Speech API (TTS).
- **Animaciones:** Framer Motion / CSS (celebraciones, feedback).
- **Deploy:** hosting estático (Vercel / Netlify / GitHub Pages) → un link para mandar al cliente.
- **Dashboard de academia:** misma app, ruta `/admin` con datos mock.

Alternativas consideradas:
- *Figma clickeable*: más rápido pero no se "siente" real; descartado salvo que se prefiera.
- *App nativa (Flutter/React Native)*: sobredimensionado para un prototipo.

---

## 7. Pantallas (primer listado)

**Alumno:** Splash/Bienvenida → Onboarding (nivel, meta) → Home/Mapa → Lección (ejercicios) → Resultado de lección → Perfil → Liga → Logros → Configuración.
**Academia:** Dashboard (retención, rachas, alumnos activos, alumnos en riesgo) → Detalle de alumno/grupo (mock).

---

## 8. Preguntas abiertas (necesito tu input)

> Ronda 1 respondida (ver sección 10). Resuelto en ronda 2: nombre (Skills Go) y plataforma (PWA). Pendiente: acceso al material de marca (web e Instagram).

<details><summary>Preguntas originales</summary>

1. **Plataforma:** ¿el cliente espera ver algo en el celular (PWA/link) o basta una demo en pantalla? ¿La app final sería app nativa o web/PWA?
2. **Público:** ¿niños, adolescentes, adultos o todos? Cambia mucho el tono, la estética y los ejercicios.
3. **Niveles de Skills:** ¿cómo los llaman? ¿Siguen un libro/método (Cambridge, Oxford, propio)? ¿Cuántos niveles hay?
4. **Marca:** ¿tenés logo, colores, tipografías, o hay que armar el manual de marca desde cero? (ver `MANUAL_DE_MARCA.md`)
5. **Idioma de la interfaz:** ¿en español rioplatense (voseo) con el inglés como contenido? (asumo que sí).
6. **Alcance del dashboard de academia:** ¿lo incluimos en el prototipo o lo dejamos solo como mención en el presupuesto?
7. **Vidas/corazones:** ¿mantenemos el sistema de vidas (frustra a algunos) o usamos algo más amable?
8. **Tiempo/entrega:** ¿cuándo necesitás el prototipo? ¿Cuándo tiene que estar el producto real (inicio de vacaciones)?
9. **Presupuesto:** ¿querés que además de esto armemos el desglose de fases/horas para el presupuesto en este mismo repo?
10. **Nombre de la app:** ¿"Skills App", algo propio tipo "Skills Go", "Skills Vacation"?

</details>

---

## 9. Próximos pasos

1. Responder las preguntas abiertas y ajustar el alcance (esta doc).
2. Definir el `MANUAL_DE_MARCA.md` (colores, tipografía, tono de voz, logo, componentes).
3. Cerrar listado de ejercicios, contenido de muestra y pantallas.
4. Armar un plan de implementación por etapas.
5. Implementar el prototipo.
6. Armar el desglose Prototipo → MVP → Producto final para el presupuesto.

---

## 10. Registro de decisiones

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-10-15 | Se crea el documento de planificación | Planificar antes de implementar |
| 2026-10-15 | Público: adolescentes de 12 a 18 años | Define tono, estética y temas de contenido |
| 2026-10-15 | Niveles estándar (CEFR: A1, A2, B1…) por ahora | Skills no tiene definidos aún los suyos; se ajusta después |
| 2026-10-15 | Manual de marca se arma desde la web e Instagram de Skills | El cliente no tiene manual formal |
| 2026-10-15 | Dashboard de academia **incluido** en el prototipo | Es el argumento de retención para el cliente |
| 2026-10-15 | Vidas/corazones **incluidos**; el funcionamiento debe ser un calco de Duolingo | Gráfico y reconocible |
| 2026-10-15 | Prioridad: velocidad de entrega | Se implementa todo con Claude |
| 2026-10-15 | Sin desglose de presupuesto en este repo | Lo arma el usuario aparte |
| 2026-10-15 | Nombre de la app: **Skills Go** | Definido por el usuario |
| 2026-10-15 | Plataforma: **PWA** (instalable, mobile-first) | Definido por el usuario |
| 2026-10-15 | Fuentes de marca: skillsedu.com.ar e Instagram @skillsenglishinstitute | Bloqueadas por la red del entorno; pendiente de capturas/logo o abrir dominios |
| 2026-10-15 | Implementación en una sola pasada con subagentes en paralelo | Ver sección 11 |

---

## 11. Plan de implementación (una sola pasada, con subagentes)

Para que sea paralelizable sin pisarse, primero se fijan los **contratos compartidos** y después cada subagente toma un módulo con archivos propios.

**Fase 0 — Fundaciones (secuencial, la hago yo):**
- Scaffold del proyecto (Vite + React + TS + Tailwind), rutas, estructura de carpetas.
- Design tokens de `MANUAL_DE_MARCA.md` (colores, tipografía, radios, sombras) como tema Tailwind.
- Tipos de datos compartidos (`Lesson`, `Exercise`, `UserProgress`, etc.) y store de progreso (`localStorage`).

**Fase 1 — Módulos en paralelo (subagentes):**
| Subagente | Entrega |
|---|---|
| A. Motor de lección | Los 6 tipos de ejercicio, validación, feedback, corazones, XP, pantalla de resultado |
| B. Mapa + onboarding + perfil | Camino de unidades, bloqueos, test de nivel, meta diaria, perfil, logros |
| C. Gamificación y retención | Racha, liga semanal, notificación simulada, desafío de vacaciones, animaciones |
| D. Contenido | JSON de lecciones para 2–3 niveles CEFR con temas para 12–18 años |
| E. Dashboard academia | Ruta `/admin` con métricas y datos mock realistas |

**Fase 2 — Integración y QA (secuencial):**
- Unificar, correr build/lint, probar flujos con Playwright en viewport móvil, pulir, deploy estático.

**Calco de Duolingo (referencia de comportamiento):**
5 corazones, se pierde uno por error, a 0 corazones se corta la lección; se recuperan con tiempo o con práctica; barra de progreso en la lección; botón Comprobar/Continuar con panel verde/rojo; sonidos y celebración al terminar; racha con llama; XP por lección; ligas semanales con ascenso y descenso.

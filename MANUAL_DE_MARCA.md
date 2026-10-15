# Manual de marca — Skills English Institute / **Skills Go**

> Versión 0.2 — derivado de la web oficial (skillsedu.com.ar) y del logo provisto por el cliente.
> Los colores se **midieron por muestreo de píxeles** sobre las capturas, no salen de un manual oficial: si Skills tiene los códigos exactos (Pantone/HEX), se reemplazan en los tokens y listo.
> Alcance: marca madre (Skills) + cómo se extiende a la app **Skills Go** (gamificada, público 12–18 años).
> Instagram (@skillsenglishinstitute): no se revisó; se decidió usar la web como única referencia (ver sección 12).

Archivos de marca en el repo: `brand/logo-skills-full.png`, `brand/logo-skills-full-transparent.png`, `brand/shield-skills.png`, capturas de referencia en `brand/reference/`.

---

## 1. Esencia de la marca

| | |
|---|---|
| **Nombre** | Skills English Institute |
| **Firma / tagline** | *Building Skills* |
| **Trayectoria** | "+25 Years" — más de 25 años enseñando (sello del logo) |
| **Ubicación** | Av. Elías Yofre 1079, Barrio Jardín, Córdoba, Argentina |
| **Contacto** | skills@skillsedu.com.ar |
| **Oferta** | Cursos por edades (desde *Kiddies* para preescolares), preparación de exámenes, y sumarse al staff |
| **Personalidad** | Institucional, confiable, tradicional (escudo + serif) pero cálida y cercana (fotos de alumnos sonriendo, "¡Sumate y aprendé Inglés!") |

**Para Skills Go:** mantener la solidez y la confianza de la institución, pero con energía y juego para adolescentes. Es "la academia de siempre, en tu celular".

---

## 2. Logo

### 2.1 Composición
1. **Escudo**: bandera vertical roja / blanca / roja con borde verde, una **S serif roja** al centro, atravesada por una **cinta verde** con borde gris.
2. **Sello "+25 YEARS"**: círculo verde con cinta "Years" y la firma *Building Skills* en cursiva.
3. **Wordmark "SKILLS"**: serif en mayúsculas, peso muy bold y condensado, verde.
4. **Banda roja "ENGLISH INSTITUTE"**: rectángulo rojo, texto blanco en sans-serif bold mayúsculas.

### 2.2 Versiones
| Versión | Uso | Archivo |
|---|---|---|
| Completa sobre blanco | Documentos, web, presupuesto | `logo-skills-full.png` |
| Completa con fondo transparente | Superponer sobre claros | `logo-skills-full-transparent.png` |
| Escudo (con sello +25) | Splash, perfil, créditos | `shield-skills.png` |
| Reversa (texto blanco sobre verde) | Footer, fondos verdes (como en la web) | **A producir** (ver 2.5) |

### 2.3 Zona de respeto y tamaños mínimos
- Espacio libre alrededor = **alto de la S del escudo**.
- Mínimo logo completo: **120 px** de ancho en pantalla. Mínimo solo escudo: **32 px**.
- Debajo de 48 px, usar el escudo **sin** el sello "+25" y sin firma.

### 2.4 Usos incorrectos
- No deformar, rotar ni cambiar colores del escudo.
- No poner el logo a color sobre fotos ocupadas o fondos rojos/verdes saturados (usar reversa).
- No agregar sombras ni biseles al logo.
- No reescribir "SKILLS" con otra tipografía.

### 2.5 Lockup de **Skills Go** (propuesta)
Replicar la lógica del logo madre: **SKILLS** en serif verde y, en lugar de la banda roja de "ENGLISH INSTITUTE", una **banda roja con "GO"** en sans bold blanca.
> Esto mantiene a Skills Go como hijo directo de la marca, sin inventar una identidad nueva.

**Ícono de la PWA:** escudo sobre fondo verde `#00522E` (con zona segura *maskable* de 80 %).

> **Tarea de producción (Fase 0 de implementación):** re-trazar el escudo como **SVG** limpio (el PNG provisto tiene bordes suaves y el sello +25 pegado al escudo), generar la versión reversa y exportar íconos PWA (192, 512, maskable, favicon, apple-touch).

---

## 3. Color

### 3.1 Colores de marca (muestreados del logo y la web)

| Rol | Nombre | HEX | Dónde aparece | Contraste con blanco |
|---|---|---|---|---|
| Primario | **Verde Skills** | `#00522E` | Wordmark, footer, cards, borde del escudo | 9.35 : 1 ✔ AAA |
| Secundario | **Rojo Skills** | `#B8252B` | Escudo, banda "English Institute", botones "ver más" | 6.29 : 1 ✔ AA |
| Acento de campaña | **Rojo vivo** | `#D21B20` | Cartel "Pre-inscripciones 2026" | 5.36 : 1 ✔ AA |
| Detalle | **Gris cinta** | `#D8CFCC` | Borde de la cinta del escudo | — |
| Neutro | **Negro** | `#000000` | Barra de navegación de la web | 21 : 1 |
| Neutro | **Blanco** | `#FFFFFF` | Fondos, texto sobre verde/rojo | — |

Proporción de uso en la web: **blanco 50 % · verde 25 % · negro 10 % · rojo 15 %**. En la app: blanco/neutros dominan, verde como protagonista, rojo como acento y para corazones/errores.

### 3.2 Extensión para la app (decisión de diseño)

La gamificación necesita estados que la marca no define. Se derivan de la paleta de Skills para que se sienta propio:

| Token | HEX | Uso |
|---|---|---|
| `--go-primary` | `#00522E` | Botón principal, header, progreso |
| `--go-primary-dark` | `#003B20` | "Sombra" inferior del botón 3D |
| `--go-primary-tint` | `#E6F2EB` | Fondo del panel **correcto** (texto `#00522E`, 8.13 : 1) |
| `--go-danger` | `#B8252B` | Texto/ícono de error |
| `--go-danger-tint` | `#FBE9EA` | Fondo del panel **incorrecto** (texto `#B8252B`, 5.38 : 1) |
| `--go-heart` | `#D21B20` | Corazones/vidas |
| `--go-streak` | `#F2A33A` | **Racha** (llama) — *color nuevo, ajeno a la marca* |
| `--go-xp` | `#F2C94C` | **XP, monedas, logros** — *color nuevo* (texto sobre él: `#1B1B1B`, 10.86 : 1) |
| `--go-bg` | `#FFFFFF` | Fondo de pantallas |
| `--go-surface` | `#F5F2F0` | Tarjetas y fondos suaves (derivado del gris cinta) |
| `--go-border` | `#E4DDD9` | Bordes |
| `--go-locked` | `#D8CFCC` | Nodos bloqueados (gris cinta) |
| `--go-text` | `#1B1B1B` | Texto principal |
| `--go-text-muted` | `#6B6360` | Texto secundario |

> **Decisión aprobada:** naranja (racha) y amarillo (XP) no son de la marca. Se usan **solo en elementos de gamificación** y nunca en logo, headers ni botones principales. Si Skills prefiere no sumar colores, la alternativa es racha en rojo y XP en gris cinta, a costa de menos "juego".

### 3.3 Reglas de accesibilidad
- Texto blanco solo sobre `#00522E`, `#B8252B` y `#D21B20` (todos ≥ 5.3 : 1).
- **No** usar blanco sobre verdes más claros (ej. `#2F9E5E` da 3.4 : 1 ✘).
- El estado correcto/incorrecto **nunca** se comunica solo por color: también ícono (✓ / ✕) y texto.

---

## 4. Tipografía

| Uso | Fuente | Pesos | Nota |
|---|---|---|---|
| **Logo / "SKILLS"** | Serif condensada bold del logo | — | **Solo en el logo.** No se reproduce en la UI. |
| **Títulos y números** de la app | **Gabarito** (Google Fonts) | 700 · 800 | Geométrica redondeada, cercana a la del cartel "Pre-inscripciones 2026" de la web |
| **Texto y UI** | **Roboto** | 400 · 500 · 700 | Es la que usa la web para los textos (ej. "Cursos para Preescolares/Kiddies") |
| **Contenido en inglés** (frases de ejercicios) | Gabarito 600 | 600 | Un poco más grande que el resto, para destacarlo |

- Las fuentes se **autoalojan** (paquetes `@fontsource`) para que la PWA funcione **offline**.
- Escala (mobile): H1 28/34 · H2 22/28 · H3 18/24 · Body 16/24 · Caption 13/18. Ejercicio (frase): 22–26.
- Mayúsculas: solo para etiquetas cortas (`UNIDAD 1`, `GO`) y botones, con `letter-spacing: 0.05em`.

---

## 5. Forma, espacio y elevación

| Token | Valor | Observación |
|---|---|---|
| Radio base (app) | **16 px** | Más amable que la web (esquinas rectas); apropiado para un juego adolescente |
| Radio botones | 16 px | |
| Radio chips / insignias | 999 px | |
| Radio dashboard admin | **4–8 px** | La vista de la academia retoma la geometría recta de la web |
| Espaciado | Escala de 4 px (4·8·12·16·24·32·48) | |
| Gutter horizontal mobile | 16 px | |
| Borde de panel | 2 px `--go-border` | |
| Botón principal | Estilo **3D**: fondo `--go-primary`, borde inferior 4 px `--go-primary-dark`, al presionar baja 4 px | Calco del feeling Duolingo |

---

## 6. Motivos gráficos propios (lo que hace que se sienta *Skills*)

1. **Nodos con forma de escudo**: en el mapa de lecciones, en lugar de círculos, cada nodo es un escudo (activo: verde con borde blanco; completado: dorado `--go-xp`; bloqueado: gris cinta).
2. **La cinta**: la cinta verde con borde gris del escudo se usa como **cabecera de unidad** y separador de secciones.
3. **Banda roja**: banda rectangular roja con texto blanco bold para etiquetas clave (`GO`, `DESAFÍO DE VACACIONES`, `NUEVO`).
4. **"+25"**: el sello de trayectoria como detalle en perfil, créditos y pantalla de bienvenida ("Más de 25 años construyendo skills").
5. **Verde sobre foto**: en la web, las fotos llevan un velo verde. En la app se usa en splash, onboarding y campañas.
6. **Mascota (aprobada):** el **escudo con ojos y expresiones** (feliz, triste, festejando, durmiendo) como equivalente al búho de Duolingo. Es el elemento emocional clave para la retención (reacciona a la racha, a perder corazones, al terminar la lección).

---

## 7. Iconografía e ilustración

- Íconos: **Lucide** (trazo redondeado de 2 px), en `--go-text` o color de estado.
- Iconos de juego (corazón, llama, rayo/XP, trofeo, cofre, escudo): **sólidos, con borde y brillo suave**, estilo flat 2D con un solo nivel de sombra.
- **Sin emojis** como íconos de interfaz (se ven distintos según el dispositivo). Se permiten en mensajes de chat/celebración si suman.
- Ilustraciones: flat, formas simples, paleta de marca. Fotografía solo en marketing (adolescentes reales, sonrientes, luz natural).

---

## 8. Voz y tono

**Quién habla:** Skills, como un profe copado que te conoce. **Voseo rioplatense**, tuteo prohibido ("¡Seguí así!", no "¡Sigue así!").

| Principio | Cómo suena |
|---|---|
| Cercano, no infantil | Para 12–18: humor liviano, nada de tono de jardín de infantes |
| Alentador, nunca humillante | El error enseña, no castiga |
| Corto | Una idea por mensaje; botones de 1–2 palabras |
| Tono Duolingo | **Decidido:** juguetón, con humor y algo de picardía en recordatorios y mascota; español rioplatense neutro, **sin cordobesismos** |
| Inglés para el contenido, español para la guía | La interfaz va en español; las frases a practicar, en inglés |

### Microcopy de referencia
| Momento | Texto |
|---|---|
| Respuesta correcta | "¡Genial!" · "¡Bien ahí!" · "¡Crack!" · "Perfect!" |
| Respuesta incorrecta | "Casi. La respuesta era: **…**" · "No pasa nada, se aprende." |
| Último corazón | "¡Te queda 1 vida! Concentrate." |
| Sin corazones | "Te quedaste sin vidas. Repasá para recuperar una." |
| Fin de lección | "¡Lección completada! +15 XP" |
| Racha en peligro (notificación) | "Tu racha de 5 días está en peligro. ¡Con 5 minutos la salvás!" |
| Vacaciones | "El inglés no se toma vacaciones. Vos sí, pero practicá 5 minutos." |
| Botones | Comprobar · Continuar · Empezar · Salir · Reintentar |
| Cierre de campaña | "¡Sumate y aprendé Inglés!" (frase real de la web) |

### Slogans propuestos para Skills Go (a elegir)
1. **Building Skills, todos los días.** (continúa la firma de la marca)
2. **Tu inglés no se toma vacaciones.**
3. **Practicá. Sumá. Seguí.**

---

## 9. Componentes de UI (resumen)

- **Botón primario**: verde, texto blanco, mayúsculas, 3D.
- **Botón secundario**: blanco con borde `--go-border`, texto verde, 3D gris.
- **Botón peligro / salir**: rojo.
- **Barra de progreso de lección**: pista `--go-border`, relleno `--go-primary`, radio 999.
- **Panel de feedback** (parte inferior): `--go-primary-tint` correcto / `--go-danger-tint` incorrecto, con ícono y botón *Continuar* del color correspondiente.
- **Corazones**: `--go-heart`, con número al lado en el header del mapa y en la lección.
- **Chip de racha**: llama `--go-streak` + número.
- **Chip de XP**: rayo `--go-xp` + número.
- **Barra inferior de navegación**: Aprender · Liga · Logros · Perfil (íconos, activo con fondo `--go-primary-tint`).
- **Dashboard admin**: tipo web de Skills — header blanco con logo, barra negra de navegación, cards verdes `#00522E` con botón rojo, tablas simples.

---

## 10. Movimiento y sonido

- Transiciones de 150–250 ms con *ease-out*. Respuesta correcta: "pop" + confeti verde/rojo/dorado. Incorrecta: *shake* leve.
- Fin de lección: mascota festejando + contador de XP animado.
- Pérdida de corazón: el corazón se rompe y baja.
- Respetar `prefers-reduced-motion`.
- Sonidos (opcionales, con interruptor en Configuración): acierto, error, lección completa, racha. Se generan/embeben livianos para uso offline.

---

## 11. Aplicaciones

| Soporte | Resumen |
|---|---|
| **PWA Skills Go** | `theme_color` `#00522E`, `background_color` `#FFFFFF`, nombre corto "Skills Go", ícono escudo sobre verde |
| **Splash / bienvenida** | Fondo verde, escudo grande, "Skills Go", firma *Building Skills* |
| **Notificaciones (mock)** | Ícono del escudo, tono voseo, máximo 2 líneas |
| **Dashboard de la academia** | Geometría recta de la web, logo en header, barra negra, datos con verde y rojo |
| **Documento de presupuesto** | Logo completo sobre blanco, títulos en verde, acentos en rojo |

---

## 12. Pendientes y supuestos

- [x] **Instagram:** decidido no usarlo; la referencia es la web (capturas provistas).
- [ ] **HEX/Pantone oficiales:** los de este documento son aproximados (muestreo de capturas).
- [ ] **Tipografía del logo** y **de los carteles de campaña** inferidas visualmente; confirmar con quien diseñó la marca.
- [x] **Naranja de racha y amarillo de XP:** aprobados para generar el feeling Duolingo (ver 3.2).
- [x] **Mascota-escudo:** aprobada (ver 6.6).
- [x] **Cordobesismos:** no; tono Duolingo.
- [ ] **SVG del escudo y reversa:** producir en Fase 0 (ver 2.5).

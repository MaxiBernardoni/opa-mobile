# CLAUDE.md

Este archivo es la **única fuente de contexto persistente** para cualquier sesión de Claude Code que se abra en este repo. La mayoría de las sesiones son locales y residuales (corren en compus de la escuela, que están freezadas — no queda historial ni memoria de una sesión a la otra). Esto significa que **este documento tiene que alcanzar por sí solo** para que una sesión nueva entienda el proyecto completo, sepa qué está hecho, qué falta, y cómo trabajar conmigo. No asumas que existe contexto previo fuera de lo que está escrito acá y en `.claude/documents/`.

---

## Cómo trabajar conmigo (instrucciones para la IA)

- **Hablame siempre en español.** El código y los comentarios en inglés están bien, pero la conversación conmigo es en español.
- **Explicá el por qué**, no solo el qué. Si tomás una decisión técnica no obvia, decí brevemente el motivo (no hace falta un ensayo, una línea alcanza).
- **Preguntame antes de actuar, no asumas, en estos casos puntuales:**
  - Cualquier decisión de producto o UX, aunque parezca chica (cambia cómo se ve o comporta la app para el usuario final)
  - Cuando hay ambigüedad técnica — más de una forma razonable de resolver algo y no es obvio cuál preferís
  - **Nunca asumas que algo de una sesión anterior ya se aplicó.** Las sesiones no comparten memoria entre sí — verificá siempre en el código actual antes de decir "esto ya está hecho" o de construir sobre un supuesto de un sync/handoff previo
- Fuera de esos casos, con ambigüedad baja o tareas mecánicas, podés avanzar sin preguntar.
- Soy estudiante (no tengo background profesional de ingeniería de software) — priorizá explicaciones claras sobre jerga, pero no me subestimes: entiendo código y decisiones técnicas si me las explicás.

---

## Cómo funciona el proyecto ahora (modelo de sesiones)

Hasta el 2026-07-01 OPA se desarrollaba con 4 chats especializados en la nube (Frontend+Backend, Design, Database, Documentation) que se coordinaban mediante `.claude/documents/` y un skill `/sync`. **Ese modelo quedó descontinuado** (ver `.claude/documents/_archive/meta-2026-06-07-chat-structure.md` para referencia histórica).

Modelo actual:
- **Sesiones locales**: cada apertura de Claude Code en la compu de la escuela es una sesión de un solo uso, sin separación de roles — la sesión hace de frontend, backend, y lo que haga falta dentro de este repo. Al cerrar, ese contexto se pierde.
- **Un chat en la nube** (este) se mantiene activo para pulir y coordinar cosas más grandes o que requieran contexto acumulado.
- Por eso: **todo cambio relevante tiene que quedar escrito en el repo** (código + `.claude/documents/` + este archivo) antes de terminar una sesión. Si no está escrito, no existe para la próxima sesión.

---

## ¿Qué es OPA?

App mobile de descubrimiento de moda centrada en **outfits** como unidad principal de contenido (TikTok/Pinterest para moda). Tres pilares: descubrimiento de outfits, armario personal, compra contextual.

La infraestructura de backend (Supabase + Edge Functions + Hono API) vive en el repo separado `maxibernardoni/opa-backend` — ya no está en este repo. Ver "Mapa de repos" abajo.

### Qué NO es OPA (valores y decisiones descartadas)

- **No es un catálogo de e-commerce.** El outfit (contenido) va primero, la compra es contextual y viene después. Nunca se prioriza layout tipo tienda sobre layout tipo feed.
- **No es un feed genérico de moda.** Los pilares son descubrimiento + armario personal + compra — no se agregan features que no sirvan a alguno de los tres.
- **Las marcas no son "vendedores" pasivos** — son creadores de contenido primero (publican outfits armados con sus propias prendas). El catálogo y la venta son secundarios a eso. (Ver `.claude/documents/product-2026-06-10-brand-system.md`.)
- **Decisión descartada:** asignar talles de vendedor por defecto sin guía — se optó por el sistema de `size_guides` + `user_measurements` + recomendación automática en su lugar.
- **Decisión descartada:** un solo modo de venta uniforme — se optó por modelo híbrido (`direct` vs `redirect`) porque no todas las marcas quieren procesar pagos dentro de OPA.

---

## Mapa de repos

OPA vive en 4 repos separados. Si una tarea necesita tocar otro repo, decilo explícitamente — esta sesión probablemente no tiene ese repo clonado ni en su scope de acceso.

| Repo | Stack | Rol | Estado |
|---|---|---|---|
| `opa-mobile` (este repo) | React Native + Expo SDK 54 | App para usuarios finales (consumidores) | Activo, es el más avanzado |
| `opa-backend` (`opa-organization/opa-backend`) | Supabase + Edge Functions + Hono API | Infraestructura compartida entre opa-mobile y opa-web | ✅ Confirmado independiente (2026-07-03): se redeployó la Edge Function `api` en producción usando solo el código de `opa-backend` y se verificó `opa-mobile` funcionando end-to-end contra Supabase sin `backend/` local |
| `opa-admin` (`maxibernardoni/opa-admin`, sin confirmar si ya se transfirió) | Next.js 14 + shadcn/ui + Tailwind | Panel interno del equipo OPA (moderación, aprobar marcas, KPIs) — NO es para marcas ni usuarios finales | En desarrollo inicial |
| `opa-web` | Next.js (planeado) | Panel de gestión para marcas (analytics, stock, pedidos) — para uso desde desktop | No iniciado — crear directo bajo `opa-organization` |

Todos comparten el mismo proyecto Supabase (`vecnktrbjolahcalkbml`) y el mismo schema en español.

### Organización de GitHub (2026-07-03)

Los 4 repos de OPA se agrupan bajo la organización **`opa-organization`** en GitHub (antes estaban sueltos bajo la cuenta personal `MaxiBernardoni`).

- ✅ `opa-mobile` y `opa-backend` — transferidos y confirmados en esta sesión: `git remote -v` en ambos apunta a `github.com/opa-organization/...`, y funcionan (push/fetch probados).
- ⚠️ `opa-admin` — no se verificó en esta sesión si ya se transfirió. Antes de asumir nada, correr `git remote -v` en ese repo (o `git ls-remote https://github.com/opa-organization/opa-admin.git`) para confirmar.
- `opa-web` todavía no existe — cuando se cree, crearlo directamente bajo `opa-organization`, no bajo la cuenta personal.

**Nota sobre el método:** para mover un repo ya existente a una org se usa **Settings → Danger Zone → Transfer** (traspaso nativo de GitHub, sin clonar, sin pedir tokens) — no la opción "Import a repository" (esa clona por HTTPS y falla con `Invalid username or token` porque GitHub no soporta auth por password en operaciones git).
4. Actualizar todas las referencias a `maxibernardoni/opa-backend` y `maxibernardoni/opa-mobile` en este `CLAUDE.md` y en `.claude/documents/` (incluida la tabla de arriba) a `opa-organization/...`
5. Cuando se creen `opa-admin` y `opa-web`, crearlos directamente dentro de `opa-organization` en vez de bajo la cuenta personal.

**Próxima sesión: antes de asumir que esto está resuelto, correr `git remote -v` en cada repo y confirmar contra GitHub — no dar por hecho que la migración se completó solo porque está escrita acá.**

---

## Comandos de desarrollo

```bash
# Mobile / Web
npx expo start --web --clear   # Web en browser — funciona en cualquier red
npx expo start --clear          # Expo Go en celular — misma WiFi, SDK 54

# IMPORTANTE: siempre usar --legacy-peer-deps en npm install
npm install --legacy-peer-deps

# API (Deno / Supabase Edge Functions) — repo separado, ver opa-backend
# cd ../opa-backend
supabase functions serve api    # Dev local
supabase functions deploy api   # Deploy a producción
```

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | React Native + Expo SDK 54 (managed workflow) |
| Navegación | Expo Router v6 (file-based routing) |
| Estado global | Zustand (`store/useAuthStore.ts`) |
| Imágenes | Expo Image |
| Backend | Supabase (Project ID: `vecnktrbjolahcalkbml`) |
| API server | Hono v4 en Deno (Supabase Edge Functions) — código en `opa-backend/functions/api/` (repo separado) |
| Lenguaje | TypeScript (mobile) / TypeScript en Deno (API) |

---

## Design tokens

```ts
// colors.ts
rosaOpa: '#EB006B'         // primario, acciones
negro: '#000000'
blanco: '#FFFFFF'
grisClaro: '#838383'       // texto secundario
grisBorde: '#F2F2F2'       // bordes
grisMedio: '#D9D9D9'       // placeholders
grisOscuro: '#4E4E4E'      // texto terciario
bordeTag: '#A6A6AC'

// fonts.ts — mergeOne (títulos), palanquinDark (botones, usernames)
// radius.ts — card:15, chip:10, button:8, tag:8, avatar:9999
// spacing.ts — xs:4, sm:8, md:12, lg:16, xl:24, xxl:32
```

Assets en Supabase Storage: `https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/assets/`
Los nombres de archivo son **case-sensitive**: `Grid.png` (G mayúscula), iconos de nav en subcarpeta `nav/`.

---

## Esquema de base de datos

Tablas y columnas en **español**:

```
perfiles        — extiende auth.users; trigger handle_new_user() crea fila al registrarse
marcas          — brands; profile_id FK → perfiles
prendas         — garments; brand_id FK → marcas; sale_mode ('direct'|'redirect'), external_url, size_guide_id
outfits         — creator_id FK → perfiles; likes_count/saves_count mantenidos por triggers
outfit_items    — outfit_id + garment_id + slot ('torso'|'piernas'|'calzado'|'extras')
outfit_likes    — UNIQUE(user_id, outfit_id); trigger actualiza outfits.likes_count
outfits_guardados — UNIQUE(user_id, outfit_id); trigger actualiza outfits.saves_count
prendas_guardadas — UNIQUE(user_id, garment_id); prendas en favoritos para comprar
follows         — UNIQUE(follower_id, following_id); trigger actualiza followers/following_count
prendas_armario — armario personal del usuario
productos_carrito — fuente para el checkout (POST /api/orders lo consume y vacía)
orders          — status: pending/shipped/delivered
productos_orden — items de una orden
size_guides     — guías de talle; brand_id nullable (NULL = OPA default)
size_guide_entries — entradas por talle con rangos de medidas
user_measurements — medidas del usuario; RLS estricto (solo fila propia)
brand_applications — solicitudes para ser marca
```

---

## Arquitectura del código

### Mobile (`app/`)

```
app/
  _layout.tsx         — fonts, auth init, Stack navigator
  (tabs)/
    index.tsx         — Home: carousels de outfits, prendas, marcas
    outfits.tsx       — Outfit Scroll TikTok-style; acepta ?outfitId para deep-link
    profile.tsx       — Perfil: header horizontal, 3 tabs (grid/favoritos/pedidos), sub-tabs
    search.tsx        — búsqueda funcional: texto + tabs + tag filters
    wardrobe.tsx      — armario personal con datos reales
  auth/index.tsx      — Login/Signup con validación por campo en tiempo real
  settings.tsx        — Logout, eliminar cuenta, "Mis medidas", "Registrar Marca" (si !is_brand)
  measurements.tsx    — inputs numéricos (altura/pecho/cintura/cadera/muslo cm), persiste via useUserMeasurements().save()
  user-outfits.tsx    — Scroll de outfits de un usuario; params: userId, startIndex
  saved-outfits.tsx   — Scroll de outfits guardados; param: startIndex
  outfit/[id].tsx     — detalle de outfit con prendas por slot, precio total, CTA
  product/[id].tsx    — detalle de prenda con SizeGuideSheet, selector de talle, CTA
  user/[id].tsx       — perfil de lectura de otro usuario (no marca separada); redirige a /(tabs)/profile si es el propio
  marca/[id].tsx      — perfil público de una marca (banner + avatar-logo, badge verificada, "ya lo tenés", stats Seguidores/Outfits/Prendas, Seguir, tabs Grid/Catálogo). Hook useBrand. Outfits/Seguidores vacíos hasta que las marcas tengan profile_id (onboarding pendiente); catálogo con datos reales
```

**Flujo de auth:** `_layout.tsx` llama `supabase.auth.getSession()` + `onAuthStateChange()` → popula `useAuthStore` (session + profile). `initialized` previene flashes de UI.

**Deep-link Home → Outfit Scroll:** Home pasa `outfitId` como param a `/(tabs)/outfits`. El scroll usa `getItemLayout` + `scrollToIndex` / `scrollToOffset`. Índice 0: `scrollToOffset({ offset: 0 })`.

**Toggle like/save:** INSERT optimista en `outfit_likes` / `outfits_guardados`. Si error `23505` (unique constraint) → ya existía, tratar como éxito. DELETE para deshacer.

**Ver perfil de otro usuario:** antes de `app/user/[id].tsx` no existía esto — tocar un creador en cualquier lado de la app saltaba directo a `user-outfits.tsx` (su scroll de outfits), nunca a un perfil. Los 3 puntos de entrada (`outfit/[id].tsx`, `OutfitScrollItem` del scroll principal, `search.tsx`) ahora navegan a `/user/[id]` primero. Quedaron fuera de alcance (ver pending-features): conexiones mutuas ("Seguís a X y N más en común") y campanita de notificaciones en el botón Seguir — ninguna tenía precedente en el código ni columnas de DB para soportarlas.

### Hooks (`hooks/`)

| Hook | Retorna |
|---|---|
| `useOutfits(creatorId?)` | outfits del feed o de un usuario |
| `useProfile(userId)` | perfil de un usuario |
| `useSavedOutfits(userId)` | outfits guardados — expone `refetch()` |
| `useSavedGarments(userId)` | prendas guardadas — expone `refetch()` |
| `useWardrobe(userId)` | armario personal |
| `useLike(outfitId, initialCount)` | like toggle con optimistic update |
| `useSave(outfitId, initialCount)` | save toggle con optimistic update |
| `useFollow(targetUserId)` | follow toggle |
| `useSizeGuide(guideId?)` | guide + entries ordenadas por sort_order |
| `useUserMeasurements()` | measurements + `save()` con UPSERT |
| `useRecommendedSize(guideId?)` | llama `supabase.rpc('get_recommended_size')` |

### API (código en `opa-backend/functions/api/`, repo separado)

Hono v4 en Deno. Base path: `/api`. Auth middleware en todas las rutas protegidas — lee `Authorization: Bearer <token>`, valida con `supabase.auth.getUser()`, expone `c.get('user')` y `c.get('supabase')`.

```
GET  /api/health                       — liveness check
GET  /api/brands/me                    — brand del usuario autenticado
PATCH /api/brands/me                   — actualiza brand info
GET  /api/brands/me/metrics            — likes + saves (visit/click pendiente de tablas DB)
GET  /api/brands/me/prendas            — lista prendas de la marca
POST /api/brands/me/prendas            — crea prenda; external_url requerido si sale_mode='redirect'
PATCH /api/brands/me/prendas/:id       — actualiza prenda con verificación de ownership
GET  /api/orders                       — órdenes del usuario
POST /api/orders                       — checkout: valida stock, crea order, decrementa stock, vacía carrito
PATCH /api/orders/:id/status           — brand owner cambia status (pending/shipped/delivered)
```

Rate limiter in-memory en `POST /orders`: ventana 60s, max 20 req/user. Nota: el rate limiter corre *antes* que el auth middleware en el orden de registro, así que `c.get('user')` está vacío en ese punto y el límite nunca se aplica en la práctica — bug preexistente, pendiente de arreglar (ver pending-features).

---

## Decisiones técnicas críticas

- **`--legacy-peer-deps` obligatorio** en todos los `npm install` — conflictos de peer deps de Expo SDK 54.
- **`newArchEnabled: false`** — incompatible con react-native-screens@4.16.0 en RN 0.81.5.
- **`"updates": { "enabled": false }`** en app.json — sin esto Expo Go descarga el bundle remoto en vez del servidor local.
- **`pointerEvents` como style prop** — en `app/(tabs)/outfits.tsx` el SafeAreaView flotante usa `style={{ pointerEvents: 'box-none' }}`. En RN 0.71+ como prop directo está deprecado.
- **Supabase Auth storage:** `expo-secure-store` en nativo, `localStorage` en web. Configurado en `lib/supabase.ts`.
- **Fuente Merge One:** `assets/fonts/MergeOne-Regular.ttf` cargada con `expo-font`. No está en `@expo-google-fonts`.
- **Marco mobile en web (`components/layout/MobileFrame.tsx`):** en web, cuando la ventana es más ancha que un teléfono (`APP_MAX_WIDTH = 393`, iPhone 16 Pro) la app se encuadra en una columna centrada de 393px de ancho × 100% de alto sobre fondo gris (se lee como un celular). En nativo, o cuando la ventana ya es angosta (Chrome responsive / celular real), el marco no se aplica y la app ocupa todo el ancho → responsive automático. El wrapper está en el root (`app/_layout.tsx`) envolviendo el `<Stack>`. **Detalle no obvio:** el alto del marco se setea numérico (= `useWindowDimensions().height`) porque react-native-web no estira confiable con `flex:1` / `'100vh'` cuando el root no tiene alto definido (con `flex:1` la columna colapsaba al alto del contenido).
- **`constants/layout.ts` (`APP_WIDTH`):** todos los cálculos de layout basados en ancho (carruseles, grillas, paginado, ancho de cards) usan `APP_WIDTH` en vez de `Dimensions.get('window').width`. `APP_WIDTH` = ancho real en nativo, capeado a `APP_MAX_WIDTH` en desktop-web, para que el layout interno se calcule contra el ancho del "teléfono" y no del monitor. La **altura** sigue usando `Dimensions.get('window').height` directo (el marco ocupa 100% del alto → la altura de la ventana es la altura visible real; paginado del outfit scroll intacto). Son constantes a nivel de módulo: no se recalculan en un resize en vivo (comportamiento preexistente), pero sí en cada carga.

### Gotchas de proceso (no solo técnicos)

- **No confíes en un checklist `[x]` sin verificar el código.** Ya pasó que un sync entre chats marcó pantallas como "implementadas y mergeadas" cuando en realidad eran stubs — el commit real llegó después. Antes de decir "esto ya está hecho", leé el archivo.
- **`.claude/documents/` puede desactualizarse.** Es la mejor fuente disponible, pero no es infalible — si algo no cuadra con lo que ves en el código, el código manda y hay que corregir el doc.
- **Commits/PRs:** en la práctica, las últimas sesiones (incluida esta) commitean y pushean directo a `main` — el historial real (`git log`) no muestra ramas de feature ni PRs para los cambios recientes, a pesar de que una versión anterior de esta nota decía "rama `claude/trusting-fermi-jfr1ix`, PR draft, squash merge". Si vas a pushear directo a `main`, confirmá con el usuario primero (el harness de Claude Code bloquea el push directo a main sin autorización explícita en el mismo turno, incluso si ya se aprobó "commit y push" en general) — no asumas que un "sí, commit y push" previo ya cubre el push a main.
- **Antes de armar una vista nueva, revisar si el ícono/imagen ya existe en Supabase Storage (`assets/`) en vez de usar texto/emoji como placeholder.** Pasó con `app/user/[id].tsx`: se armó la flecha de back y el ícono de compartir como texto (`←`, `↑`) cuando ya existían `flecha.png` y `compartir.png` en el bucket, sin uso en ningún otro lado del código todavía (hubo que corregirlo en una segunda vuelta a pedido del usuario). Para chequear rápido si un asset existe: `fetch(BASE + 'nombre.png', {method:'HEAD'})` desde el preview del browser (HEAD 200 = existe) — Bash/PowerShell dentro de esta sesión pueden no tener red hacia Supabase por igual (Bash falló con curl, PowerShell con `Invoke-WebRequest` sí funcionó, y también sirvió para descargar la imagen a un archivo temporal y abrirla con Read para ver visualmente el ícono antes de usarlo — por ejemplo para confirmar que `flecha.png` apunta a la izquierda). Si no hay asset para un ícono puntual (se buscó y no existe, ej. no hay ningún ícono de menú "···" en el bucket), ahí sí un texto/emoji como placeholder está bien.
- **Cuidado al probar botones que escriben en la DB (like, save, follow) contra Supabase real: el browser del preview puede tener una sesión de auth persistida de una prueba anterior sin que se note.** Pasó en esta sesión: se buscó confirmar con `Object.keys(localStorage)` que no había sesión antes de un test de follow, pero la sesión real estaba guardada bajo otra clave (no en `localStorage` visible en ese momento) y el click sí ejecutó un `INSERT` real en `follows` en producción — quedó `mateo.h` siguiendo a `vale.rios` (fila `id: c7c9cf7b-6621-45d3-8dc9-7cca7c585f88`, creada 2026-07-03). Se le preguntó al usuario si revertirlo y decidió dejarlo así, así que **ese follow es real, no es basura de seed data** — no lo borres por las dudas sin preguntar primero. Para la próxima: antes de tocar botones de escritura contra el proyecto Supabase real, asumí que puede haber una sesión activa aunque no la hayas iniciado vos en esa conversación, y avisá al usuario en vez de "confirmar" con un chequeo que puede dar falso negativo.
- **El `.env` local (con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`) está gitignoreado y NO viaja entre dispositivos ni queda en el repo.** Si en una sesión nueva `npx expo start --web` tira `Uncaught Error: supabaseKey is required`, hay que recrear `.env` a mano. La URL es `https://vecnktrbjolahcalkbml.supabase.co`; la anon key se puede pedir con la tool de Supabase MCP `get_publishable_keys` (`project_id: vecnktrbjolahcalkbml`) — devuelve tanto la legacy anon key (JWT) como la nueva `sb_publishable_...`, cualquiera de las dos sirve como `EXPO_PUBLIC_SUPABASE_ANON_KEY`. También hay que correr `npm install --legacy-peer-deps` si `node_modules` no está (pasó en esta sesión, el entorno era nuevo).

---

## Glosario de dominio

| Término | Significado |
|---|---|
| **outfit** | Unidad de contenido principal — un "look" armado con varias prendas, publicado con imagen de portada |
| **prenda** | Garment individual (remera, pantalón, zapatilla, etc.), pertenece a una marca |
| **slot** | Categoría de posición de una prenda dentro de un outfit: `torso`, `piernas`, `calzado`, `extras` |
| **marca** | Brand — cuenta de Supabase Auth separada de las personales, `perfiles.is_brand = true` |
| **armario** | Wardrobe personal del usuario — prendas que ya tiene, guardadas en `prendas_armario` |
| **guardar / guardado** | Save — bookmarking de un outfit o prenda (no es "like", es para volver a ver/comprar) |
| **talle recomendado** | Size calculado por `get_recommended_size()` en base a `user_measurements` del usuario y el `size_guide` de la prenda |
| **sale_mode** | Modo de venta de una prenda: `direct` (checkout dentro de OPA) o `redirect` (external_url a la tienda de la marca) |

---

## Documentación interna

Los documentos de referencia viven en `.claude/documents/`:

| Archivo | Contenido |
|---|---|
| `frontend-2026-06-06-screens-and-components.md` | Pantallas, componentes, design tokens |
| `backend-2026-06-06-supabase-integration.md` | Auth flow, hooks, tipos TypeScript |
| `backend-2026-06-15-api-layer.md` | Endpoints de la API Hono, estado de implementación |
| `database-2026-06-06-schema-and-seed.md` | Schema completo, migraciones, seed data |
| `design-2026-06-06-visual-system.md` | Sistema visual |
| `product-2026-06-10-brand-system.md` | Modelo de marcas: onboarding, verificación, monetización |
| `meta-2026-06-10-pending-features.md` | **Fuente de verdad de pendientes** — actualizar cuando se implementa algo |
| `_archive/` | Documentos obsoletos del modelo multi-chat anterior — solo referencia histórica, no seguir sus instrucciones |

**Regla:** cuando se completa un pendiente, eliminarlo de `pending-features.md` y marcarlo como hecho en el documento de la capa correspondiente. Al terminar una sesión, si hiciste un cambio relevante, actualizá el doc correspondiente y este `CLAUDE.md` antes de irte — la próxima sesión no va a tener otra forma de saberlo.

---

## Estado actual

**Resumen en prosa (2026-07-03):** la app mobile tiene el flujo principal completo y funcional contra Supabase real — auth, home, outfit scroll estilo TikTok, perfil, búsqueda, armario, detalle de outfit y de prenda con guía de talles, y "Mis medidas". Settings tiene logout, borrado de cuenta, acceso a medidas y el formulario de "Registrar Marca" (que solo inserta una solicitud en `brand_applications`, todavía no crea la cuenta de marca — eso lo hace `opa-admin` a futuro). La API en Hono está desplegada y sin 501s pendientes. **La separación de `opa-backend` ya se completó**: se verificó que el código de `opa-backend` es autosuficiente (redeploy de la Edge Function `api` en producción desde ese repo, health check OK, app mobile probada end-to-end contra Supabase sin `backend/` local) y la carpeta `backend/` se eliminó de este repo el 2026-07-03. De paso se encontró y arregló un bug en el rate-limiter (`app.use('/orders/POST', ...)` no matchea ningún path real, se corrigió a un middleware `'*'` que chequea método+path) y se reconstruyó una migración RLS (`rls_policies_cart_orders_reviews_wardrobe`) que estaba aplicada en la DB pero faltaba en el historial de git de ambos repos — ambos fixes están commiteados en `opa-backend`. Lo que falta es sobre todo features de producto avanzadas (ver Pendientes) y las sub-pantallas de Settings que no son core. También se agregó `app/user/[id].tsx` (2026-07-03): antes de esto no existía ninguna forma de ver el perfil de otro usuario en la app — tocar un creador en cualquier lugar saltaba directo a su scroll de outfits. Se construyó reusando hooks ya existentes (`useProfile`, `useOutfits`, `useFollow`) y se dejaron fuera de alcance, a pedido explícito, las conexiones mutuas y la campanita de notificaciones del botón Seguir (ninguna tenía precedente en el código).

- [x] Setup + design tokens + BottomNavBar custom
- [x] Home screen con carousels horizontales
- [x] Outfit Scroll TikTok-style (like/save/follow funcionales)
- [x] Profile screen (header horizontal, 3 tabs, sub-tabs favoritos)
- [x] user-outfits.tsx y saved-outfits.tsx
- [x] Auth screen con validación por campo en tiempo real
- [x] Settings screen (logout, eliminar cuenta)
- [x] Deep-link Home → Outfit Scroll con scroll al índice correcto
- [x] Supabase Auth funcional (signup, login, logout)
- [x] Hooks: useLike, useSave, useFollow, useSavedOutfits, useSavedGarments
- [x] Sistema de guías de talle (tablas + hooks useSizeGuide, useUserMeasurements, useRecommendedSize)
- [x] API Hono: todos los endpoints implementados (sin 501s pendientes)
- [x] `prendas_guardadas` en DB con RLS
- [x] `app/product/[id].tsx` — detalle de prenda con imagen, selector de talle, SizeGuideSheet, CTA
- [x] `app/outfit/[id].tsx` — detalle de outfit con prendas por slot, precio total, CTA
- [x] `app/(tabs)/search.tsx` — búsqueda funcional: texto + tabs + tag filters
- [x] `app/(tabs)/wardrobe.tsx` — armario con datos reales, filtro por slot
- [x] `app/measurements.tsx` — pantalla "Mis medidas", accesible desde Settings
- [x] Settings → botón "Registrar Marca" + form de solicitud (inserta en `brand_applications`)
- [x] Fuente Merge One en `assets/fonts/MergeOne-Regular.ttf` — cargada en `_layout.tsx`
- [x] Extracción de `backend/` a `maxibernardoni/opa-backend` — confirmado independiente y `backend/` eliminado de este repo (2026-07-03)
- [x] `app/user/[id].tsx` — perfil de lectura de otro usuario (gap real que no existía: antes solo se podía ver el perfil propio). Reusa `useProfile`, `useOutfits`, `useFollow`. Actualizados 3 puntos de entrada para navegar acá en vez de saltar directo al scroll de outfits (2026-07-03). Pulido en una segunda vuelta el mismo día: flecha de volver (`flecha.png`) y compartir (`compartir.png`) con assets reales de Storage en vez de texto/emoji, ícono de grid centrado en la tab bar, y bottom navbar agregada (esta pantalla está fuera del `Tabs` navigator, así que se armó una versión standalone calcada de `BottomNavBar` con "perfil" marcado como activo)
- [x] `app/marca/[id].tsx` — perfil público de marca "ajeno" (2026-07-06). Construido a spec del doc de brand-system: banner (reusa `logo_url`, no hay columna de cover), avatar-logo circular, nombre en mayúscula + badge `verificado_ondas.png` si `marcas.verified`, `@handle · Marca`, bio, tags, banner contextual "Ya lo tenés" (cruza `useWardrobe` con `garment.brand_id`), stats Seguidores/Outfits/Prendas, botón Seguir, tabs icon-only Grid (outfits) / Catálogo (prendas → `product/[id]`). Hook nuevo `useBrand`. Enganchado desde el slider "Marcas" del home y la fila de marca en el detalle de prenda. Verificado con `tsc` (sin errores nuevos) y compilando el bundle web de Metro (ruta incluida, 200). **Limitación conocida:** todas las `marcas` tienen `profile_id = null` (falta onboarding de cuentas de marca), así que Outfits/Seguidores quedan vacíos y Seguir es inerte para las marcas actuales; el catálogo sí trae datos reales. Se agregó `verified: boolean` al tipo `Brand` en `types/index.ts`

- [x] **Marco mobile + responsive en web (2026-07-06):** en web, si la ventana es más ancha que un teléfono, la app se encuadra en una columna centrada de 393px (iPhone 16 Pro) sobre fondo gris; en móvil / Chrome responsive ocupa todo el ancho. Nuevo `components/layout/MobileFrame.tsx` (wrapper en `app/_layout.tsx`) + `constants/layout.ts` (`APP_WIDTH`/`APP_MAX_WIDTH`). Se migraron todas las lecturas de ancho (`Dimensions.get('window').width`) a `APP_WIDTH` en las ~11 pantallas/componentes que las usaban; la altura sigue leyéndose de `Dimensions` (el marco es 100% de alto). Verificado por inspección de DOM en el preview web (marco 393×800 centrado en desktop; a 375px el marco desaparece y el root ocupa 375px). Ver "Decisiones técnicas críticas".
- [x] **Camión del outfit scroll era emoji 🚚 (2026-07-06):** `app/(tabs)/outfits.tsx` usaba el emoji en el header flotante en vez de la imagen `assets/camion_blanco.png` de Storage (el home ya la usaba bien). Reemplazado por `<Image>` 26×26 — verificado que carga 200 en el preview. Coincide con el spec del design doc ("Do NOT use 🚚 emoji").

## Pendientes principales

- [ ] **Diferencias web ↔ prototipo del header del outfit scroll, detectadas 2026-07-06 pero NO aplicadas (esperan decisión del usuario, son cambios visuales/UX):** (1) el prototipo muestra un **subrayado rosa (2px `rosaOpa`) bajo la tab activa** ("Descubrir") — la web solo cambia color/peso, sin subrayado; el design doc sí lo pide (línea ~141 de `design-2026-06-06-visual-system.md`). (2) La web tiene un **pill oscuro (`rgba(0,0,0,0.4)`, `borderRadius:20`) detrás de las tabs** "tus marcas / Descubrir"; en el prototipo son texto plano sobre la foto, sin pill. Ambos están en `app/(tabs)/outfits.tsx` (`styles.tabs`, `styles.tabActive`). Preguntar al usuario antes de tocar — se le consultó y todavía no respondió cuál prefiere. Puede haber más diferencias web↔prototipo que el usuario vaya señalando.
- [ ] Arreglar orden de middlewares en `opa-backend/functions/api/index.ts`: el rate-limiter de `POST /orders` corre antes que `authMiddleware`, así que `c.get('user')` está vacío y el límite nunca se aplica (bug preexistente, no bloqueante)
- [ ] Settings sub-screens: editar perfil, seguridad, notificaciones, preferencias de estilo
- [ ] Replicar este formato de `CLAUDE.md` (secciones "Cómo trabajar conmigo", mapa de repos, valores, glosario, snapshot en prosa) en `opa-admin` y a futuro en `opa-backend` / `opa-web`

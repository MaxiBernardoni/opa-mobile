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

La infraestructura de backend (Supabase + Edge Functions + Hono API) vive en el repo separado `opa-organization/opa-backend` — ya no está en este repo. Ver "Mapa de repos" abajo.

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
| `opa-admin` (`opa-organization/opa-admin`) | Next.js 14 + Tailwind (sin shadcn CLI instalado, pese al stack declarado) | Panel interno del equipo OPA (moderación, aprobar marcas, KPIs) — NO es para marcas ni usuarios finales | **Funcional localmente contra Supabase real** (confirmado 2026-08-03 leyendo el repo clonado en `C:\Users\devandroid\opa-admin`): login, auth gate por `is_admin`, dashboard, gestión de usuarios y marcas, moderación de outfits/prendas/reseñas. Sin deploy en Vercel. Falta: pantalla de solicitudes de marca (`brand_applications` sin UI), estadísticas por marca/ventas, paginación |
| `opa-web` | Next.js (planeado) | Panel de gestión para marcas (analytics, stock, pedidos) — para uso desde desktop | No iniciado — crear directo bajo `opa-organization` |

Todos comparten el mismo proyecto Supabase (`vecnktrbjolahcalkbml`) y el mismo schema en español.

### Organización de GitHub (2026-07-03)

Los 4 repos de OPA se agrupan bajo la organización **`opa-organization`** en GitHub (antes estaban sueltos bajo la cuenta personal `MaxiBernardoni`).

- ✅ `opa-mobile` y `opa-backend` — transferidos y confirmados (2026-07-03, re-verificado 2026-08-03): `git remote -v` en ambos apunta a `github.com/opa-organization/...`, y funcionan (push/fetch probados).
- ✅ `opa-admin` — transferido a `opa-organization/opa-admin`, confirmado por el usuario (2026-08-03). No se re-verificó con `git remote -v` en esta sesión (el repo no está clonado acá); el usuario lo va a clonar para una próxima sesión, ahí conviene revisar también el estado real del código (si ya tiene el scaffolding de Next.js o sigue vacío).
- `opa-web` todavía no existe — es un pendiente a futuro, deliberadamente pospuesto (2026-08-03). Cuando se cree, crearlo directamente bajo `opa-organization`, no bajo la cuenta personal.

**Nota sobre el método:** para mover un repo ya existente a una org se usa **Settings → Danger Zone → Transfer** (traspaso nativo de GitHub, sin clonar, sin pedir tokens) — no la opción "Import a repository" (esa clona por HTTPS y falla con `Invalid username or token` porque GitHub no soporta auth por password en operaciones git).

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
admin_impersonation_log — auditoría de "login como marca" desde opa-admin (admin_profile_id, brand_id, brand_profile_id, created_at); RLS activado sin policies, solo accesible vía service role
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
  impersonate.tsx     — pantalla receptora del "login como marca" generado desde opa-admin (ver abajo). Solo web
```

**Flujo de auth:** `_layout.tsx` llama `supabase.auth.getSession()` + `onAuthStateChange()` → popula `useAuthStore` (session + profile). `initialized` previene flashes de UI.

**Login como marca sin password (2026-08-03):** desde `opa-admin` (ficha de marca → botón "Iniciar sesión como esta marca"), un admin puede abrir una pestaña ya logueado como el auth user de esa marca, sin conocer su contraseña — pensado para poder reproducir/depurar cualquier problema que reporte una marca. Mecanismo: `opa-admin` llama `supabase.auth.admin.generateLink({ type: 'magiclink', ... })` con la service_role key (server-side), abre el link resultante en una pestaña nueva; Supabase verifica y redirige a `{NEXT_PUBLIC_MOBILE_APP_URL}/impersonate#access_token=...&refresh_token=...`. `app/impersonate.tsx` acá lee esos tokens del hash (no de `detectSessionInUrl`, que sigue en `false`), llama `supabase.auth.setSession()`, y redirige a `/(tabs)/profile` (que ya hace `<Redirect>` a `/marca/[id]` si `is_brand`). Solo pensado para uso interno vía la build web — no tiene sentido en nativo (deep linking sería otro proyecto). Queda auditado en `admin_impersonation_log` (tabla nueva en Supabase, sin policies públicas — solo accesible vía service role) con quién impersonó a qué marca y cuándo. Detalle de testing: si probás pegando manualmente una URL con hash en una pestaña que ya tenía la app abierta (SPA navigation), el efecto de `impersonate.tsx` puede no re-ejecutarse porque el router no remonta el componente solo por un cambio de hash — en uso real esto no pasa porque el magic link siempre abre una pestaña/carga nueva (full page load), que sí remonta.

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
- [x] Extracción de `backend/` a `opa-organization/opa-backend` — confirmado independiente y `backend/` eliminado de este repo (2026-07-03)
- [x] `app/user/[id].tsx` — perfil de lectura de otro usuario (gap real que no existía: antes solo se podía ver el perfil propio). Reusa `useProfile`, `useOutfits`, `useFollow`. Actualizados 3 puntos de entrada para navegar acá en vez de saltar directo al scroll de outfits (2026-07-03). Pulido en una segunda vuelta el mismo día: flecha de volver (`flecha.png`) y compartir (`compartir.png`) con assets reales de Storage en vez de texto/emoji, ícono de grid centrado en la tab bar, y bottom navbar agregada (esta pantalla está fuera del `Tabs` navigator, así que se armó una versión standalone calcada de `BottomNavBar` con "perfil" marcado como activo)
- [x] `app/marca/[id].tsx` — perfil público de marca "ajeno" (2026-07-06). Construido a spec del doc de brand-system: banner (reusa `logo_url`, no hay columna de cover), avatar-logo circular, nombre en mayúscula + badge `verificado_ondas.png` si `marcas.verified`, `@handle · Marca`, bio, tags, banner contextual "Ya lo tenés" (cruza `useWardrobe` con `garment.brand_id`), stats Seguidores/Outfits/Prendas, botón Seguir, tabs icon-only Grid (outfits) / Catálogo (prendas → `product/[id]`). Hook nuevo `useBrand`. Enganchado desde el slider "Marcas" del home y la fila de marca en el detalle de prenda. Verificado con `tsc` (sin errores nuevos) y compilando el bundle web de Metro (ruta incluida, 200). **Limitación conocida:** todas las `marcas` tienen `profile_id = null` (falta onboarding de cuentas de marca), así que Outfits/Seguidores quedan vacíos y Seguir es inerte para las marcas actuales; el catálogo sí trae datos reales. Se agregó `verified: boolean` al tipo `Brand` en `types/index.ts`

- [x] **Marco mobile + responsive en web (2026-07-06):** en web, si la ventana es más ancha que un teléfono, la app se encuadra en una columna centrada de 393px (iPhone 16 Pro) sobre fondo gris; en móvil / Chrome responsive ocupa todo el ancho. Nuevo `components/layout/MobileFrame.tsx` (wrapper en `app/_layout.tsx`) + `constants/layout.ts` (`APP_WIDTH`/`APP_MAX_WIDTH`). Se migraron todas las lecturas de ancho (`Dimensions.get('window').width`) a `APP_WIDTH` en las ~11 pantallas/componentes que las usaban; la altura sigue leyéndose de `Dimensions` (el marco es 100% de alto). Verificado por inspección de DOM en el preview web (marco 393×800 centrado en desktop; a 375px el marco desaparece y el root ocupa 375px). Ver "Decisiones técnicas críticas".
- [x] **Camión del outfit scroll era emoji 🚚 (2026-07-06):** `app/(tabs)/outfits.tsx` usaba el emoji en el header flotante en vez de la imagen `assets/camion_blanco.png` de Storage (el home ya la usaba bien). Reemplazado por `<Image>` 26×26 — verificado que carga 200 en el preview. Coincide con el spec del design doc ("Do NOT use 🚚 emoji").
- [x] **Outfit scroll alineado al prototipo (2026-07-06):** cuatro correcciones visuales en `app/(tabs)/outfits.tsx` + `components/outfit/OutfitScrollItem.tsx`: (1) **subrayado rosa** de 2px `rosaOpa` bajo la tab activa (implementado como `View` bajo el texto, no border del texto); (2) **pill oscuro removido** de las tabs — ahora texto plano sobre la foto (el usuario eligió match-prototipo por sobre la spec vieja del doc, que pedía `rgba(0,0,0,0.4)`; design doc actualizado); (3) **contadores numéricos eliminados** de like/save (el doc ya decía "NO numeric counters"); (4) **ícono de compartir real** `compartir.png` con `tintColor` blanco en vez de la flecha `↗` de texto; y "Total look" → "Precio total" en la barra inferior. Verificado por DOM en preview web (underline rosa 2px presente, pill ausente, 7 imgs `compartir.png` con tint SVG). Lo que NO se hizo por falta de datos/backend quedó en Pendientes (líneas conectoras, badge de descuento, footer de marca).
- [x] **Barra de precio del outfit scroll se cortaba / quedaba tapada por la tab bar (2026-07-06):** cada item medía `SH = Dimensions.get('window').height` (alto completo de ventana), pero la `BottomNavBar` se dibuja ENCIMA del contenido (no reserva espacio), así que la barra de precio (`bottom:0`) caía detrás de la nav — solo asomaba "PRECIO TOTAL" y el precio + botón "Ver outfit" quedaban tapados (síntoma reportado: "solo se ve al bajar y volver a subir"). **Fix:** en `app/(tabs)/outfits.tsx` se calcula `pageH = SH - tabBarHeight` (con `tabBarHeight = 8 + 48 + (insets.bottom||8) + 1`, replicando el alto real de `BottomNavBar`) y se usa para `snapToInterval`, `getItemLayout` y el alto del item (`OutfitScrollItem` ahora recibe prop `height`). Así cada página mide el área visible sobre la nav y la barra queda pegada arriba de ella. Verificado por DOM (barra blanca 393px de ancho, borde inferior en y=655 = arranque de la nav, botón "Ver outfit" visible sin scrollear). **Nota:** el screenshot del preview timeouteaba con las imágenes full-screen cargadas (la captura, no el render — el `eval` respondía normal), se verificó todo por medición de DOM. De paso se agregó el **ícono de bolsa rosa** (`bag_rosa.png`, ya existía en Storage, lo usa `marca/[id].tsx`) a la izquierda del precio en contenedor `rosaOpaLight`, como pide el design doc.
- [x] **Outfit scroll: quitar banda oscura del fondo + iconos de acción al estilo prototipo (2026-07-13):** dos ajustes de fidelidad en `components/outfit/OutfitScrollItem.tsx`. (1) Se **eliminó el `gradientOverlay`** (un rectángulo de 200px `rgba(0,0,0,0.35)` sobre la foto que, encima de fotos oscuras, se veía como una banda negra sólida en la zona del creador + barra de precio) — ahora la foto es full-bleed y la barra flota limpia sobre ella, como el prototipo. (2) **Botones de acción** (like/save/share): se removió el **círculo blanco de fondo** (y su sombra) — ahora son iconos blancos (`♥/♡ ★/☆` y `compartir.png` con `tintColor` blanco) directamente sobre la foto, con `textShadow`/shadow sutil para legibilidad, más grandes y espaciados (34×34, gap 20). Verificado por DOM en el preview: 0 overlays `rgba(0,0,0,0.35)`, glifos con `color:white` y `parentBg:transparent`. La legibilidad del nombre del creador (texto blanco sin overlay) quedó bien sobre las fotos actuales; si aparece una foto muy clara donde no se lea, evaluar un gradiente real (transparente→oscuro) en vez del rectángulo plano que se quitó.
- [x] **Barra de precio no aparecía al pasar de outfit en web (2026-07-13):** síntoma reportado — al bajar al siguiente outfit no se veía el precio, y para verlo había que bajar y volver a subir. **Causa raíz:** el viewport del `FlatList` en `app/(tabs)/outfits.tsx` medía el alto completo del contenedor (`flex:1` = `SH`) mientras que cada item medía `pageH = SH - tabBarHeight` (más chico, para dejar lugar a la nav). Ese desajuste viewport≠item descoloca el snap. **Detalle clave de web:** en react-native-web 0.21.2 `snapToInterval` es un no-op — el único snap en web lo da `pagingEnabled` (aplica `scroll-snap-type: y mandatory` + `scroll-snap-align: start` por item). Como el viewport era más alto que el item, el snap enganchaba desalineado y la barra (`bottom:12` del item) caía fuera de vista; un re-scroll manual la reacomodaba. **Fix:** se forzó el alto del `FlatList` a `pageH` (`style={{ height: pageH, flexGrow: 0 }}`) para que viewport == item, y se removió el `snapToInterval` redundante (dejando solo `pagingEnabled`, que es lo que funciona en web). Verificado por DOM en el preview a 375×812: el scroller mide `clientH=747=pageH` (`scrollH=5229=7×747`), y en el 2º outfit la barra "Precio total"/"Ver outfit" queda en y≈680–711 dentro del viewport de 747 (por encima de la nav). **Nota:** `SH` sigue siendo un `Dimensions.get('window').height` a nivel de módulo (no se recalcula en un resize en vivo de la ventana web) — no es el bug reportado, pero si en el futuro aparece un desajuste tras redimensionar la ventana, es por acá.
- [x] **Login de vendedor/marca + perfil propio de marca (2026-07-13):** ahora existe una cuenta de marca real que puede iniciar sesión y ver su propio perfil de marca. Se reutilizó la marca existente **Revés** (`220cc733-dd7c-4f4f-912d-72d465e1196e`, 7 prendas reales) en vez de crear una vacía. La cuenta Auth se creó **a mano vía SQL** (INSERT en `auth.users` con `extensions.crypt(...)` para el hash del password, tokens en `''`, email confirmado) porque no hay endpoint de admin/onboarding todavía; el trigger `handle_new_user` creó `perfiles` y después se seteó `perfiles.is_brand=true` + `marcas.profile_id`. **Credenciales de prueba: `reves@opa.com` / `reves1234`** (son seed/demo, no una cuenta personal — el password lo elegí yo para testing). Frontend: hook nuevo `hooks/useMyBrand.ts`; `app/(tabs)/profile.tsx` hace `<Redirect>` a `/marca/[id]` cuando `profile.is_brand`; `app/marca/[id].tsx` ganó un modo `isOwn` (`brand.profile_id === session.user.id`): engranaje de configuración (→ `/settings`, ahí está el logout) en vez de compartir/menú, sin botón "Seguir", y el tab "perfil" de la navbar activo. **Verificado a nivel DB** (hash de password válido — GoTrue valida exactamente así —, rol/confirmado/tokens OK, marca↔perfil↔7 prendas vinculados) y con `tsc`. **NO se verificó el render en browser** esta sesión: el dev server de Expo no se mantenía vivo en este entorno (requests del bundle daban `ERR_CONNECTION_REFUSED`, y hubo fallas de spawn de procesos — PowerShell tiraba `uv_spawn`). Detalle: Revés ahora tiene `profile_id` real, así que su grilla de Outfits / Seguidores / Seguir están vivos pero leen 0 (no tiene outfits ni followers en seed); las **otras** marcas siguen con `profile_id = NULL`. Pendientes derivados (ver pending-features): bloquear like/save/follow para cuentas de marca, y switcher multi-cuenta personal⇄marca.
- [x] **`app/impersonate.tsx` — receptor del login-como-marca sin password (2026-08-03):** nueva feature en `opa-admin` (ver `opa-admin/CLAUDE.md`) que permite a un admin abrir la app logueado como cualquier marca con cuenta vinculada, sin conocer su contraseña, para poder reproducir/depurar problemas que reporte esa marca. Este repo solo aporta la pantalla receptora: lee `access_token`/`refresh_token` del hash de la URL (el link lo genera `opa-admin` vía `supabase.auth.admin.generateLink`), llama `supabase.auth.setSession()`, y redirige a `/(tabs)/profile` (que ya resuelve a `/marca/[id]` si `is_brand`). Probado end-to-end contra Supabase real con la cuenta de **Revés** (en ese momento única marca con `profile_id`; ver bullet siguiente — ya no es la única): el link generado aterrizó correctamente en su perfil propio. Auditado en la tabla `admin_impersonation_log` (Supabase, sin policies públicas). Ver detalle completo en la nota "Login como marca sin password" más arriba (sección Arquitectura del código).
- [x] **Cuentas de login para el resto de las marcas con catálogo cargado (2026-08-03):** de las 7 `marcas` seed, solo Revés tenía cuenta de Auth (ver bullet 2026-07-13 arriba). Se repitió el mismo mecanismo manual (INSERT en `auth.users` con `extensions.crypt(...)`, trigger `handle_new_user` crea `perfiles`, luego `UPDATE perfiles SET is_brand=true` + `marcas.profile_id`) para las 3 marcas que ya tienen prendas reales cargadas: **Capas** (`capas@opa.com` / `capas1234`, 4 prendas), **Forma** (`forma@opa.com` / `forma1234`, 7 prendas), **Sole** (`sole@opa.com` / `sole1234`, 7 prendas) — mismo patrón de credenciales que Revés, son seed/demo. **Batuk, Doble V y Midway quedaron sin cuenta a propósito** (0 prendas cargadas cada una — un perfil propio se vería vacío igual que el catálogo; decisión del usuario, no una limitación técnica). A diferencia de la sesión anterior, esta vez **sí se verificó el render en browser**: se conectó al preview (`preview_start` con `{url: "http://localhost:8090"}`, reusando un dev server que ya estaba corriendo desde otra sesión/chat) y se hizo login real con `capas@opa.com` — redirige a `/marca/[id]` propio (nombre, bio, tags, stats reales, sin botón "Seguir"), y `/settings` muestra la cuenta de Capas correctamente. Se cerró sesión al terminar para no dejar el navegador logueado en un dev server compartido con otra sesión. Con esto, 4 de las 7 marcas (Revés, Capas, Forma, Sole) tienen login funcional; las otras 3 quedan pendientes de si en el futuro cargan prendas.
- [x] **Segunda pasada de fidelidad al prototipo del outfit scroll (2026-07-06):** cinco ajustes más señalados por el usuario sobre una captura. En `app/(tabs)/outfits.tsx`: (1) **separador "/" eliminado** entre "tus marcas" y "Descubrir" (el prototipo no lo tiene); (2) **círculo del botón "+" removido** (queda el signo fino, `fontSize:28 weight:300`, sin borde). En `components/outfit/OutfitScrollItem.tsx`: (3) **líneas conectoras** chip→prenda con forma de codo (segmento horizontal + diagonal, `View`s rotados con `transformOrigin`) terminando en un punto blanco (`connLine`/`connDot`). **Cómo se resolvió sin coords en la DB:** el ancla de cada prenda se deriva de su `slot` (`SLOT_ANCHOR`: extras/torso/piernas/calzado → fracción x/y sobre la figura), los chips se ordenan por slot y se separan verticalmente para no solaparse (anti-overlap con `lastBottom`). No es pixel-perfect por prenda (es aproximación por slot) pero da el look desestructurado del prototipo. Chips angostados a 118px para que la línea tenga largo visible; (4) **like/favorito/compartir** subidos a ~40% del alto y con **fondo blanco circular** 44px (iconos oscuros, share `compartir.png` con `tintColor:negro`); (5) **barra de precio flotante** (`left/right/bottom:12`, `borderRadius` en las 4 esquinas) en vez de pegada al fondo. Verificado por screenshot + medición DOM a 375×812 (líneas 39–87px con codo, 3 círculos apilados a la derecha, barra flotante con gap 12px sobre la nav, "Ver outfit" visible). **Gotcha del preview:** el preview headless renderiza la app a ancho 0 hasta que se fuerza un viewport con `preview_resize` (preset mobile 375×812) — sin eso, `getBoundingClientRect`/`innerWidth` dan 0 y el screenshot timeoutea. Con el viewport seteado, todo funciona.
- [x] **Tab "Armario" reemplazado por "Catálogo" para cuentas de marca (2026-08-07):** a pedido del usuario, una cuenta de marca (`profile.is_brand`) ya no tiene sentido con un armario personal — en su lugar ve su propio inventario. Mismo tab/ruta (`wardrobe`), rama por tipo de cuenta: `components/navigation/BottomNavBar.tsx` muestra `bag_negra.png`/`bag_rosa.png` en vez de `armario.png`/`armario_rosa.png` cuando `useAuthStore().profile.is_brand` es true; `app/(tabs)/wardrobe.tsx` renderiza `BrandCatalogView` en vez de `PersonalWardrobeView`. La nueva vista tiene dos sub-tabs (decisión del usuario: sub-tabs en vez de todo apilado) — **Prendas**: grid con `useMyBrand()` + `useBrand()` (mismos hooks que `marca/[id].tsx`), mostrando **stock total sumado** por prenda (decisión del usuario: total, no desglose por talle) vía el campo `stock_por_talle` (jsonb) que ya existía en la DB pero le faltaba al tipo `Garment` — se agregó (`types/index.ts` + doc de integración). **Outfits**: grid de outfits creados por esa marca (mismo dato que ya mostraba `marca/[id].tsx` en modo propio, ahora también accesible desde este tab). Solo lectura — no hay pantalla de edición de prendas en esta app (eso es `opa-web`, sin iniciar). Verificado con `tsc` (sin errores nuevos) y en el preview web logueado como **Capas** (`capas@opa.com`): navbar muestra `bag_rosa.png` activo / `bag_negra.png` inactivo, tab Prendas muestra 4 prendas con "50 en stock" cada una, tab Outfits muestra el empty state correcto (0 outfits, Capas no tiene ninguno creado). Confirmado que una cuenta normal / sesión anónima sigue viendo el armario de siempre sin cambios. Detalle en `.claude/documents/frontend-2026-06-06-screens-and-components.md` (secciones Wardrobe y BottomNavBar).

## Pendientes principales

- [ ] **Diferencias web ↔ prototipo del outfit scroll BLOQUEADAS por falta de datos/backend (2026-07-06):** (1) **Precisión de las líneas conectoras**: ya están implementadas pero el ancla es aproximada **por slot** (todas las prendas de un mismo slot apuntan al mismo punto). Para que cada prenda apunte a su lugar exacto haría falta agregar columnas `position_x/position_y` a `outfit_items` (+ un editor de posición); `constants/mockData.ts` ya tiene coords mock que nunca se volcaron a la DB. (2) **Badge de descuento "X% OFF / Ahorrás $Y"** en la barra de precio: no hay campo de descuento en `Outfit` ni `Garment`; el doc lo pide condicional a `discount_percent > 0` pero ese dato no existe. (3) **Pie con marca (logo + nombre + verificado) en vez de creador**: las `marcas` tienen `profile_id = null` (falta onboarding de cuentas de marca), así que el scroll muestra outfits de usuarios; el footer seguirá mostrando el creador hasta que exista ese onboarding.
- [ ] Arreglar orden de middlewares en `opa-backend/functions/api/index.ts`: el rate-limiter de `POST /orders` corre antes que `authMiddleware`, así que `c.get('user')` está vacío y el límite nunca se aplica (bug preexistente, no bloqueante)
- [ ] Settings sub-screens: editar perfil, seguridad, notificaciones, preferencias de estilo
- [x] **Revisión y actualización de `.claude/documents/` (2026-08-03):** los 5 docs de capa que habían quedado atrás de varias sesiones de código (varios fechados 2026-06-06/09 sin tocar desde entonces) se pusieron al día contra el código real: `backend-2026-06-15-api-layer.md` y `backend-2026-06-06-supabase-integration.md` (referencia de repo `maxibernardoni/opa-backend` → `opa-organization/opa-backend`, párrafo contradictorio sobre `delete_user()` no creada — sí existe, tipos TS desactualizados, hooks `useBrand`/`useMyBrand` faltantes), `database-2026-06-06-schema-and-seed.md` (faltaban 2 migraciones en la tabla, 4to perfil seed de la cuenta de marca Revés), `frontend-2026-06-06-screens-and-components.md` (no mencionaba `app/marca/[id].tsx`, el login de marca, `MobileFrame.tsx`/`constants/layout.ts`, ni ninguno de los ajustes de fidelidad al prototipo del outfit scroll de julio) y `design-2026-06-06-visual-system.md` (líneas conectoras seguían documentadas como `position_x/position_y` cuando la implementación real usa anclas por `slot`, tamaños de botones de acción viejos, inventario de assets incompleto). También se recreó `.env` (URL + anon key vía Supabase MCP `get_publishable_keys`) porque no viaja entre sesiones. **No se tocó código**, solo documentación — si algo de esto se contradice con lo que ves en el código, el código manda (ver Gotchas de proceso).
- [ ] Replicar este formato de `CLAUDE.md` (secciones "Cómo trabajar conmigo", mapa de repos, valores, glosario, snapshot en prosa) en `opa-admin` y a futuro en `opa-backend` / `opa-web`
- [x] **`opa-admin` confirmado como panel funcional, no "sin iniciar" (2026-08-03):** se clonó el repo (`C:\Users\devandroid\opa-admin`) y se verificó directamente (file tree, `git log`, `git remote -v`) que ya cubre login, auth gate por `is_admin`, dashboard, gestión de usuarios y marcas, y moderación de outfits/prendas/reseñas — corriendo local contra Supabase real, sin deploy. Se corrigieron `meta-2026-06-10-pending-features.md`, `product-2026-06-15-admin-panel.md` y este archivo, que decían "no iniciado"/"en desarrollo inicial". El único gap real de Brand Management es la pantalla de solicitudes (`brand_applications` sin UI). De paso se corrigió el mismo error en `opa-admin/CLAUDE.md` (`maxibernardoni/opa-backend` → `opa-organization/opa-backend`, estado de deploy independiente).
- [x] **DB: `size_guide_id` asignado a las 25 prendas seed + columna `foot_length` en `user_measurements` (2026-08-03):** ver detalle en `meta-2026-06-10-pending-features.md` → Database → General. Quedaron sin resolver, a la espera de una decisión del usuario: restaurar `size`/`color`/`source` en `prendas_armario` (sin consumidor todavía, no hay flujo de compra) y agregar `position_x`/`position_y` a `outfit_items` (requiere además ubicar cada prenda a mano sobre la foto de cada uno de los 7 outfits reales, no es solo la migración).
- [ ] **⚠️ Migración/tabla `admin_impersonation_log` sin documentar, encontrada 2026-08-03** — aplicada en producción el mismo día (versión `20260803115219`), antes del trabajo de esta sesión. Tabla de auditoría (`admin_profile_id`, `brand_id`, `brand_profile_id`, `created_at`), RLS sin policies (solo `service_role`). Pinta a una feature de "un admin impersona una cuenta de marca" hecha en alguna sesión de `opa-admin` no sincronizada a ningún doc. No se tocó. **Antes de asumir qué es, confirmalo** — ver nota completa en `database-2026-06-06-schema-and-seed.md`.
- [x] **Paginación cursor-based en `useOutfits` (2026-08-10):** reemplaza el `LIMIT 20` fijo por un cursor keyset sobre `(created_at, id)` — `id` hace falta como desempate porque varios outfits seed comparten el mismo `created_at` exacto (mismo INSERT), y un cursor solo con `created_at` saltea/duplica filas en ese borde (verificado con SQL directo antes de tocar el hook). Nueva forma del hook: `{ outfits, loading, loadingMore, hasMore, error, loadMore, refetch }`. Conectado a `onEndReached` en los dos scrolls verticales tipo TikTok (`app/(tabs)/outfits.tsx`, `app/user-outfits.tsx`); las grillas más chicas (perfil, `user/[id].tsx`, carousel de home) siguen mostrando solo la primera página — no era el caso de uso que motivaba el pendiente. Verificado en browser bajando `PAGE_SIZE` a 3 temporalmente: 3 páginas trajeron los 7 outfits seed sin duplicados ni saltos, después se repuso a 10.
- [x] **Edge Functions server-side para like/save + rate limiting real (2026-08-10):** el más grande de los 4 pendientes de backend de esta sesión. Nuevo `opa-backend/functions/api/routes/social.ts` — `POST/DELETE /api/outfits/:id/like` y `.../save`, idempotentes, con rate limiting (60 req/60s por usuario) y bloqueo server-side de cuentas de marca (RLS solo chequeaba `user_id = auth.uid()`, no `is_brand` — el bloqueo de like/save de marca de antes era puramente cosmético en el cliente). `opa-mobile` gana `lib/api.ts` — **primera vez que esta app llama a la API Hono**; todo lo demás (incluido el chequeo de estado inicial liked/saved) sigue yendo directo a Supabase. `hooks/useLike.ts`/`useSave.ts` actualizados para llamar la API en el toggle. **Dos bugs de plataforma reales encontrados y arreglados en el camino** (no bugs de mi código nuevo — del rate limiter preexistente, que nunca había funcionado de verdad pese a estar "implementado"): (1) el rate limiter corría antes que `authMiddleware`, bug ya documentado pero nunca arreglado — se resolvió montándolo por grupo de rutas, después del auth de ese grupo; (2) incluso arreglado el orden, seguía sin funcionar — confirmé empíricamente que Supabase Edge Functions **no mantienen estado de módulo entre invocaciones** (un `Map` a nivel de módulo era una instancia nueva en cada request individual, incluso en ráfagas secuenciales rápidas). El plan original era migrar a Deno KV, pero `Deno.openKv()` **no existe** en este runtime (`TypeError: Deno.openKv is not a function`) — terminé armando el rate limiter sobre Postgres (tabla `rate_limits` + función `increment_rate_limit()` con `INSERT ... ON CONFLICT` atómico). Todo verificado con requests HTTP reales (cuentas de prueba descartables vía signup, borradas después): like/unlike/save/unsave idempotentes, bloqueo 403 a cuenta de marca real (`capas@opa.com`), 404 a outfit inexistente, rate limit disparando en la request #4 con `max` bajado a 3 temporalmente para probar, y el flujo completo desde el browser real (signup descartable → like/save en el feed → verificado en la DB → unlike/unsave → cuenta borrada). CORS del API actualizado para incluir `localhost:8090` (antes solo contemplaba `opa-web`, nunca `opa-mobile`). Detalle completo en `backend-2026-06-15-api-layer.md` (secciones Social y Rate Limit Middleware) y `backend-2026-06-06-supabase-integration.md`.
- [x] **Full-text search en outfits y prendas (2026-08-10):** reemplaza el `.ilike()` de `app/(tabs)/search.tsx`, que solo matcheaba `title`/`name` — no encontraba nada buscando por texto de la descripción ni por nombre de marca. Migración `20260810110614_add_full_text_search_outfits_prendas` (Supabase real + `opa-backend/supabase/migrations/`): columna `search_vector tsvector` (config `'spanish'`) + índice GIN en `outfits` (`title`+`description`, columna `GENERATED`) y en `prendas` (`name`+`description`+nombre de marca, mantenida por dos triggers porque el nombre de marca es de otra tabla — uno recalcula al crear/editar la prenda, otro recalcula las prendas de una marca si se le cambia el `name`). Query nueva: `.textSearch('search_vector', query, { type: 'websearch', config: 'spanish' })`. Verificado en browser: buscar "Capas" en Prendas trae sus 4 prendas (ninguna se llama literalmente "Capas"); buscar "vestido" en Outfits trae dos outfits por stemming en español ("un vestido..." y "vestirse bien", misma raíz léxica). De paso se commiteó en `opa-backend` una migración de una sesión anterior (`add_size_color_source_to_prendas_armario`) que había quedado aplicada en Supabase pero sin subir a git.
- [x] **Cuentas de marca sin acceso al feed + switcher multi-cuenta (2026-08-07):** dos pendientes del brand-system resueltos en la misma sesión. (1) **Bloqueo de marca:** a pedido explícito del usuario, el alcance se amplió de "ocultar botones de like/save/follow" a **bloquear el acceso a la sección de feed entera** para cuentas de marca — `app/(tabs)/outfits.tsx` redirige (`<Redirect>`) a `/(tabs)/profile` si `profile.is_brand`, cubriendo tab press + deep-link desde Home + URL directa en un solo lugar; el ícono "outfits" desaparece de `BottomNavBar` y de las navbars standalone de `marca/[id].tsx`/`user/[id].tsx`; el botón Seguir se oculta para viewers de marca en esos mismos dos perfiles; y `OutfitScrollItem` oculta like/save/follow (mantiene compartir) como defensa adicional, porque igual es alcanzable fuera del tab feed vía `user-outfits.tsx`/`saved-outfits.tsx`. (2) **Switcher multi-cuenta:** como no existe ningún vínculo en la DB entre una cuenta personal y una de marca (son usuarios de Auth totalmente separados), se implementó como "cuentas recordadas en este dispositivo" en vez de un switcher estilo Instagram real — decisión confirmada con el usuario antes de programar. Nuevo `lib/rememberedAccounts.ts` guarda `access_token`/`refresh_token` por cuenta (mismo storage que `lib/supabase.ts`, ahora exportado); `app/_layout.tsx` los actualiza en cada `SIGNED_IN`/`TOKEN_REFRESHED` (Supabase rota el refresh_token, así que hay que mantenerlo al día) y los borra en `SIGNED_OUT` (cerrar sesión = "salir de este dispositivo", coherente con el texto ya existente en Settings). Nueva pantalla `app/switch-account.tsx` (accesible desde Settings → "Cambiar de cuenta", ícono `⇄` en texto porque no hay asset para esto en Storage) lista las cuentas guardadas y cambia entre ellas con `supabase.auth.setSession()` — sin contraseña. Todo verificado en el browser real: login Capas → agregar Sole → cambiar Sole↔Capas sin re-auth → logout de Capas la saca del switcher mientras Sole sigue funcionando. `tsc` sin errores nuevos.
- [x] **Tab "tus marcas" del outfit scroll filtra de verdad (2026-08-07):** antes era solo visual (`setTab` sin efecto en la data). Ahora `app/(tabs)/outfits.tsx` filtra el feed a outfits con al menos 1 prenda de una marca que el usuario sigue (criterio elegido por el usuario entre 3 opciones: "al menos 1 prenda" vs. "mayoría" vs. "exclusivo" — se optó por el más laxo porque con solo 4 marcas seguibles hoy, un criterio más estricto hubiera dejado el tab casi siempre vacío). Hallazgo importante: el pendiente decía que esto "requiere extender el sistema de follows a marcas", pero **ya funcionaba** — `marca/[id].tsx` ya sigue marcas a través de la misma tabla `follows` (una marca tiene `perfiles.id` = `marcas.profile_id`, así que `following_id` apunta ahí sin cambios de schema). Nuevo hook `hooks/useFollowedBrandIds.ts`. Estados vacíos agregados para 0 marcas seguidas / 0 outfits con match. Verificado en browser real: login `capas@opa.com`, seguir a Sole (en 7/7 outfits seed) → aparecen 7; dejar de seguir → estado vacío; "Descubrir" sin regresión. Se dejó la sesión de browser sin login al terminar. **Bug de UI encontrado y arreglado (2026-08-07):** el contador "Seguidores" en `marca/[id].tsx` no se actualizaba tras tocar Seguir/Siguiendo. Fix: `useBrand` ahora expone `adjustFollowersCount(delta)` (ajuste optimista, mismo patrón que `useLike`/`useSave`); `marca/[id].tsx` lo llama antes de disparar el toggle real. Verificado en browser (login `sole@opa.com`, follow/unfollow de Capas, contador se actualiza al instante sin remount, sin residuos en `follows`).
- [ ] **Decisión de producto: `position_x`/`position_y` de `outfit_items` no se completan a mano (2026-08-07):** el usuario descartó que hand-placeemos las coordenadas de las 7 prendas/outfits seed. En cambio, la marca va a ubicar cada prenda de forma visual (paso tipo "ubicá esta prenda sobre la foto") al crear/editar una prenda — esa UI todavía no existe, probablemente va a vivir en `opa-web` (repo sin iniciar). Hasta que eso se construya, seguimos sin tocar el schema ni el render de líneas conectoras (`OutfitScrollItem` sigue usando anclas por `slot`). Detalle completo en `meta-2026-06-10-pending-features.md` y `design-2026-06-06-visual-system.md`.
- [x] **DB: columnas `size`/`color`/`source` restauradas en `prendas_armario` (2026-08-07):** el usuario decidió agregarlas ahora aunque todavía no existe flujo de compra que las consuma (antes estaba marcado como pendiente de decisión). Migración `20260807141330_add_size_color_source_to_prendas_armario` aplicada en Supabase real y commiteada en `opa-backend/supabase/migrations/`; las 3 son `varchar` nullable sin constraint. La tabla tenía 0 filas (nadie carga su armario todavía) así que no hubo datos que migrar/poblar. `types/index.ts` (`WardrobeItem`) actualizado para reflejar los campos nuevos. Sin UI ni hook (`useWardrobe`) actualizados todavía — no hay pantalla que edite `size`/`color`/`source` de un ítem del armario.
- [ ] **La tabla de migraciones de `database-2026-06-06-schema-and-seed.md` tenía versiones inventadas** (no las reales aplicadas en la DB) desde que existe el doc — se corrigió comparando contra `list_migrations` real (2026-08-03). Al menos un caso confirmado de drift real (no solo del doc): el archivo local `opa-backend/supabase/migrations/20260629000001_rename_marcas_owner_id_to_profile_id.sql` tiene un prefijo de fecha distinto al que quedó aplicado en la DB (`20260629142025`). No investigado más a fondo — si se necesita reparar el historial de migraciones (`supabase migration repair`) o diffear local vs. remoto, tenerlo en cuenta.

# OPA Mobile

App mobile de descubrimiento de moda centrada en outfits como unidad principal de contenido. Experiencia visual e inmersiva estilo TikTok/Pinterest aplicada a la moda.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React Native + Expo SDK 54 (managed workflow) |
| Navegación | Expo Router v6 (file-based routing) |
| Estado global | Zustand |
| Estilos | NativeWind (Tailwind para React Native) |
| Imágenes | Expo Image |
| Animaciones | React Native Reanimated |
| Backend | Supabase (Project ID: `vecnktrbjolahcalkbml`) |
| Lenguaje | TypeScript |

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/MaxiBernardoni/opa-mobile.git
cd opa-mobile
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` es obligatorio. Hay un conflicto entre `react-native@0.81.5` y `react-native-screens@4.25.0` que requiere este flag en todos los `npm install`.

### 2. Variables de entorno

Crear el archivo `.env` en la raíz del proyecto:

```
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

La anon key se obtiene desde el dashboard de Supabase → Project Settings → API.

### 3. Fuente Merge One (opcional)

La fuente `Merge One` no se puede instalar via npm. Para activarla:

1. Descargá `MergeOne-Regular.ttf` desde [Google Fonts](https://fonts.google.com/specimen/Merge+One)
2. Colocá el archivo en `assets/fonts/MergeOne-Regular.ttf`
3. En `app/_layout.tsx`, descomentá la línea:
```ts
MergeOne_400Regular: require('../assets/fonts/MergeOne-Regular.ttf'),
```

Sin este paso la app funciona igual usando fuentes del sistema.

### 4. Arrancar

```bash
npx expo start --clear
```

Para ver en dispositivo físico, el teléfono y la PC deben estar en la **misma red WiFi**. Escaneá el QR con la app **Expo Go**.

## Estructura del proyecto

```
opa/
├── app/                    # Expo Router — rutas file-based
│   ├── (tabs)/             # Tab navigator
│   │   ├── index.tsx       # Home
│   │   ├── outfits.tsx     # Outfit Scroll (TikTok-style)
│   │   ├── search.tsx      # Búsqueda
│   │   ├── wardrobe.tsx    # Armario
│   │   └── profile.tsx     # Perfil
│   ├── outfit/[id].tsx     # Detalle de outfit
│   ├── product/[id].tsx    # Detalle de prenda
│   └── _layout.tsx         # Root layout + carga de fuentes
├── components/
│   ├── navigation/         # BottomTabBar custom
│   ├── outfit/             # OutfitCard, OutfitScrollItem
│   └── home/               # SectionHeader
├── constants/
│   ├── colors.ts           # Paleta OPA
│   ├── fonts.ts            # Referencias de fuentes
│   ├── spacing.ts          # Escala de espaciado
│   ├── radius.ts           # Border radii
│   └── mockData.ts         # Data de prueba (no requiere Supabase)
├── hooks/                  # useOutfits, useProfile, useWardrobe
├── lib/supabase.ts         # Cliente Supabase
├── store/                  # Zustand stores (auth, outfits, wardrobe)
└── types/index.ts          # Tipos globales TypeScript
```

## Estado actual — Demo 1

- [x] Setup del proyecto y configuración base
- [x] Design tokens (colores, tipografías, spacing, radius)
- [x] BottomTabBar custom con tab OPA destacado
- [x] Home screen con carousels horizontales
- [x] Outfit Scroll screen (full-screen, paginado vertical)
- [x] Profile screen con grid de outfits
- [x] Data mock (5 outfits, 5 marcas, 5 prendas)

## Pendientes

- [ ] Añadir fuente Merge One (ver instrucciones arriba)
- [ ] Completar `.env` con la anon key de Supabase
- [ ] Aplicar migraciones de Supabase (schemas en el brief de producto)
- [ ] Reemplazar mock data por queries reales a Supabase
- [ ] Pantallas de detalle: outfit/[id] y product/[id]
- [ ] Pantalla de búsqueda
- [ ] Pantalla de armario con lógica real

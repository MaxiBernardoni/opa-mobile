import { Platform, useWindowDimensions } from 'react-native'
import { useIsCoarsePointer } from '../hooks/useIsCoarsePointer'

// Ancho lógico de referencia: iPhone 16 Pro (393pt). En web, cuando la ventana
// es más ancha que esto Y el puntero es fino (mouse/desktop real — ver
// useIsCoarsePointer), la app se encuadra en una columna tipo teléfono (ver
// components/layout/MobileFrame.tsx). Todos los cálculos de layout basados en
// el ancho deben usar useAppWidth() en vez del ancho real del browser, para
// que carruseles, grillas y paginados se calculen contra el ancho del
// "teléfono" y no contra el ancho completo del monitor.
export const APP_MAX_WIDTH = 393

// Ancho efectivo de la app, reactivo: el real en nativo / mobile-web (o
// cualquier touch, sea cual sea su ancho), capeado solo en desktop-web (mouse
// + ventana ancha) — mismo criterio que MobileFrame, para que el contenedor y
// el contenido interno siempre midan lo mismo. Hook en vez de constante
// porque un `const` de módulo se calcula una sola vez al cargar la página y
// nunca se vuelve a leer — un usuario cambiando de tamaño en vivo (rotar el
// celular, redimensionar la ventana de desktop, o cambiar de dispositivo en
// DevTools sin recargar) quedaba con contenido calculado para un ancho viejo
// dentro de un contenedor de otro tamaño (encontrado 2026-09-07: cards de
// grid desbordadas/cortadas al cambiar de dispositivo sin recargar).
export function useAppWidth() {
  const { width } = useWindowDimensions()
  const isCoarsePointer = useIsCoarsePointer()
  return Platform.OS === 'web' && !isCoarsePointer ? Math.min(width, APP_MAX_WIDTH) : width
}

import { Dimensions, Platform } from 'react-native'

// Ancho lógico de referencia: iPhone 16 Pro (393pt). En web, cuando la ventana
// es más ancha que esto, la app se encuadra en una columna tipo teléfono
// (ver components/layout/MobileFrame.tsx). Todos los cálculos de layout basados
// en el ancho deben usar APP_WIDTH en vez del ancho real del browser, para que
// carruseles, grillas y paginados se calculen contra el ancho del "teléfono" y
// no contra el ancho completo del monitor.
export const APP_MAX_WIDTH = 393

const win = Dimensions.get('window')

// Ancho efectivo de la app: el real en nativo / mobile-web, capeado en desktop-web.
export const APP_WIDTH =
  Platform.OS === 'web' ? Math.min(win.width, APP_MAX_WIDTH) : win.width

// La altura no se capea: el marco ocupa el 100% del alto de la ventana, así que
// la altura de la ventana sigue siendo la altura visible real (paginado del
// outfit scroll, etc.).
export const APP_HEIGHT = win.height

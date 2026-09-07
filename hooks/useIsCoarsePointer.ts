import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

// Si el dispositivo usa touch (dedo) en vez de mouse. Se usa para distinguir un
// teléfono real (o emulado en DevTools) de una ventana de desktop ancha — el
// ancho lógico solo no alcanza porque hay teléfonos reales más anchos que
// APP_MAX_WIDTH (iPhone Pro Max ronda 430-440px, muchos Android 412-480px). Se
// detecta con la media feature CSS `pointer`, que Chrome también emula al
// elegir un dispositivo en DevTools.
export function useIsCoarsePointer() {
  const [isCoarse, setIsCoarse] = useState(
    () => Platform.OS === 'web' && typeof window !== 'undefined' && !!window.matchMedia
      && window.matchMedia('(pointer: coarse)').matches
  )

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(pointer: coarse)')
    const handler = (e: MediaQueryListEvent) => setIsCoarse(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isCoarse
}

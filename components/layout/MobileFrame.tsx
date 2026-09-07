import React from 'react'
import { View, Platform, StyleSheet, useWindowDimensions } from 'react-native'
import { APP_MAX_WIDTH } from '../../constants/layout'
import { useIsCoarsePointer } from '../../hooks/useIsCoarsePointer'

// Encuadra la app en una columna tipo teléfono cuando se abre en web en una
// ventana ancha con mouse (desktop). En nativo, en un teléfono real (touch,
// cualquiera sea su ancho), o en DevTools emulando un dispositivo, no hace
// nada y la app ocupa toda la pantalla → responsive automático.
export function MobileFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions()
  const isCoarsePointer = useIsCoarsePointer()

  const shouldFrame = Platform.OS === 'web' && width > APP_MAX_WIDTH && !isCoarsePointer

  if (!shouldFrame) return <>{children}</>

  // Alto numérico (= alto de la ventana) porque react-native-web no estira de
  // forma confiable con flex:1 / '100vh' cuando el root no tiene alto definido.
  return (
    <View style={[styles.page, { height }]}>
      <View style={[styles.frame, { height }]}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: APP_MAX_WIDTH,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    // Sombra sutil para que se lea como un teléfono sobre el fondo gris.
    ...Platform.select({
      web: { boxShadow: '0 0 24px rgba(0,0,0,0.18)' } as any,
      default: {},
    }),
  },
})

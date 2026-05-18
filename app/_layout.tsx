import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { PalanquinDark_400Regular } from '@expo-google-fonts/palanquin-dark'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PalanquinDark_400Regular,
    // MergeOne_400Regular: require('../assets/fonts/MergeOne-Regular.ttf'),
    // Añadí MergeOne-Regular.ttf en assets/fonts/ para activar esta fuente
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="outfit/[id]" />
      <Stack.Screen name="product/[id]" />
    </Stack>
  )
}

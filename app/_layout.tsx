import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { PalanquinDark_400Regular } from '@expo-google-fonts/palanquin-dark'
import * as SplashScreen from 'expo-splash-screen'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PalanquinDark_400Regular,
    MergeOne_400Regular: require('../assets/fonts/MergeOne-Regular.ttf'),
  })

  const { setSession, setProfile, setInitialized } = useAuthStore()

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else setInitialized(true)
    })

    // Listen for auth changes — skip INITIAL_SESSION, already handled by getSession() above
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setInitialized(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data ?? null)
    setInitialized(true)
  }

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="outfit/[id]" />
      <Stack.Screen name="product/[id]" />
    </Stack>
  )
}

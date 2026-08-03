import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'

export default function ImpersonateScreen() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setError('Esta pantalla es solo para uso interno desde la versión web.')
      return
    }

    const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    const params = new URLSearchParams(rawHash || window.location.search)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (!access_token || !refresh_token) {
      setError('Link inválido o expirado. Generá uno nuevo desde opa-admin.')
      return
    }

    supabase.auth.setSession({ access_token, refresh_token }).then(({ error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message)
        return
      }
      window.history.replaceState(null, '', window.location.pathname)
      router.replace('/(tabs)/profile')
    })
  }, [])

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator color={colors.rosaOpa} />
          <Text style={styles.text}>Iniciando sesión...</Text>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blanco,
    gap: 12,
    paddingHorizontal: 24,
  },
  text: {
    fontFamily: fonts.palanquinDark,
    color: colors.grisOscuro,
  },
  error: {
    fontFamily: fonts.palanquinDark,
    color: colors.rosaOpa,
    textAlign: 'center',
  },
})

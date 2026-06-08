import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { radius } from '../../constants/radius'

type Mode = 'login' | 'signup'

export default function AuthScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Completá todos los campos')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      Alert.alert('Error al iniciar sesión', error.message)
    } else {
      router.replace('/(tabs)')
    }
  }

  async function handleSignup() {
    if (!email || !password || !username) {
      Alert.alert('Email, contraseña y usuario son obligatorios')
      return
    }
    if (password.length < 6) {
      Alert.alert('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase().replace(/\s/g, ''),
          display_name: displayName || username,
        },
      },
    })
    setLoading(false)
    if (error) {
      Alert.alert('Error al registrarse', error.message)
    } else if (!data.session) {
      // Email confirmation is required — session will be null until confirmed
      Alert.alert(
        'Revisá tu email',
        'Te enviamos un link de confirmación. Una vez que confirmes tu cuenta podés iniciar sesión.',
        [{ text: 'Entendido' }]
      )
    } else {
      router.replace('/(tabs)')
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>OPA</Text>
          <Text style={styles.tagline}>
            {mode === 'login' ? 'Bienvenido/a de vuelta' : 'Creá tu cuenta'}
          </Text>

          {/* Mode switcher */}
          <View style={styles.modeSwitcher}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>
                Iniciá sesión
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'signup' && styles.modeTabActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.modeTabText, mode === 'signup' && styles.modeTabTextActive]}>
                Registrate
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <>
                <Text style={styles.label}>Usuario</Text>
                <TextInput
                  style={styles.input}
                  placeholder="tu_usuario"
                  placeholderTextColor={colors.grisMedio}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre (opcional)"
                  placeholderTextColor={colors.grisMedio}
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor={colors.grisMedio}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
              placeholderTextColor={colors.grisMedio}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={mode === 'login' ? handleLogin : handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={colors.blanco} />
                : <Text style={styles.primaryBtnText}>
                    {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                  </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchLink}
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              <Text style={styles.switchLinkText}>
                {mode === 'login'
                  ? '¿No tenés cuenta? Registrate'
                  : '¿Ya tenés cuenta? Iniciá sesión'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  closeText: { fontSize: 18, color: colors.grisClaro },
  logo: {
    fontSize: 48,
    fontFamily: fonts.mergeOne,
    color: colors.rosaOpa,
    letterSpacing: 8,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 15,
    color: colors.grisClaro,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.grisBorde,
    borderRadius: radius.button,
    padding: 4,
    marginBottom: spacing.xl,
  },
  modeTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.button - 2,
    alignItems: 'center',
  },
  modeTabActive: { backgroundColor: colors.blanco },
  modeTabText: {
    fontSize: 14,
    color: colors.grisClaro,
    fontFamily: fonts.palanquinDark,
  },
  modeTabTextActive: { color: colors.negro },
  form: { gap: spacing.xs },
  label: {
    fontSize: 12,
    color: colors.grisOscuro,
    fontFamily: fonts.mergeOne,
    marginTop: spacing.md,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grisBorde,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.negro,
    backgroundColor: colors.blanco,
  },
  primaryBtn: {
    backgroundColor: colors.rosaOpa,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: colors.blanco,
    fontSize: 15,
    fontFamily: fonts.palanquinDark,
  },
  switchLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  switchLinkText: {
    fontSize: 13,
    color: colors.rosaOpa,
    fontFamily: fonts.palanquinDark,
  },
})

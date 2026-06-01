import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native'
import { colors } from '../../constants/colors'
import { radius } from '../../constants/radius'
import { fonts } from '../../constants/fonts'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'outline' | 'ghost'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style, textStyle }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.blanco : colors.rosaOpa} size="small" />
        : <Text style={[styles.label, styles[`${variant}Label`], textStyle]}>{label}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.rosaOpa },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.rosaOpa },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  label: { fontSize: 14, fontFamily: fonts.palanquinDark },
  primaryLabel: { color: colors.blanco },
  outlineLabel: { color: colors.rosaOpa },
  ghostLabel: { color: colors.rosaOpa },
})

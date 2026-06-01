import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors } from '../../constants/colors'

interface BadgeProps {
  label: string
  color?: string
  textColor?: string
  style?: ViewStyle
}

export function Badge({ label, color = colors.rosaOpa, textColor = colors.blanco, style }: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }, style]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 10, fontWeight: '600' },
})

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'

interface Props {
  title: string
  onPress?: () => void
}

export function SectionHeader({ title, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <Text style={styles.title}>{title} {'>'}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.negro,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})

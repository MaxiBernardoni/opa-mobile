import React from 'react'
import { ScrollView, View, StyleSheet, ViewStyle } from 'react-native'
import { spacing } from '../../constants/spacing'

interface HorizontalSliderProps {
  children: React.ReactNode
  contentStyle?: ViewStyle
}

export function HorizontalSlider({ children, contentStyle }: HorizontalSliderProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, contentStyle]}
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
})

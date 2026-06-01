import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors } from '../../constants/colors'
import { radius } from '../../constants/radius'
import { fonts } from '../../constants/fonts'

interface TagProps {
  label: string
  style?: ViewStyle
}

export function Tag({ label, style }: TagProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.bordeTag,
    borderRadius: radius.tag,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    color: colors.grisOscuro,
    fontFamily: fonts.mergeOne,
  },
})

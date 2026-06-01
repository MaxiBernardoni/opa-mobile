import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import { colors } from '../../constants/colors'
import { radius } from '../../constants/radius'

interface AvatarProps {
  uri?: string | null
  size?: number
  style?: ViewStyle
}

export function Avatar({ uri, size = 40, style }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius.avatar }, style]}>
      <Image
        source={uri ? { uri } : require('../../assets/icon.png')}
        style={{ width: size, height: size, borderRadius: radius.avatar }}
        contentFit="cover"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.grisMedio,
  },
})

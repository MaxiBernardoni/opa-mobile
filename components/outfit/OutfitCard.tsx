import React from 'react'
import { TouchableOpacity, Image, StyleSheet, View, Text } from 'react-native'
import { Outfit } from '../../types'
import { colors } from '../../constants/colors'
import { radius } from '../../constants/radius'

interface Props {
  outfit: Outfit
  onPress: () => void
  width?: number
  height?: number
}

export function OutfitCard({ outfit, onPress, width = 200, height = 356 }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.card, { width, height }]}>
      <Image
        source={{ uri: outfit.image_url }}
        style={styles.image}
        resizeMode="cover"
      />
      {outfit.discount_percent > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>-{outfit.discount_percent}%</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.grisMedio,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.rosaOpa,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.blanco,
    fontSize: 11,
    fontWeight: '700',
  },
})

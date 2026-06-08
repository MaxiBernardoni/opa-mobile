import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Garment } from '../../types'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { radius } from '../../constants/radius'

interface OutfitGarmentLabelProps {
  garment: Garment
  positionX?: number
  positionY?: number
}

export function OutfitGarmentLabel({ garment, positionX = 0.5, positionY = 0.5 }: OutfitGarmentLabelProps) {
  return (
    <View
      style={[
        styles.container,
        {
          left: `${positionX * 100}%` as any,
          top: `${positionY * 100}%` as any,
        },
      ]}
    >
      <View style={styles.dot} />
      <View style={styles.chip}>
        <Image
          source={{ uri: garment.image_url ?? `https://picsum.photos/seed/${garment.id}/40/40` }}
          style={styles.thumbnail}
          contentFit="cover"
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{garment.name}</Text>
          <Text style={styles.price}>${garment.price.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blanco,
    marginLeft: 4,
    marginBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blanco,
    borderRadius: radius.chip,
    padding: 6,
    gap: 6,
    shadowColor: colors.negro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbnail: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  info: {
    maxWidth: 100,
  },
  name: {
    fontSize: 11,
    fontFamily: fonts.mergeOne,
    color: colors.negro,
  },
  price: {
    fontSize: 11,
    fontFamily: fonts.mergeOne,
    color: colors.rosaOpa,
  },
})

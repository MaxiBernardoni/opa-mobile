import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { HorizontalSlider } from './HorizontalSlider'
import { Brand } from '../../types'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { radius } from '../../constants/radius'

interface BrandsSliderProps {
  brands: Brand[]
  onPress?: (brand: Brand) => void
}

export function BrandsSlider({ brands, onPress }: BrandsSliderProps) {
  return (
    <HorizontalSlider>
      {brands.map((brand) => (
        <TouchableOpacity
          key={brand.id}
          style={styles.card}
          onPress={() => onPress?.(brand)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: brand.logo_url ?? `https://picsum.photos/seed/${brand.id}/115/115` }}
            style={styles.image}
            contentFit="cover"
          />
          <Text style={styles.name} numberOfLines={1}>{brand.name}</Text>
        </TouchableOpacity>
      ))}
    </HorizontalSlider>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 115,
    alignItems: 'center',
    gap: 6,
  },
  image: {
    width: 115,
    height: 115,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.negro,
  },
  name: {
    fontSize: 11,
    fontFamily: fonts.mergeOne,
    color: colors.negro,
    textAlign: 'center',
  },
})

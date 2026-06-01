import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Outfit } from '../../types'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { radius } from '../../constants/radius'
import { spacing } from '../../constants/spacing'

interface OutfitBottomBarProps {
  outfit: Outfit
  onPress?: () => void
}

export function OutfitBottomBar({ outfit, onPress }: OutfitBottomBarProps) {
  const totalPrice = outfit.garments?.reduce((sum, item) => sum + (item.garment?.price ?? 0), 0) ?? 0

  return (
    <View style={styles.container}>
      <View style={styles.priceSection}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.price}>${totalPrice.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.buttonLabel}>Ver outfit</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.blanco,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.negro,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  priceSection: { gap: 2 },
  totalLabel: {
    fontSize: 10,
    fontFamily: fonts.mergeOne,
    color: colors.grisClaro,
  },
  price: {
    fontSize: 20,
    fontFamily: fonts.mergeOne,
    color: colors.negro,
  },
  button: {
    backgroundColor: colors.rosaOpa,
    borderRadius: radius.button,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 14,
    fontFamily: fonts.palanquinDark,
    color: colors.blanco,
  },
})

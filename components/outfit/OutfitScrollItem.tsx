import React, { useState } from 'react'
import {
  View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ImageBackground,
} from 'react-native'
import { Outfit } from '../../types'
import { colors } from '../../constants/colors'
import { radius } from '../../constants/radius'
import { spacing } from '../../constants/spacing'

const { width: SW, height: SH } = Dimensions.get('window')

interface Props {
  outfit: Outfit
  isActive: boolean
}

export function OutfitScrollItem({ outfit, isActive }: Props) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  const discountedPrice = outfit.discount_percent > 0
    ? outfit.total_price * (1 - outfit.discount_percent / 100)
    : null

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: outfit.image_url }}
        style={styles.image}
        resizeMode="cover"
      >
        {/* Gradient overlay bottom */}
        <View style={styles.gradientOverlay} />

        {/* Garment labels flotantes */}
        {outfit.garments?.map((og) => (
          <View
            key={og.garment_id}
            style={[
              styles.garmentLabel,
              { left: SW * og.position_x - 60, top: SH * og.position_y - 20 },
            ]}
          >
            <Image
              source={{ uri: og.garment.image_url ?? 'https://picsum.photos/seed/g/40/40' }}
              style={styles.garmentThumb}
            />
            <View style={styles.garmentInfo}>
              <Text style={styles.garmentName} numberOfLines={1}>{og.garment.name}</Text>
              <Text style={styles.garmentPrice}>€{og.garment.price.toFixed(2)}</Text>
            </View>
          </View>
        ))}

        {/* Action buttons derecha */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>{liked ? '♥' : '♡'}</Text>
            <Text style={styles.actionCount}>{outfit.likes_count + (liked ? 1 : 0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSaved(!saved)} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>{saved ? '🔖' : '🏷'}</Text>
            <Text style={styles.actionCount}>{outfit.saves_count + (saved ? 1 : 0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionCount}>Compartir</Text>
          </TouchableOpacity>
        </View>

        {/* Info marca abajo izquierda */}
        <View style={styles.brandInfo}>
          <View style={styles.brandRow}>
            <View style={styles.brandAvatar}>
              <Text style={styles.brandAvatarText}>{outfit.brand?.name?.[0] ?? 'O'}</Text>
            </View>
            <View>
              <View style={styles.brandNameRow}>
                <Text style={styles.brandName}>{outfit.brand?.name}</Text>
                {outfit.brand?.verified && <Text style={styles.verified}>✓</Text>}
              </View>
              <Text style={styles.outfitTitle}>{outfit.title}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total look</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              €{discountedPrice ? discountedPrice.toFixed(2) : outfit.total_price.toFixed(2)}
            </Text>
            {discountedPrice && (
              <View style={styles.discountChip}>
                <Text style={styles.discountText}>-{outfit.discount_percent}%</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>Ver outfit</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: SW,
    height: SH,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  garmentLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blanco,
    borderRadius: radius.chip,
    padding: 6,
    maxWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  garmentThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 6,
  },
  garmentInfo: {
    flex: 1,
  },
  garmentName: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.negro,
  },
  garmentPrice: {
    fontSize: 10,
    color: colors.rosaOpa,
    fontWeight: '700',
  },
  actions: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    gap: 20,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    color: colors.blanco,
  },
  actionCount: {
    fontSize: 11,
    color: colors.blanco,
    marginTop: 2,
  },
  brandInfo: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 80,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.rosaOpa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandAvatarText: {
    color: colors.blanco,
    fontWeight: '700',
    fontSize: 16,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandName: {
    color: colors.blanco,
    fontWeight: '700',
    fontSize: 14,
  },
  verified: {
    color: colors.rosaOpa,
    fontSize: 14,
  },
  outfitTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.blanco,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  totalLabel: {
    fontSize: 11,
    color: colors.grisClaro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.negro,
  },
  discountChip: {
    backgroundColor: colors.rosaOpaLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: colors.rosaOpa,
    fontSize: 12,
    fontWeight: '700',
  },
  ctaButton: {
    backgroundColor: colors.rosaOpa,
    borderRadius: radius.button,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaText: {
    color: colors.blanco,
    fontWeight: '700',
    fontSize: 14,
  },
})

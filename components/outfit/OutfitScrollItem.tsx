import React, { useState } from 'react'
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, ImageBackground,
} from 'react-native'
import { Image } from 'expo-image'
import { Outfit } from '../../types'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { radius } from '../../constants/radius'
import { spacing } from '../../constants/spacing'
import { OutfitGarmentLabel } from './OutfitGarmentLabel'

const { width: SW, height: SH } = Dimensions.get('window')

const STORAGE = 'https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/assets'
const ICON_LIKE = `${STORAGE}/icons/like.png`
const ICON_LIKE_ACTIVE = `${STORAGE}/icons/like_rosa.png`
const ICON_SAVE = `${STORAGE}/icons/save.png`
const ICON_SAVE_ACTIVE = `${STORAGE}/icons/save_rosa.png`
const ICON_SHARE = `${STORAGE}/icons/share.png`
const ICON_BAG = `${STORAGE}/icons/bolsa_rosa.png`

interface Props {
  outfit: Outfit
  isActive: boolean
}

export function OutfitScrollItem({ outfit, isActive }: Props) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  const totalPrice = outfit.garments?.reduce((sum, item) => sum + (item.garment?.price ?? 0), 0) ?? 0
  const discount = outfit.discount_percent ?? 0
  const savings = discount > 0 ? totalPrice * (discount / 100) : 0
  const firstBrand = outfit.garments?.[0]?.garment?.brand

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: outfit.cover_image_url ?? `https://picsum.photos/seed/${outfit.id}/400/711` }}
        style={styles.image}
        resizeMode="cover"
      >
        <View style={styles.gradientOverlay} />

        {/* Garment labels */}
        {outfit.garments?.slice(0, 3).map((og) =>
          og.garment ? (
            <OutfitGarmentLabel
              key={og.garment_id}
              garment={og.garment}
              positionX={og.position_x ?? 0.25}
              positionY={og.position_y ?? 0.4}
            />
          ) : null
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.actionBtn}>
            <Image
              source={{ uri: liked ? ICON_LIKE_ACTIVE : ICON_LIKE }}
              style={styles.actionIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSaved(!saved)} style={styles.actionBtn}>
            <Image
              source={{ uri: saved ? ICON_SAVE_ACTIVE : ICON_SAVE }}
              style={styles.actionIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Image
              source={{ uri: ICON_SHARE }}
              style={styles.actionIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Brand info */}
        <View style={styles.brandInfo}>
          <View style={styles.brandRow}>
            {firstBrand?.logo_url ? (
              <Image
                source={{ uri: firstBrand.logo_url }}
                style={styles.brandAvatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.brandAvatar, styles.brandAvatarFallback]}>
                <Text style={styles.brandAvatarText}>{firstBrand?.name?.[0] ?? 'O'}</Text>
              </View>
            )}
            <View>
              <Text style={styles.brandName}>{firstBrand?.name ?? 'OPA'}</Text>
              <Text style={styles.outfitTitle} numberOfLines={1}>{outfit.title}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        {/* Price section */}
        <View style={styles.priceSection}>
          <Image source={{ uri: ICON_BAG }} style={styles.bagIcon} contentFit="contain" />
          <View>
            <Text style={styles.totalLabel}>Total look</Text>
            <Text style={styles.price}>${totalPrice.toFixed(2)}</Text>
          </View>

          {/* Discount badge */}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountTop}>{discount}% OFF</Text>
              <Text style={styles.discountBottom}>Ahorras ${savings.toFixed(0)}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>Ver outfit</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: SW, height: SH },
  image: { flex: 1, justifyContent: 'flex-end' },
  gradientOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 220, backgroundColor: 'rgba(0,0,0,0.38)',
  },

  // Action buttons
  actions: {
    position: 'absolute', right: 16, bottom: 140,
    alignItems: 'center', gap: 24,
  },
  actionBtn: { alignItems: 'center' },
  actionIcon: { width: 28, height: 28 },

  // Brand info
  brandInfo: { position: 'absolute', bottom: 120, left: 16, right: 80 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandAvatar: {
    width: 40, height: 40, borderRadius: 20,
  },
  brandAvatarFallback: {
    backgroundColor: colors.negro, alignItems: 'center', justifyContent: 'center',
  },
  brandAvatarText: { color: colors.blanco, fontWeight: '700', fontSize: 16 },
  brandName: { color: colors.blanco, fontWeight: '700', fontSize: 14, fontFamily: fonts.palanquinDark },
  outfitTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
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
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bagIcon: { width: 24, height: 24 },
  totalLabel: { fontSize: 11, color: colors.grisClaro, textTransform: 'uppercase', letterSpacing: 0.5 },
  price: { fontSize: 20, fontWeight: '800', color: colors.negro, fontFamily: fonts.mergeOne },
  discountBadge: {
    backgroundColor: colors.rosaOpa,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  discountTop: { color: colors.blanco, fontSize: 10, fontWeight: '800' },
  discountBottom: { color: colors.blanco, fontSize: 9, opacity: 0.9 },
  ctaButton: {
    backgroundColor: colors.rosaOpa,
    borderRadius: radius.button,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaText: { color: colors.blanco, fontWeight: '700', fontSize: 14, fontFamily: fonts.palanquinDark },
})

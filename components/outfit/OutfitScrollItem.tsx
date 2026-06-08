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

const { width: SW, height: SH } = Dimensions.get('window')

interface Props {
  outfit: Outfit
  isActive: boolean
}

export function OutfitScrollItem({ outfit, isActive }: Props) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  const totalPrice = outfit.garments?.reduce((sum, item) => sum + (item.garment?.price ?? 0), 0) ?? 0
  const creator = outfit.creator
  const creatorHandle = creator?.username ? `@${creator.username}` : (creator?.display_name ?? 'OPA')

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: outfit.cover_image_url ?? `https://picsum.photos/seed/${outfit.id}/400/711` }}
        style={styles.image}
        resizeMode="cover"
      >
        <View style={styles.gradientOverlay} />

        {/* Garment labels */}
        {outfit.garments?.slice(0, 3).map((og, i) => (
          <View
            key={og.garment_id}
            style={[styles.garmentLabel, { left: 20 + i * 10, top: SH * (0.25 + i * 0.12) }]}
          >
            <Image
              source={{ uri: og.garment?.image_url ?? `https://picsum.photos/seed/${og.garment_id}/40/40` }}
              style={styles.garmentThumb}
              contentFit="cover"
            />
            <View style={styles.garmentInfo}>
              <Text style={styles.garmentName} numberOfLines={1}>{og.garment?.name}</Text>
              <Text style={styles.garmentPrice}>${og.garment?.price.toFixed(2)}</Text>
            </View>
          </View>
        ))}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>{liked ? '♥' : '♡'}</Text>
            <Text style={styles.actionCount}>{outfit.likes_count + (liked ? 1 : 0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSaved(!saved)} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>{saved ? '🔖' : '🏷'}</Text>
            <Text style={styles.actionCount}>{saved ? 1 : 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionCount}>Compartir</Text>
          </TouchableOpacity>
        </View>

        {/* Creator info */}
        <View style={styles.brandInfo}>
          <View style={styles.brandRow}>
            {creator?.avatar_url ? (
              <Image source={{ uri: creator.avatar_url }} style={styles.creatorAvatar} contentFit="cover" />
            ) : (
              <View style={styles.brandAvatar}>
                <Text style={styles.brandAvatarText}>{(creator?.username ?? 'O')[0].toUpperCase()}</Text>
              </View>
            )}
            <View>
              <Text style={styles.brandName}>{creatorHandle}</Text>
              <Text style={styles.outfitTitle}>{outfit.title}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total look</Text>
          <Text style={styles.price}>${totalPrice.toFixed(2)}</Text>
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
    height: 200, backgroundColor: 'rgba(0,0,0,0.35)',
  },
  garmentLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blanco,
    borderRadius: radius.chip,
    padding: 6,
    maxWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  garmentThumb: { width: 32, height: 32, borderRadius: 16, marginRight: 6 },
  garmentInfo: { flex: 1 },
  garmentName: { fontSize: 10, fontFamily: fonts.mergeOne, color: colors.negro },
  garmentPrice: { fontSize: 10, fontFamily: fonts.mergeOne, color: colors.rosaOpa },
  actions: {
    position: 'absolute', right: 16, bottom: 120,
    alignItems: 'center', gap: 20,
  },
  actionBtn: { alignItems: 'center' },
  actionIcon: { fontSize: 28, color: colors.blanco },
  actionCount: { fontSize: 11, color: colors.blanco, marginTop: 2 },
  brandInfo: { position: 'absolute', bottom: 110, left: 16, right: 80 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.negro, alignItems: 'center', justifyContent: 'center',
  },
  creatorAvatar: { width: 40, height: 40, borderRadius: 20 },
  brandAvatarText: { color: colors.blanco, fontWeight: '700', fontSize: 16 },
  brandName: { color: colors.blanco, fontWeight: '700', fontSize: 14 },
  outfitTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
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
  totalLabel: { fontSize: 11, color: colors.grisClaro, textTransform: 'uppercase', letterSpacing: 0.5 },
  price: { fontSize: 20, fontWeight: '800', color: colors.negro, fontFamily: fonts.mergeOne },
  ctaButton: {
    backgroundColor: colors.rosaOpa,
    borderRadius: radius.button,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaText: { color: colors.blanco, fontWeight: '700', fontSize: 14, fontFamily: fonts.palanquinDark },
})

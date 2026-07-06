import React, { useRef } from 'react'
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity,
  StatusBar, ActivityIndicator, Animated, Dimensions, FlatList,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { radius } from '../../constants/radius'
import { useOutfits } from '../../hooks/useOutfits'
import { SectionHeader } from '../../components/home/SectionHeader'
import { Brand, Garment, Outfit } from '../../types'

const { width: SW } = Dimensions.get('window')
const STORAGE = 'https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/assets'

// Carousel config
const CARD_W = 220
const CARD_H = 370
const CARD_GAP = 12
const FULL_W = CARD_W + CARD_GAP * 2

// ─── Outfit Carousel with depth effect ───────────────────────────────────────
function OutfitCarousel({ outfits, onPress }: { outfits: Outfit[]; onPress: (id: string) => void }) {
  const scrollX = useRef(new Animated.Value(0)).current
  const sidePad = (SW - CARD_W) / 2

  return (
    <Animated.FlatList
      data={outfits.slice(0, 5)}
      keyExtractor={item => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={FULL_W}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: sidePad - CARD_GAP }}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
      renderItem={({ item, index }) => {
        const inputRange = [
          (index - 1) * FULL_W,
          index * FULL_W,
          (index + 1) * FULL_W,
        ]
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.84, 1, 0.84],
          extrapolate: 'clamp',
        })
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.65, 1, 0.65],
          extrapolate: 'clamp',
        })
        return (
          <TouchableOpacity onPress={() => onPress(item.id)} activeOpacity={0.9}>
            <Animated.View style={[styles.outfitCard, { transform: [{ scale }], opacity }]}>
              <Image
                source={{ uri: item.cover_image_url ?? `https://picsum.photos/seed/${item.id}/220/370` }}
                style={styles.outfitCardImage}
                contentFit="cover"
              />
            </Animated.View>
          </TouchableOpacity>
        )
      }}
    />
  )
}

// ─── Home ────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter()
  const { outfits, loading } = useOutfits()

  const garments: Garment[] = outfits
    .flatMap(o => o.garments?.map(g => g.garment) ?? [])
    .filter((g, i, a) => g && a.findIndex(x => x?.id === g.id) === i)
    .slice(0, 8) as Garment[]

  const brands: Brand[] = outfits
    .flatMap(o => o.garments?.map(g => g.garment?.brand).filter(Boolean) ?? [])
    .filter((b, i, a) => b && a.findIndex(x => x?.id === (b as Brand).id) === i)
    .slice(0, 6) as Brand[]

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Image
            source={{ uri: `${STORAGE}/logoOPA-transparente.png` }}
            style={styles.logoImg}
            contentFit="contain"
          />
          <TouchableOpacity style={styles.truckBtn}>
            <Image
              source={{ uri: `${STORAGE}/camion_blanco.png` }}
              style={styles.truckIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.rosaOpa} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* ── Outfits ─────────────────────────────────────────────────── */}
            <SectionHeader title="Outfits" onPress={() => router.push('/(tabs)/outfits')} />
            <OutfitCarousel
              outfits={outfits}
              onPress={(id) => router.push({ pathname: '/(tabs)/outfits', params: { outfitId: id } })}
            />

            {/* ── Últimas prendas ─────────────────────────────────────────── */}
            <SectionHeader title="Últimas Prendas" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {garments.map(item => (
                <TouchableOpacity key={item.id} style={styles.garmentCard} activeOpacity={0.85}>
                  <View style={styles.garmentImageWrap}>
                    <Image
                      source={{ uri: item.image_url ?? undefined }}
                      style={styles.garmentImage}
                      contentFit="cover"
                    />
                  </View>
                  <Text style={styles.garmentName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.garmentPrice}>${item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── Marcas ──────────────────────────────────────────────────── */}
            <SectionHeader title="Las Marcas que la Gente Elige" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {brands.map(brand => (
                <TouchableOpacity
                  key={brand.id}
                  style={styles.brandCard}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/marca/${brand.id}`)}
                >
                  {brand.logo_url ? (
                    <Image source={{ uri: brand.logo_url }} style={styles.brandLogo} contentFit="contain" />
                  ) : (
                    <Text style={styles.brandName} numberOfLines={2}>{brand.name}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── Lo último que viste ─────────────────────────────────────── */}
            <SectionHeader title="Lo Último que Viste" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={styles.recentCard}>
                  <Text style={styles.recentEmpty}>Aún no{'\n'}hay nada{'\n'}que mostrar</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },
  scroll: { flexGrow: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  logoImg: {
    width: 90,
    height: 36,
  },
  truckBtn: { padding: 4 },
  truckIcon: { width: 32, height: 32 },

  // Outfit carousel
  outfitCard: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginHorizontal: CARD_GAP,
    backgroundColor: colors.grisMedio,
    shadowColor: colors.negro,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  outfitCardImage: { width: '100%', height: '100%' },

  // Horizontal scroll base
  hScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  // Garments
  garmentCard: { width: 120 },
  garmentImageWrap: {
    width: 120,
    height: 150,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.grisBorde,
  },
  garmentImage: { width: '100%', height: '100%' },
  garmentName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.negro,
    marginTop: 6,
    lineHeight: 16,
  },
  garmentPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.rosaOpa,
    marginTop: 2,
  },

  // Brands
  brandCard: {
    width: 110,
    height: 110,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.negro,
    backgroundColor: colors.blanco,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 8,
  },
  brandLogo: { width: '100%', height: '100%' },
  brandName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.negro,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Recently viewed
  recentCard: {
    width: 110,
    height: 150,
    borderRadius: radius.card,
    backgroundColor: colors.grisBorde,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  recentEmpty: {
    fontSize: 10,
    color: colors.grisClaro,
    textAlign: 'center',
    lineHeight: 15,
  },
})

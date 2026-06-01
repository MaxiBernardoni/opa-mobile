import React from 'react'
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { radius } from '../../constants/radius'
import { useOutfits } from '../../hooks/useOutfits'
import { OutfitCard } from '../../components/outfit/OutfitCard'
import { SectionHeader } from '../../components/home/SectionHeader'
import { HorizontalSlider } from '../../components/home/HorizontalSlider'
import { BrandsSlider } from '../../components/home/BrandsSlider'
import { Brand, Garment } from '../../types'

export default function HomeScreen() {
  const router = useRouter()
  const { outfits, loading } = useOutfits()

  const garments: Garment[] = outfits.flatMap(o => o.garments?.map(g => g.garment) ?? [])
  const uniqueGarments = garments.filter((g, i, a) => g && a.findIndex(x => x?.id === g.id) === i).slice(0, 8)

  const brands: Brand[] = outfits.flatMap(o =>
    o.garments?.map(g => g.garment?.brand).filter(Boolean) ?? []
  ) as Brand[]
  const uniqueBrands = brands.filter((b, i, a) => b && a.findIndex(x => x?.id === b.id) === i).slice(0, 8)

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>OPA</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🚚</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.rosaOpa} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Outfits carousel */}
            <SectionHeader title="OUTFITS" onPress={() => router.push('/(tabs)/outfits')} />
            <HorizontalSlider>
              {outfits.slice(0, 3).map(item => (
                <OutfitCard
                  key={item.id}
                  outfit={item}
                  onPress={() => router.push('/(tabs)/outfits')}
                  width={200}
                  height={356}
                />
              ))}
            </HorizontalSlider>

            {/* Últimas prendas */}
            <SectionHeader title="ÚLTIMAS PRENDAS" />
            <HorizontalSlider>
              {uniqueGarments.map(item => (
                <TouchableOpacity key={item.id} style={styles.garmentCard} activeOpacity={0.8}>
                  <Image
                    source={{ uri: item.image_url ?? `https://picsum.photos/seed/${item.id}/115/144` }}
                    style={styles.garmentImage}
                    contentFit="cover"
                  />
                  <Text style={styles.garmentName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.garmentPrice}>${item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </HorizontalSlider>

            {/* Marcas */}
            <SectionHeader title="LAS MARCAS QUE LA GENTE ELIGE" />
            <BrandsSlider brands={uniqueBrands} />

            {/* Lo último que viste */}
            <SectionHeader title="LO ÚLTIMO QUE VISTE" />
            <HorizontalSlider>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={[styles.recentCard, { backgroundColor: colors.grisMedio }]} />
              ))}
            </HorizontalSlider>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.rosaOpa,
    letterSpacing: 4,
    fontFamily: fonts.mergeOne,
  },
  headerIcon: { padding: 4 },
  headerIconText: { fontSize: 22 },
  garmentCard: { width: 115 },
  garmentImage: {
    width: 115,
    height: 144,
    borderRadius: radius.card,
    backgroundColor: colors.grisMedio,
  },
  garmentName: {
    fontSize: 11,
    color: colors.negro,
    marginTop: 4,
    fontFamily: fonts.mergeOne,
  },
  garmentPrice: {
    fontSize: 11,
    color: colors.rosaOpa,
    fontFamily: fonts.mergeOne,
  },
  recentCard: {
    width: 100,
    height: 140,
    borderRadius: radius.card,
  },
})

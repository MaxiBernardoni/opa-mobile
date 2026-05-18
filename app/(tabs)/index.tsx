import React from 'react'
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, Image, StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { radius } from '../../constants/radius'
import { mockOutfits, mockBrands, mockGarments } from '../../constants/mockData'
import { OutfitCard } from '../../components/outfit/OutfitCard'
import { SectionHeader } from '../../components/home/SectionHeader'

export default function HomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>OPA</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🚚</Text>
          </TouchableOpacity>
        </View>

        {/* Outfits carousel */}
        <SectionHeader title="OUTFITS" onPress={() => router.push('/(tabs)/outfits')} />
        <FlatList
          horizontal
          data={mockOutfits.slice(0, 3)}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <OutfitCard
              outfit={item}
              onPress={() => router.push('/(tabs)/outfits')}
              width={200}
              height={356}
            />
          )}
        />

        {/* Últimas prendas */}
        <SectionHeader title="ÚLTIMAS PRENDAS" />
        <FlatList
          horizontal
          data={mockGarments}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.garmentCard} activeOpacity={0.8}>
              <Image
                source={{ uri: item.image_url ?? '' }}
                style={styles.garmentImage}
                resizeMode="cover"
              />
              <Text style={styles.garmentName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.garmentPrice}>€{item.price.toFixed(2)}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Marcas */}
        <SectionHeader title="LAS MARCAS QUE LA GENTE ELIGE" />
        <FlatList
          horizontal
          data={mockBrands}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.brandCard} activeOpacity={0.8}>
              <View style={styles.brandLogoPlaceholder}>
                <Text style={styles.brandInitial}>{item.name[0]}</Text>
              </View>
              <Text style={styles.brandName} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Lo último que viste */}
        <SectionHeader title="LO ÚLTIMO QUE VISTE" />
        <FlatList
          horizontal
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => String(item)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={() => (
            <View style={[styles.recentCard, { backgroundColor: colors.grisMedio }]} />
          )}
        />

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },
  scroll: { flex: 1 },
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
  },
  headerIcon: { padding: 4 },
  headerIconText: { fontSize: 22 },
  horizontalList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  garmentCard: {
    width: 115,
    marginRight: 10,
  },
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
    fontWeight: '600',
  },
  garmentPrice: {
    fontSize: 11,
    color: colors.rosaOpa,
    fontWeight: '700',
  },
  brandCard: {
    width: 115,
    marginRight: 10,
    alignItems: 'center',
  },
  brandLogoPlaceholder: {
    width: 115,
    height: 115,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.negro,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blanco,
  },
  brandInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.negro,
  },
  brandName: {
    fontSize: 11,
    color: colors.negro,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  recentCard: {
    width: 100,
    height: 140,
    borderRadius: radius.card,
    marginRight: 10,
  },
})

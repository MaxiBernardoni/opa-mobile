import React, { useRef, useState } from 'react'
import {
  View, FlatList, StyleSheet, Dimensions, TouchableOpacity, Text,
  StatusBar, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useOutfits } from '../../hooks/useOutfits'
import { OutfitScrollItem } from '../../components/outfit/OutfitScrollItem'
import { colors } from '../../constants/colors'

const CAMION_URL = 'https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/assets/camion_blanco.png'

const { height: SH } = Dimensions.get('window')

export default function OutfitsScreen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [tab, setTab] = useState<'marcas' | 'descubrir'>('descubrir')
  const { outfits, loading } = useOutfits()

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0)
  })

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.blanco} size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Floating header */}
      <SafeAreaView style={[styles.floatingHeader, { pointerEvents: 'box-none' } as any]}>
        <View style={styles.headerInner}>
          <TouchableOpacity>
            <Image source={{ uri: CAMION_URL }} style={styles.truckIcon} contentFit="contain" />
          </TouchableOpacity>
          <View style={styles.tabs}>
            <TouchableOpacity onPress={() => setTab('marcas')} style={styles.tabItem}>
              <Text style={[styles.tabText, tab === 'marcas' && styles.tabActive]}>tus marcas</Text>
            </TouchableOpacity>
            <Text style={styles.tabSep}>/</Text>
            <TouchableOpacity onPress={() => setTab('descubrir')} style={styles.tabItem}>
              <Text style={[styles.tabText, tab === 'descubrir' && styles.tabActive]}>Descubrir</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SH}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item, index }) => (
          <OutfitScrollItem outfit={item} isActive={index === activeIndex} />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.negro },
  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  truckIcon: { width: 28, height: 28 },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  tabItem: { paddingHorizontal: 4 },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500' },
  tabActive: { color: colors.blanco, fontWeight: '700' },
  tabSep: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: colors.blanco,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: colors.blanco, fontSize: 20, lineHeight: 22 },
})

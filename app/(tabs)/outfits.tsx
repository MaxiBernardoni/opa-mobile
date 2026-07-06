import React, { useEffect, useRef, useState } from 'react'
import {
  View, FlatList, StyleSheet, Dimensions, TouchableOpacity, Text,
  StatusBar, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { useOutfits } from '../../hooks/useOutfits'
import { OutfitScrollItem } from '../../components/outfit/OutfitScrollItem'
import { colors } from '../../constants/colors'

const { height: SH } = Dimensions.get('window')
const STORAGE = 'https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/assets'

export default function OutfitsScreen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [tab, setTab] = useState<'marcas' | 'descubrir'>('descubrir')
  const insets = useSafeAreaInsets()
  // La tab bar (BottomNavBar) se dibuja ENCIMA del contenido (no reserva espacio),
  // así que cada página del scroll debe medir la ventana MENOS el alto de la tab bar,
  // si no la barra de precio (bottom:0) queda tapada por la nav. El cálculo replica
  // el alto real de BottomNavBar: paddingTop 8 + iconWrap 48 + paddingBottom + borde 1.
  const tabBarHeight = 8 + 48 + (insets.bottom || 8) + 1
  const pageH = SH - tabBarHeight
  const { outfits, loading } = useOutfits()
  const { outfitId } = useLocalSearchParams<{ outfitId?: string }>()
  const flatListRef = useRef<FlatList>(null)
  const didScrollRef = useRef(false)

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0)
  })

  // Scroll to the requested outfit once data is ready
  useEffect(() => {
    if (!outfitId || loading || outfits.length === 0 || didScrollRef.current) return
    const index = outfits.findIndex((o) => o.id === outfitId)
    if (index < 0) return
    didScrollRef.current = true
    setActiveIndex(index)
    if (index === 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false })
    } else {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: false })
      }, 100)
    }
  }, [outfitId, loading, outfits])

  // Reset scroll flag when outfitId changes (new navigation)
  useEffect(() => {
    didScrollRef.current = false
  }, [outfitId])

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
            <Image
              source={{ uri: `${STORAGE}/camion_blanco.png` }}
              style={styles.truckIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
          <View style={styles.tabs}>
            <TouchableOpacity onPress={() => setTab('marcas')} style={styles.tabItem}>
              <Text style={[styles.tabText, tab === 'marcas' && styles.tabActiveText]}>tus marcas</Text>
              <View style={[styles.tabUnderline, tab === 'marcas' && styles.tabUnderlineActive]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('descubrir')} style={styles.tabItem}>
              <Text style={[styles.tabText, tab === 'descubrir' && styles.tabActiveText]}>Descubrir</Text>
              <View style={[styles.tabUnderline, tab === 'descubrir' && styles.tabUnderlineActive]} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addBtn} hitSlop={10}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={outfits}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={pageH}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({ length: pageH, offset: pageH * index, index })}
        renderItem={({ item, index }) => (
          <OutfitScrollItem outfit={item} isActive={index === activeIndex} height={pageH} />
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
  truckIcon: { width: 26, height: 26 },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  tabItem: { alignItems: 'center' },
  tabText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '500' },
  tabActiveText: { color: colors.blanco, fontWeight: '700' },
  tabUnderline: { marginTop: 3, height: 2, width: '70%', borderRadius: 1, backgroundColor: 'transparent' },
  tabUnderlineActive: { backgroundColor: colors.rosaOpa },
  addBtn: { alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: colors.blanco, fontSize: 28, fontWeight: '300', lineHeight: 30 },
})

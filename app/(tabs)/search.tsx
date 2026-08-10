import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { radius } from '../../constants/radius'
import { APP_WIDTH } from '../../constants/layout'
import { Outfit, Garment, Brand } from '../../types'

const SCREEN_WIDTH = APP_WIDTH
const CARD_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2

type SearchTab = 'outfits' | 'prendas'

const STYLE_TAGS = ['casual', 'formal', 'sporty', 'boho', 'minimalist', 'streetwear', 'vintage']
const OCCASION_TAGS = ['trabajo', 'salida', 'playa', 'fiesta', 'dia a dia', 'viaje']

export default function SearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<SearchTab>('outfits')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [garments, setGarments] = useState<(Garment & { brand?: Brand })[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const runSearch = useCallback(async (text: string, tag: string | null, searchTab: SearchTab) => {
    if (!text.trim() && !tag) {
      setOutfits([])
      setGarments([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      if (searchTab === 'outfits') {
        let q = supabase
          .from('outfits')
          .select('*, creator:perfiles(id, username, avatar_url)')
          .order('likes_count', { ascending: false })
          .limit(30)
        // Full-text search sobre title + description (search_vector, columna generada)
        if (text.trim()) q = q.textSearch('search_vector', text.trim(), { type: 'websearch', config: 'spanish' })
        if (tag) {
          q = q.or(`style.ilike.%${tag}%,occasion.ilike.%${tag}%`)
        }
        const { data } = await q
        setOutfits((data ?? []) as Outfit[])
      } else {
        let q = supabase
          .from('prendas')
          .select('*, brand:marcas(id, name, logo_url)')
          .order('created_at', { ascending: false })
          .limit(30)
        // Full-text search sobre name + description + nombre de marca (search_vector,
        // mantenida por trigger porque el nombre de marca es de otra tabla)
        if (text.trim()) q = q.textSearch('search_vector', text.trim(), { type: 'websearch', config: 'spanish' })
        if (tag) q = q.ilike('style', `%${tag}%`)
        const { data } = await q
        setGarments((data ?? []) as (Garment & { brand?: Brand })[])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      runSearch(query, activeTag, tab)
    }, 350)
    return () => clearTimeout(timeout)
  }, [query, activeTag, tab, runSearch])

  const allTags = [...STYLE_TAGS, ...OCCASION_TAGS]

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Search bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Outfits, prendas, marcas..."
            placeholderTextColor={colors.grisClaro}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['outfits', 'prendas'] as SearchTab[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.tabItem, tab === t && styles.tabItemActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tag filters */}
      <FlatList
        horizontal
        data={allTags}
        keyExtractor={(t) => t}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagList}
        renderItem={({ item: tag }) => (
          <TouchableOpacity
            style={[styles.tag, activeTag === tag && styles.tagActive]}
            onPress={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            <Text style={[styles.tagText2, activeTag === tag && styles.tagTextActive]}>#{tag}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Results */}
      {loading ? (
        <ActivityIndicator color={colors.rosaOpa} style={{ marginTop: 40 }} />
      ) : !searched ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👗</Text>
          <Text style={styles.emptyText}>Descubrí looks por estilo, ocasión o marca</Text>
        </View>
      ) : tab === 'outfits' ? (
        outfits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Sin resultados para "{query}"</Text>
          </View>
        ) : (
          <FlatList
            data={outfits}
            keyExtractor={(o) => o.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.outfitCard} onPress={() => router.push(`/outfit/${item.id}`)}>
                <Image
                  source={{ uri: item.cover_image_url ?? undefined }}
                  style={styles.outfitImage}
                  contentFit="cover"
                />
                <View style={styles.outfitMeta}>
                  <Text style={styles.outfitTitle} numberOfLines={1}>{item.title ?? 'Outfit'}</Text>
                  {(item as any).creator && (
                    <TouchableOpacity onPress={() => router.push(`/user/${(item as any).creator.id}`)} hitSlop={4}>
                      <Text style={styles.outfitCreator}>@{(item as any).creator.username}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )
      ) : (
        garments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Sin resultados para "{query}"</Text>
          </View>
        ) : (
          <FlatList
            data={garments}
            keyExtractor={(g) => g.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.outfitCard} onPress={() => router.push(`/product/${item.id}`)}>
                <Image
                  source={{ uri: item.image_url ?? undefined }}
                  style={styles.outfitImage}
                  contentFit="cover"
                />
                <View style={styles.outfitMeta}>
                  <Text style={styles.outfitTitle} numberOfLines={1}>{item.name}</Text>
                  {item.brand && <Text style={styles.outfitCreator}>{item.brand.name}</Text>}
                  <Text style={styles.garmentPrice}>${item.price.toLocaleString('es-AR')}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },

  searchBarWrapper: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grisBorde,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: 15, color: colors.negro },
  clearBtn: { fontSize: 14, color: colors.grisClaro, padding: 4 },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.grisBorde, marginHorizontal: spacing.lg },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: colors.rosaOpa },
  tabText: { fontSize: 14, color: colors.grisClaro, fontWeight: '500' },
  tabTextActive: { color: colors.rosaOpa, fontWeight: '700' },

  tagList: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.tag,
    borderWidth: 1,
    borderColor: colors.bordeTag,
    backgroundColor: colors.blanco,
  },
  tagActive: { backgroundColor: colors.negro, borderColor: colors.negro },
  tagText2: { fontSize: 12, color: colors.grisOscuro },
  tagTextActive: { color: colors.blanco },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 14, color: colors.grisClaro, textAlign: 'center', maxWidth: 240 },

  grid: { padding: spacing.lg, gap: spacing.sm },
  row: { gap: spacing.sm },
  outfitCard: { width: CARD_SIZE, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.grisBorde },
  outfitImage: { width: CARD_SIZE, height: CARD_SIZE * 1.3 },
  outfitMeta: { padding: spacing.sm },
  outfitTitle: { fontSize: 13, fontWeight: '600', color: colors.negro },
  outfitCreator: { fontSize: 11, color: colors.grisClaro, marginTop: 2 },
  garmentPrice: { fontSize: 12, fontWeight: '700', color: colors.rosaOpa, marginTop: 2 },
})

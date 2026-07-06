import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useWardrobe } from '../../hooks/useWardrobe'
import { useAuthStore } from '../../store/useAuthStore'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { radius } from '../../constants/radius'
import { APP_WIDTH } from '../../constants/layout'
import { WardrobeItem, Garment, Brand } from '../../types'

const SCREEN_WIDTH = APP_WIDTH
const NUM_COLS = 3
const CARD_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * (NUM_COLS - 1)) / NUM_COLS

const SLOTS = [
  { key: 'all', label: 'Todo' },
  { key: 'torso', label: 'Torso' },
  { key: 'piernas', label: 'Piernas' },
  { key: 'calzado', label: 'Calzado' },
  { key: 'extras', label: 'Extras' },
]

export default function WardrobeScreen() {
  const router = useRouter()
  const { session, initialized } = useAuthStore()
  const { items, loading } = useWardrobe(session?.user.id)
  const [activeSlot, setActiveSlot] = useState('all')

  if (!initialized) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.rosaOpa} style={{ flex: 1 }} />
      </SafeAreaView>
    )
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>👚</Text>
          <Text style={styles.emptyText}>Iniciá sesión para ver tu armario</Text>
        </View>
      </SafeAreaView>
    )
  }

  const filtered = activeSlot === 'all'
    ? items
    : items.filter((item) => (item as any).slot === activeSlot)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Mi Armario</Text>
        <Text style={styles.count}>{items.length} {items.length === 1 ? 'prenda' : 'prendas'}</Text>
      </View>

      {/* Slot filter */}
      <FlatList
        horizontal
        data={SLOTS}
        keyExtractor={(s) => s.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.slotList}
        renderItem={({ item: slot }) => (
          <TouchableOpacity
            style={[styles.slotChip, activeSlot === slot.key && styles.slotChipActive]}
            onPress={() => setActiveSlot(slot.key)}
          >
            <Text style={[styles.slotChipText, activeSlot === slot.key && styles.slotChipTextActive]}>
              {slot.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={colors.rosaOpa} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>👚</Text>
          <Text style={styles.emptyText}>
            {items.length === 0
              ? 'Tu armario está vacío.\nAgregá prendas desde el detalle de cada prenda.'
              : `Nada en ${SLOTS.find((s) => s.key === activeSlot)?.label ?? activeSlot}.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <WardrobeCard
              item={item as WardrobeItem & { garment?: Garment & { brand?: Brand } }}
              onPress={() => router.push(`/product/${item.garment_id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  )
}

// ─── WardrobeCard ─────────────────────────────────────────────────────────────

type WardrobeCardItem = WardrobeItem & { garment?: Garment & { brand?: Brand } }

function WardrobeCard({ item, onPress }: { item: WardrobeCardItem; onPress: () => void }) {
  const g = item.garment
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: g?.image_url ?? undefined }}
        style={styles.cardImage}
        contentFit="cover"
      />
      {g && (
        <View style={styles.cardMeta}>
          <Text style={styles.cardName} numberOfLines={1}>{g.name}</Text>
          {g.brand && <Text style={styles.cardBrand} numberOfLines={1}>{g.brand.name}</Text>}
        </View>
      )}
    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 14, color: colors.grisClaro, textAlign: 'center', lineHeight: 20, maxWidth: 240 },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.negro },
  count: { fontSize: 13, color: colors.grisClaro },

  slotList: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  slotChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.grisMedio,
  },
  slotChipActive: { backgroundColor: colors.negro, borderColor: colors.negro },
  slotChipText: { fontSize: 13, fontWeight: '600', color: colors.grisOscuro },
  slotChipTextActive: { color: colors.blanco },

  grid: { padding: spacing.lg, gap: spacing.sm },
  row: { gap: spacing.sm },
  card: { width: CARD_SIZE, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.grisBorde },
  cardImage: { width: CARD_SIZE, height: CARD_SIZE * 1.25 },
  cardMeta: { padding: spacing.xs },
  cardName: { fontSize: 11, fontWeight: '600', color: colors.negro },
  cardBrand: { fontSize: 10, color: colors.grisClaro, marginTop: 1 },
})

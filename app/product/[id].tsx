import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { useSizeGuide } from '../../hooks/useSizeGuide'
import { useRecommendedSize } from '../../hooks/useRecommendedSize'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { radius } from '../../constants/radius'
import { Garment, Brand, SizeGuideEntry } from '../../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const [garment, setGarment] = useState<Garment & { brand?: Brand } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeSheetVisible, setSizeSheetVisible] = useState(false)

  const { guide, entries, loading: guideLoading } = useSizeGuide(garment?.size_guide_id)
  const { recommendation } = useRecommendedSize(garment?.size_guide_id)

  useEffect(() => {
    if (!id) return
    fetchGarment(id)
  }, [id])

  async function fetchGarment(garmentId: string) {
    setLoading(true)
    const { data } = await supabase
      .from('prendas')
      .select('*, brand:marcas(*)')
      .eq('id', garmentId)
      .maybeSingle()
    setGarment(data as (Garment & { brand?: Brand }) | null)
    setLoading(false)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.rosaOpa} style={{ flex: 1 }} />
      </SafeAreaView>
    )
  }

  if (!garment) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Prenda no encontrada</Text>
        </View>
      </SafeAreaView>
    )
  }

  const availableSizes: string[] = garment.available_sizes ?? []

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{garment.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <Image
          source={{ uri: garment.image_url ?? undefined }}
          style={styles.image}
          contentFit="cover"
        />

        <View style={styles.body}>
          {/* Brand */}
          {garment.brand && (
            <TouchableOpacity
              style={styles.brandRow}
              activeOpacity={0.7}
              onPress={() => router.push(`/marca/${garment.brand!.id}`)}
            >
              {garment.brand.logo_url ? (
                <Image source={{ uri: garment.brand.logo_url }} style={styles.brandLogo} contentFit="cover" />
              ) : (
                <View style={[styles.brandLogo, styles.brandLogoPlaceholder]}>
                  <Text style={styles.brandLogoInitial}>{garment.brand.name[0]}</Text>
                </View>
              )}
              <Text style={styles.brandName}>{garment.brand.name}</Text>
            </TouchableOpacity>
          )}

          {/* Name + price */}
          <Text style={styles.garmentName}>{garment.name}</Text>
          <Text style={styles.price}>${garment.price.toLocaleString('es-AR')}</Text>

          {/* Description */}
          {garment.description && (
            <Text style={styles.description}>{garment.description}</Text>
          )}

          {/* Size selector */}
          {availableSizes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sizeHeader}>
                <Text style={styles.sectionTitle}>TALLE</Text>
                {garment.size_guide_id && (
                  <TouchableOpacity onPress={() => setSizeSheetVisible(true)} style={styles.infoBtn}>
                    <Text style={styles.infoBtnText}>ⓘ Guía de talles</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.sizeRow}>
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size
                  const isRecommended = recommendation?.size_label === size
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      style={[
                        styles.sizeChip,
                        isSelected && styles.sizeChipSelected,
                        isRecommended && !isSelected && styles.sizeChipRecommended,
                      ]}
                    >
                      <Text style={[
                        styles.sizeChipText,
                        isSelected && styles.sizeChipTextSelected,
                      ]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
              {recommendation && (
                <Text style={styles.recommendedHint}>
                  Tu talle recomendado: <Text style={styles.recommendedBold}>{recommendation.size_label}</Text>
                </Text>
              )}
            </View>
          )}

          {/* Tags */}
          {(garment.style || garment.category) && (
            <View style={styles.tagRow}>
              {garment.category && <View style={styles.tag}><Text style={styles.tagText}>{garment.category}</Text></View>}
              {garment.style && <View style={styles.tag}><Text style={styles.tagText}>{garment.style}</Text></View>}
            </View>
          )}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        {garment.sale_mode === 'redirect' ? (
          <TouchableOpacity style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>Ver en tienda →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.ctaBtn, !selectedSize && availableSizes.length > 0 && styles.ctaBtnDisabled]}
            disabled={availableSizes.length > 0 && !selectedSize}
          >
            <Text style={styles.ctaBtnText}>Agregar al carrito</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Size Guide Sheet */}
      <SizeGuideSheet
        visible={sizeSheetVisible}
        onClose={() => setSizeSheetVisible(false)}
        guide={guide}
        entries={entries}
        loading={guideLoading}
        recommendedSize={recommendation?.size_label ?? null}
        category={garment.category}
      />
    </SafeAreaView>
  )
}

// ─── SizeGuideSheet ───────────────────────────────────────────────────────────

interface SizeGuideSheetProps {
  visible: boolean
  onClose: () => void
  guide: { name: string; category: string } | null
  entries: SizeGuideEntry[]
  loading: boolean
  recommendedSize: string | null
  category: string | null
}

function SizeGuideSheet({ visible, onClose, guide, entries, loading, recommendedSize, category }: SizeGuideSheetProps) {
  const cols = measurementCols(category)

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <TouchableOpacity style={styles.sheetOverlay} onPress={onClose} activeOpacity={1} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Guía de talles</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.sheetClose}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.rosaOpa} style={{ marginVertical: 32 }} />
        ) : entries.length === 0 ? (
          <Text style={styles.sheetEmpty}>No hay datos disponibles.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Column headers */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.tableCellHeader, styles.tableCellLabel]}>
                  <Text style={styles.tableHeaderText}>TALLE</Text>
                </View>
                {cols.map((col) => (
                  <View key={col.key} style={[styles.tableCell, styles.tableCellHeader]}>
                    <Text style={styles.tableHeaderText}>{col.label}</Text>
                  </View>
                ))}
              </View>
              {/* Rows */}
              {entries.map((entry) => {
                const isRecommended = entry.size_label === recommendedSize
                return (
                  <View key={entry.id} style={[styles.tableRow, isRecommended && styles.tableRowRecommended]}>
                    <View style={[styles.tableCell, styles.tableCellLabel]}>
                      <Text style={[styles.tableCellText, styles.tableCellLabelText, isRecommended && styles.tableCellTextRecommended]}>
                        {entry.size_label}
                      </Text>
                    </View>
                    {cols.map((col) => {
                      const minKey = `${col.key}_min` as keyof SizeGuideEntry
                      const maxKey = `${col.key}_max` as keyof SizeGuideEntry
                      const min = entry[minKey] as number | null
                      const max = entry[maxKey] as number | null
                      const value = min != null && max != null ? `${min}–${max}` : min != null ? `${min}+` : '—'
                      return (
                        <View key={col.key} style={styles.tableCell}>
                          <Text style={[styles.tableCellText, isRecommended && styles.tableCellTextRecommended]}>
                            {value}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                )
              })}
            </View>
          </ScrollView>
        )}

        {recommendedSize && (
          <View style={styles.sheetRecommendedBanner}>
            <Text style={styles.sheetRecommendedText}>
              Tu talle recomendado: <Text style={{ fontWeight: '700' }}>{recommendedSize}</Text>
            </Text>
          </View>
        )}
      </View>
    </Modal>
  )
}

function measurementCols(category: string | null) {
  if (category === 'calzado') return [{ key: 'foot_length', label: 'Pie (cm)' }]
  if (category === 'piernas' || category === 'bottoms') {
    return [
      { key: 'waist', label: 'Cintura' },
      { key: 'hip', label: 'Cadera' },
      { key: 'thigh', label: 'Muslo' },
    ]
  }
  // default: tops
  return [
    { key: 'chest', label: 'Busto' },
    { key: 'waist', label: 'Cintura' },
    { key: 'hip', label: 'Cadera' },
  ]
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.grisClaro, fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.grisBorde,
  },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  backText: { fontSize: 22, color: colors.negro },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', color: colors.negro },

  image: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.1, backgroundColor: colors.grisBorde },

  body: { padding: spacing.lg },

  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  brandLogo: { width: 28, height: 28, borderRadius: radius.avatar, marginRight: spacing.sm, backgroundColor: colors.grisBorde },
  brandLogoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  brandLogoInitial: { fontSize: 12, fontWeight: '700', color: colors.grisClaro },
  brandName: { fontSize: 13, color: colors.grisOscuro, fontWeight: '500' },

  garmentName: { fontSize: 22, fontWeight: '800', color: colors.negro, marginBottom: spacing.xs },
  price: { fontSize: 20, fontWeight: '700', color: colors.rosaOpa, marginBottom: spacing.md },
  description: { fontSize: 14, color: colors.grisOscuro, lineHeight: 20, marginBottom: spacing.lg },

  section: { marginBottom: spacing.lg },
  sizeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.negro, letterSpacing: 1 },
  infoBtn: { flexDirection: 'row', alignItems: 'center' },
  infoBtnText: { fontSize: 12, color: colors.rosaOpa, fontWeight: '500' },

  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sizeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    borderWidth: 1.5,
    borderColor: colors.grisMedio,
    backgroundColor: colors.blanco,
  },
  sizeChipSelected: { borderColor: colors.negro, backgroundColor: colors.negro },
  sizeChipRecommended: { borderColor: colors.rosaOpa, borderWidth: 2 },
  sizeChipText: { fontSize: 13, fontWeight: '600', color: colors.negro },
  sizeChipTextSelected: { color: colors.blanco },

  recommendedHint: { fontSize: 12, color: colors.grisClaro, marginTop: spacing.sm },
  recommendedBold: { color: colors.rosaOpa, fontWeight: '700' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.tag,
    borderWidth: 1,
    borderColor: colors.bordeTag,
  },
  tagText: { fontSize: 12, color: colors.grisOscuro },

  cta: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.grisBorde,
  },
  ctaBtn: {
    backgroundColor: colors.rosaOpa,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaBtnDisabled: { backgroundColor: colors.grisMedio },
  ctaBtnText: { color: colors.blanco, fontSize: 15, fontWeight: '700' },

  // Sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.blanco,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.grisMedio, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.negro },
  sheetClose: { fontSize: 18, color: colors.grisClaro, padding: 4 },
  sheetEmpty: { textAlign: 'center', color: colors.grisClaro, padding: spacing.xl },

  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.grisBorde },
  tableRowRecommended: { backgroundColor: colors.rosaOpaLight },
  tableCell: { width: 80, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, alignItems: 'center' },
  tableCellHeader: { backgroundColor: colors.grisBorde },
  tableCellLabel: { width: 64 },
  tableHeaderText: { fontSize: 10, fontWeight: '700', color: colors.grisOscuro, letterSpacing: 0.5 },
  tableCellText: { fontSize: 13, color: colors.negro },
  tableCellLabelText: { fontWeight: '700' },
  tableCellTextRecommended: { color: colors.rosaOpa, fontWeight: '700' },

  sheetRecommendedBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.rosaOpaLight,
    borderRadius: radius.card,
    alignItems: 'center',
  },
  sheetRecommendedText: { fontSize: 14, color: colors.rosaOpa },
})

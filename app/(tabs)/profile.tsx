import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  StatusBar, ScrollView, FlatList, ActivityIndicator, Alert, Dimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { radius } from '../../constants/radius'
import { useOutfits } from '../../hooks/useOutfits'
import { useSavedOutfits } from '../../hooks/useSavedOutfits'
import { useAuthStore } from '../../store/useAuthStore'
import { supabase } from '../../lib/supabase'

const SCREEN_WIDTH = Dimensions.get('window').width
// 3 cards + 2 gaps of 4 + 2 side paddings of spacing.md (12)
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - spacing.md * 2 - 4 * 2) / 3)

const PROFILE_TABS = ['Grid', 'Favoritos', 'Pedidos']
const PROFILE_ICONS = ['⊞', '★', '📦']

export default function ProfileScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const { session, profile, initialized, clear } = useAuthStore()
  const { outfits, loading: outfitsLoading } = useOutfits(session?.user.id)
  const { outfits: savedOutfits, loading: savedLoading } = useSavedOutfits(session?.user.id)

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro/a?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          clear()
        },
      },
    ])
  }

  // Show spinner while initializing auth
  if (!initialized) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.rosaOpa} size="large" />
      </SafeAreaView>
    )
  }

  // Not logged in — show auth gate
  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.gateContainer}>
          <Image
            source={{ uri: 'https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/assets/logoOPA-transparente.png' }}
            style={styles.gateLogo}
            contentFit="contain"
          />
          <Text style={styles.gateTitle}>Tu perfil te espera</Text>
          <Text style={styles.gateSubtitle}>
            Iniciá sesión para ver tu armario, tus outfits guardados y seguir a tus marcas favoritas.
          </Text>
          <TouchableOpacity
            style={styles.gateBtn}
            onPress={() => router.push('/auth')}
            activeOpacity={0.85}
          >
            <Text style={styles.gateBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gateSecondaryBtn}
            onPress={() => router.push('/auth')}
            activeOpacity={0.85}
          >
            <Text style={styles.gateSecondaryBtnText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Logged in — show full profile
  const displayUsername = profile?.username ?? session.user.email?.split('@')[0] ?? 'usuario'
  const displayName = profile?.display_name ?? ''
  const bio = profile?.bio ?? ''
  const tags = profile?.tags ?? []
  const avatarUrl = profile?.avatar_url

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Settings */}
        <View style={styles.settingsRow}>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + info */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {displayUsername[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>@{displayUsername}</Text>
          {displayName ? <Text style={styles.fullName}>{displayName}</Text> : null}
          {bio ? <Text style={styles.bio}>{bio}</Text> : null}
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Seguidores', value: profile?.followers_count ?? 0 },
            { label: 'Seguidos', value: profile?.following_count ?? 0 },
            { label: 'Outfits', value: profile?.outfits_count ?? 0 },
            { label: 'Guardados', value: 0 },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Profile navbar */}
        <View style={styles.profileNav}>
          {PROFILE_TABS.map((tab, i) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(i)}
              style={styles.profileNavItem}
            >
              <Text style={[styles.profileNavIcon, activeTab === i && styles.profileNavIconActive]}>
                {PROFILE_ICONS[i]}
              </Text>
              <Text style={[styles.profileNavLabel, activeTab === i && styles.profileNavLabelActive]}>
                {tab}
              </Text>
              {activeTab === i && <View style={styles.profileNavIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content per tab */}
        {activeTab === 0 && (
          outfitsLoading ? (
            <ActivityIndicator color={colors.rosaOpa} style={{ marginTop: 32 }} />
          ) : outfits.length === 0 ? (
            <View style={styles.emptyTab}>
              <Text style={styles.emptyTabIcon}>🎽</Text>
              <Text style={styles.emptyTabText}>Todavía no publicaste outfits</Text>
            </View>
          ) : (
            <FlatList
              data={outfits}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.grid}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.gridCard}
                  activeOpacity={0.85}
                  onPress={() => router.push({
                    pathname: '/user-outfits',
                    params: { userId: session!.user.id, startIndex: String(outfits.indexOf(item)) },
                  })}
                >
                  <Image
                    source={{ uri: item.cover_image_url ?? `https://picsum.photos/seed/${item.id}/130/231` }}
                    style={styles.gridImage}
                    contentFit="cover"
                  />
                  <View style={styles.likesRow}>
                    <Text style={styles.likesText}>♡ {item.likes_count}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )
        )}
        {activeTab === 1 && (
          savedLoading ? (
            <ActivityIndicator color={colors.rosaOpa} style={{ marginTop: 32 }} />
          ) : savedOutfits.length === 0 ? (
            <View style={styles.emptyTab}>
              <Text style={styles.emptyTabIcon}>★</Text>
              <Text style={styles.emptyTabText}>Todavía no guardaste outfits</Text>
            </View>
          ) : (
            <FlatList
              data={savedOutfits}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.grid}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.gridCard}
                  activeOpacity={0.85}
                  onPress={() => router.push({
                    pathname: '/user-outfits',
                    params: { userId: session!.user.id, startIndex: String(index) },
                  })}
                >
                  <Image
                    source={{ uri: item.cover_image_url ?? `https://picsum.photos/seed/${item.id}/130/231` }}
                    style={styles.gridImage}
                    contentFit="cover"
                  />
                  <View style={styles.likesRow}>
                    <Text style={styles.likesText}>♡ {item.likes_count}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )
        )}
        {activeTab === 2 && (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyTabIcon}>📦</Text>
            <Text style={styles.emptyTabText}>No tenés pedidos activos</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },

  // Auth gate
  gateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  gateLogo: {
    width: 160,
    height: 80,
    marginBottom: spacing.sm,
  },
  gateTitle: {
    fontSize: 22,
    fontFamily: fonts.palanquinDark,
    color: colors.negro,
    textAlign: 'center',
  },
  gateSubtitle: {
    fontSize: 14,
    color: colors.grisClaro,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  gateBtn: {
    backgroundColor: colors.rosaOpa,
    borderRadius: radius.button,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  gateBtnText: {
    color: colors.blanco,
    fontSize: 15,
    fontFamily: fonts.palanquinDark,
  },
  gateSecondaryBtn: {
    borderWidth: 1,
    borderColor: colors.rosaOpa,
    borderRadius: radius.button,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  gateSecondaryBtnText: {
    color: colors.rosaOpa,
    fontSize: 15,
    fontFamily: fonts.palanquinDark,
  },

  // Profile content
  settingsRow: { alignItems: 'flex-end', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  settingsIcon: { fontSize: 22, color: colors.negro },
  headerSection: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  avatarContainer: { marginBottom: spacing.sm },
  avatar: {
    width: 110, height: 110,
    borderRadius: radius.avatar,
    backgroundColor: colors.grisMedio,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.rosaOpaLight,
  },
  avatarInitial: {
    fontSize: 40,
    fontFamily: fonts.mergeOne,
    color: colors.rosaOpa,
  },
  username: { fontSize: 18, fontFamily: fonts.palanquinDark, color: colors.negro, marginBottom: 2 },
  fullName: { fontSize: 14, color: colors.grisClaro, marginBottom: spacing.sm },
  bio: {
    fontSize: 13, color: colors.grisOscuro, textAlign: 'center',
    maxWidth: 260, lineHeight: 18, marginBottom: spacing.md,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tag: {
    borderWidth: 1, borderColor: colors.bordeTag,
    borderRadius: radius.tag, paddingHorizontal: 12, paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: colors.grisOscuro },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.grisBorde,
    paddingVertical: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.negro },
  statLabel: { fontSize: 10, color: colors.grisClaro, marginTop: 2 },
  profileNav: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.grisBorde, marginBottom: spacing.md },
  profileNavItem: { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
  profileNavIcon: { fontSize: 18, color: colors.grisClaro },
  profileNavIconActive: { color: colors.rosaOpa },
  profileNavLabel: { fontSize: 10, color: colors.grisClaro, marginTop: 2 },
  profileNavLabelActive: { color: colors.rosaOpa },
  profileNavIndicator: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2, backgroundColor: colors.rosaOpa, borderRadius: 1,
  },
  grid: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  gridRow: { gap: 4, marginBottom: 4 },
  gridCard: { width: CARD_WIDTH, height: CARD_WIDTH * (16 / 9), borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.grisMedio },
  gridImage: { width: '100%', height: '100%' },
  likesRow: { position: 'absolute', bottom: 6, left: 6 },
  likesText: { color: colors.blanco, fontSize: 11, fontWeight: '600' },
  emptyTab: { padding: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  emptyTabIcon: { fontSize: 36 },
  emptyTabText: { color: colors.grisClaro, fontSize: 14, textAlign: 'center' },
})

import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity,
  Image, StatusBar, ScrollView,
} from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { radius } from '../../constants/radius'
import { mockProfile, mockOutfits } from '../../constants/mockData'

const PROFILE_TABS = ['Grid', 'Favoritos', 'Pedidos']
const PROFILE_ICONS = ['⊞', '♡', '📦']

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState(0)

  const numCols = 3
  const cardWidth = 130

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Settings */}
        <View style={styles.settingsRow}>
          <TouchableOpacity>
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + info */}
        <View style={styles.headerSection}>
          <Image
            source={{ uri: mockProfile.avatar_url ?? '' }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{mockProfile.username}</Text>
          <Text style={styles.fullName}>{mockProfile.full_name}</Text>
          <Text style={styles.bio}>{mockProfile.bio}</Text>

          {/* Style tags */}
          <View style={styles.tagsRow}>
            {mockProfile.style_tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Seguidores', value: mockProfile.followers_count },
            { label: 'Seguidos', value: mockProfile.following_count },
            { label: 'Outfits', value: mockProfile.outfits_count },
            { label: 'Guardados', value: 34 },
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

        {/* Outfit grid */}
        {activeTab === 0 && (
          <View style={styles.grid}>
            {mockOutfits.map((outfit) => (
              <TouchableOpacity key={outfit.id} style={styles.gridCard} activeOpacity={0.85}>
                <Image
                  source={{ uri: outfit.image_url }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <View style={styles.likesRow}>
                  <Text style={styles.likesText}>♡ {outfit.likes_count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {activeTab === 1 && (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyTabText}>Todavía no guardaste outfits</Text>
          </View>
        )}
        {activeTab === 2 && (
          <View style={styles.emptyTab}>
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
  settingsRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  settingsIcon: { fontSize: 22, color: colors.negro },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: radius.avatar,
    backgroundColor: colors.grisMedio,
    marginBottom: spacing.sm,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.negro,
    marginBottom: 2,
  },
  fullName: {
    fontSize: 14,
    color: colors.grisClaro,
    marginBottom: spacing.sm,
  },
  bio: {
    fontSize: 13,
    color: colors.grisOscuro,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.bordeTag,
    borderRadius: radius.tag,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: colors.grisOscuro },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.grisBorde,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.negro },
  statLabel: { fontSize: 10, color: colors.grisClaro, marginTop: 2 },
  profileNav: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.grisBorde,
    marginBottom: spacing.md,
  },
  profileNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  profileNavIcon: { fontSize: 18, color: colors.grisClaro },
  profileNavIconActive: { color: colors.rosaOpa },
  profileNavLabel: { fontSize: 10, color: colors.grisClaro, marginTop: 2 },
  profileNavLabelActive: { color: colors.rosaOpa },
  profileNavIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: colors.rosaOpa,
    borderRadius: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  gridCard: {
    width: 130,
    height: 231,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.grisMedio,
  },
  gridImage: { width: '100%', height: '100%' },
  likesRow: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  likesText: { color: colors.blanco, fontSize: 11, fontWeight: '600' },
  emptyTab: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTabText: { color: colors.grisClaro, fontSize: 14 },
})

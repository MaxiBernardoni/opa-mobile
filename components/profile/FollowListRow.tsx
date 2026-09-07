import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useFollow } from '../../hooks/useFollow'
import { useAuthStore } from '../../store/useAuthStore'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { radius } from '../../constants/radius'
import { spacing } from '../../constants/spacing'
import { FollowListItem } from '../../hooks/useFollowList'

interface Props {
  item: FollowListItem
}

export function FollowListRow({ item }: Props) {
  const router = useRouter()
  const { session, profile: viewerProfile } = useAuthStore()
  const viewerIsBrand = !!viewerProfile?.is_brand
  const isSelf = session?.user.id === item.id
  const { following, toggle } = useFollow(item.id)

  function goToProfile() {
    if (item.is_brand && item.brandId) router.push(`/marca/${item.brandId}`)
    else router.push(`/user/${item.id}`)
  }

  const displayName = item.display_name || item.username

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={goToProfile}>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{(item.username[0] ?? '?').toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.username} numberOfLines={1}>{item.username}</Text>
        {displayName !== item.username ? (
          <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
        ) : null}
      </View>
      {!isSelf && !viewerIsBrand && (
        <TouchableOpacity
          style={[styles.followBtn, following && styles.followBtnActive]}
          onPress={(e) => { e.stopPropagation(); toggle() }}
          activeOpacity={0.85}
        >
          <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
            {following ? 'Siguiendo' : 'Seguir'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  avatar: { width: 48, height: 48, borderRadius: radius.avatar, backgroundColor: colors.grisMedio, flexShrink: 0 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.rosaOpaLight },
  avatarInitial: { fontSize: 18, fontFamily: fonts.mergeOne, color: colors.rosaOpa },
  info: { flex: 1, gap: 1 },
  username: { fontSize: 14, fontFamily: fonts.palanquinDark, color: colors.negro },
  name: { fontSize: 12, color: colors.grisClaro },
  followBtn: {
    borderWidth: 1,
    borderColor: colors.rosaOpa,
    borderRadius: radius.button,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  followBtnActive: { borderColor: colors.grisBorde, backgroundColor: colors.grisBorde },
  followBtnText: { color: colors.rosaOpa, fontSize: 12, fontFamily: fonts.palanquinDark },
  followBtnTextActive: { color: colors.grisOscuro },
})

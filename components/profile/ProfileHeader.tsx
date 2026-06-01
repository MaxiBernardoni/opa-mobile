import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Avatar } from '../ui/Avatar'
import { Tag } from '../ui/Tag'
import { Profile } from '../../types'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <Avatar uri={profile.avatar_url} size={110} />
      <Text style={styles.username}>@{profile.username}</Text>
      {profile.display_name && <Text style={styles.displayName}>{profile.display_name}</Text>}
      {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      {profile.tags?.length > 0 && (
        <View style={styles.tags}>
          {profile.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  username: {
    fontSize: 18,
    fontFamily: fonts.palanquinDark,
    color: colors.negro,
  },
  displayName: {
    fontSize: 14,
    color: colors.grisClaro,
  },
  bio: {
    fontSize: 13,
    color: colors.grisOscuro,
    textAlign: 'center',
    lineHeight: 18,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
})

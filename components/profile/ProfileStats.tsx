import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Profile } from '../../types'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'

interface ProfileStatsProps {
  profile: Profile
  savedCount?: number
}

export function ProfileStats({ profile, savedCount = 0 }: ProfileStatsProps) {
  const stats = [
    { label: 'Seguidores', value: profile.followers_count },
    { label: 'Seguidos', value: profile.following_count },
    { label: 'Outfits', value: profile.outfits_count },
    { label: 'Guardados', value: savedCount },
  ]

  return (
    <View style={styles.container}>
      {stats.map((stat, i) => (
        <React.Fragment key={stat.label}>
          {i > 0 && <View style={styles.divider} />}
          <View style={styles.stat}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.grisBorde,
  },
  stat: { alignItems: 'center', gap: 2 },
  value: {
    fontSize: 18,
    fontFamily: fonts.mergeOne,
    color: colors.negro,
  },
  label: {
    fontSize: 11,
    color: colors.grisClaro,
  },
  divider: {
    width: 1,
    backgroundColor: colors.grisBorde,
  },
})

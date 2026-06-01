import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'

interface Tab {
  key: string
  icon: React.ReactNode
}

interface ProfileNavbarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
}

export function ProfileNavbar({ tabs, activeTab, onTabChange }: ProfileNavbarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
        >
          {tab.icon}
          {activeTab === tab.key && <View style={styles.indicator} />}
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.grisBorde,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  indicator: {
    width: 24,
    height: 2,
    backgroundColor: colors.rosaOpa,
    borderRadius: 1,
  },
})

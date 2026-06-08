import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors } from '../../constants/colors'

const STORAGE = 'https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/assets/nav'

const TAB_ICONS: Record<string, { default: string; active: string }> = {
  index:    { default: `${STORAGE}/home.png`,    active: `${STORAGE}/home_rosa.png` },
  outfits:  { default: `${STORAGE}/outfit.png`,  active: `${STORAGE}/outfit_rosa.png` },
  search:   { default: `${STORAGE}/search.png`,  active: `${STORAGE}/search_rosa.png` },
  wardrobe: { default: `${STORAGE}/armario.png`, active: `${STORAGE}/armario_rosa.png` },
  profile:  { default: `${STORAGE}/user.png`,    active: `${STORAGE}/user_rosa.png` },
}

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index
        const isCenter = route.name === 'outfits'
        const icons = TAB_ICONS[route.name]

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
        }

        if (isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabCenter}
              activeOpacity={0.7}
            >
              {/* tintColor as direct prop (not style) — works on web + native */}
              <Image
                source={{ uri: icons?.default }}
                style={styles.iconCenter}
                contentFit="contain"
                tintColor={colors.blanco}
              />
            </TouchableOpacity>
          )
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            {/* Active highlight on icon container only, not full tab */}
            <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
              <Image
                source={{ uri: isFocused ? icons?.active : icons?.default }}
                style={styles.icon}
                contentFit="contain"
              />
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.blanco,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginHorizontal: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: colors.rosaOpaLight,
  },
  tabCenter: {
    backgroundColor: colors.rosaOpa,
    borderRadius: 14,
    marginHorizontal: 4,
    marginTop: -18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: colors.rosaOpa,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: { width: 24, height: 24 },
  iconCenter: { width: 26, height: 26 },
})

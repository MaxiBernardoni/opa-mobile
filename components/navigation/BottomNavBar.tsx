import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors } from '../../constants/colors'
import { useAuthStore } from '../../store/useAuthStore'

const STORAGE = 'https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/assets/nav'

const TAB_ICONS: Record<string, { default: string; active: string }> = {
  index:    { default: `${STORAGE}/home.png`,    active: `${STORAGE}/home_rosa.png` },
  outfits:  { default: `${STORAGE}/outfit_v2.png`,  active: `${STORAGE}/outfit_rosa_v2.png` },
  search:   { default: `${STORAGE}/search.png`,  active: `${STORAGE}/search_rosa.png` },
  wardrobe: { default: `${STORAGE}/armario.png`, active: `${STORAGE}/armario_rosa.png` },
  profile:  { default: `${STORAGE}/user.png`,    active: `${STORAGE}/user_rosa.png` },
}

export function BottomNavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { profile } = useAuthStore()
  // Las cuentas de marca no acceden a la sección de feed (no pueden like/save/follow).
  const routes = profile?.is_brand ? state.routes.filter((r) => r.name !== 'outfits') : state.routes

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {routes.map((route) => {
        const index = state.routes.indexOf(route)
        const isFocused = state.index === index
        const icons = TAB_ICONS[route.name]

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
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
    borderTopWidth: 1,
    borderTopColor: colors.grisBorde,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.rosaOpaLight,
  },
  icon: {
    width: 28,
    height: 28,
  },
})

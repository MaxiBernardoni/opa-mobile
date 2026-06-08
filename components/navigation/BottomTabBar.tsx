import React from 'react'
import { View, TouchableOpacity, StyleSheet, Image as RNImage } from 'react-native'
import { Image } from 'expo-image'
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
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index
        const isCenter = route.name === 'outfits'
        const icons = TAB_ICONS[route.name]

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[styles.tab, isCenter && styles.tabCenter, isFocused && !isCenter && styles.tabActive]}
            activeOpacity={0.7}
          >
            {isCenter ? (
              <RNImage
                source={{ uri: icons?.default }}
                style={styles.iconCenter}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={{ uri: isFocused ? icons?.active : icons?.default }}
                style={styles.icon}
                contentFit="contain"
              />
            )}
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
    borderTopColor: '#E8E8E8',
    paddingBottom: 24,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  tabActive: { backgroundColor: colors.rosaOpaLight },
  tabCenter: {
    backgroundColor: colors.rosaOpa,
    borderRadius: 14,
    marginHorizontal: 4,
    marginTop: -18,
    shadowColor: colors.rosaOpa,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
    paddingVertical: 14,
  },
  icon: { width: 24, height: 24 },
  iconCenter: { width: 26, height: 26, tintColor: colors.blanco },
})

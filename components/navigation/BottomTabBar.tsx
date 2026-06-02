import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Image as RNImage } from 'react-native'
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

const TAB_LABELS: Record<string, string> = {
  index:    'Home',
  outfits:  'OPA',
  search:   'Buscar',
  wardrobe: 'Armario',
  profile:  'Perfil',
}

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
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
            style={[styles.tab, isFocused && !isCenter && styles.tabActive]}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isCenter && styles.iconCenter]}>
              {isCenter ? (
                <RNImage
                  source={{ uri: icons?.default }}
                  style={styles.iconImgCenter}
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={{ uri: isFocused ? icons?.active : icons?.default }}
                  style={styles.iconImg}
                  contentFit="contain"
                />
              )}
            </View>
            {!isCenter && (
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {TAB_LABELS[route.name] ?? route.name}
              </Text>
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
    borderTopColor: colors.negro,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: colors.rosaOpaLight,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCenter: {
    width: 50,
    height: 50,
    backgroundColor: colors.rosaOpa,
    borderRadius: 12,
    marginTop: -20,
    shadowColor: colors.rosaOpa,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    padding: 10,
  },
  iconImg: {
    width: 22,
    height: 22,
  },
  iconImgCenter: {
    width: 26,
    height: 26,
    tintColor: colors.blanco,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    color: colors.grisClaro,
  },
  labelActive: {
    color: colors.rosaOpa,
  },
})

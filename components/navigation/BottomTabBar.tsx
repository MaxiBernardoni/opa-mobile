import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'

const TAB_ICONS: Record<string, string> = {
  index: '⌂',
  outfits: '◈',
  search: '⊕',
  wardrobe: '▣',
  profile: '○',
}

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  outfits: 'OPA',
  search: 'Buscar',
  wardrobe: 'Armario',
  profile: 'Perfil',
}

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index
        const isCenter = route.name === 'outfits'

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[styles.tab, isFocused && styles.tabActive]}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isCenter && styles.iconCenter]}>
              <Text style={[styles.icon, isCenter && styles.iconLarge]}>
                {TAB_ICONS[route.name] ?? '·'}
              </Text>
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
  },
  icon: {
    fontSize: 20,
    color: colors.negro,
  },
  iconLarge: {
    fontSize: 22,
    color: colors.blanco,
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

import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'

const TAB_ICONS: Record<string, { default: string; active: string }> = {}

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index
        const isCenter = route.name === 'outfits'
        const icons = TAB_ICONS[route.name]

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
        }

        return (
          <TouchableOpacity key={route.key} onPress={onPress} />
        )
      })}
    </View>
  )
}

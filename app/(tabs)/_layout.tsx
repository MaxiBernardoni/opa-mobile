import { Tabs } from 'expo-router'
import { BottomTabBar } from '../../components/navigation/BottomTabBar'

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="outfits" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="wardrobe" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}

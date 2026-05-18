import { useLocalSearchParams, useRouter } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { colors } from '../../constants/colors'

export default function OutfitDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>
      <View style={styles.center}>
        <Text style={styles.title}>Outfit</Text>
        <Text style={styles.id}>{id}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },
  back: { padding: 16 },
  backText: { fontSize: 16, color: colors.rosaOpa },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: colors.negro },
  id: { fontSize: 14, color: colors.grisClaro, marginTop: 8 },
})

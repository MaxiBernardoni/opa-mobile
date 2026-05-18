import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

export default function WardrobeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Mi Armario</Text>
        <View style={styles.slots}>
          {['Torso', 'Piernas', 'Calzado', 'Extras'].map((slot) => (
            <TouchableOpacity key={slot} style={styles.slotCard} activeOpacity={0.7}>
              <Text style={styles.slotIcon}>＋</Text>
              <Text style={styles.slotLabel}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👚</Text>
          <Text style={styles.emptyText}>Tu armario está vacío. Añadí tus prendas para descubrir looks personalizados.</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>Añadir prenda</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },
  container: { flex: 1, padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.negro, marginBottom: spacing.xl },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.xl },
  slotCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.grisBorde,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  slotIcon: { fontSize: 32, color: colors.grisMedio },
  slotLabel: { fontSize: 13, color: colors.grisClaro, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontSize: 14, color: colors.grisClaro, textAlign: 'center', maxWidth: 240, lineHeight: 20,
  },
  addBtn: {
    backgroundColor: colors.rosaOpa, borderRadius: 8,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  addBtnText: { color: colors.blanco, fontWeight: '700', fontSize: 15 },
})

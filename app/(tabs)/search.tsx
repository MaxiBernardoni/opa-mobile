import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TextInput, StatusBar } from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

export default function SearchScreen() {
  const [query, setQuery] = useState('')

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Buscar</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⊕</Text>
          <TextInput
            style={styles.input}
            placeholder="Outfits, prendas, marcas..."
            placeholderTextColor={colors.grisClaro}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👗</Text>
          <Text style={styles.emptyText}>Descubrí looks por estilo, ocasión o marca</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.blanco },
  container: { flex: 1, padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.negro, marginBottom: spacing.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grisBorde,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: { fontSize: 18, color: colors.grisClaro },
  input: { flex: 1, fontSize: 15, color: colors.negro },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 14, color: colors.grisClaro, textAlign: 'center', maxWidth: 220 },
})

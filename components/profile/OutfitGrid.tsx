import React from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { Outfit } from '../../types'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { radius } from '../../constants/radius'
import { APP_WIDTH } from '../../constants/layout'

const CARD_WIDTH = (APP_WIDTH - spacing.lg * 2 - spacing.sm * 2) / 3

interface OutfitGridProps {
  outfits: Outfit[]
  onPress?: (outfit: Outfit) => void
}

export function OutfitGrid({ outfits, onPress }: OutfitGridProps) {
  return (
    <FlatList
      data={outfits}
      numColumns={3}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => onPress?.(item)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.cover_image_url ?? `https://picsum.photos/seed/${item.id}/130/231` }}
            style={styles.image}
            contentFit="cover"
          />
          <View style={styles.likesRow}>
            <Text style={styles.likes}>♥ {item.likes_count}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * (231 / 130),
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.grisMedio,
  },
  image: { width: '100%', height: '100%' },
  likesRow: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  likes: {
    fontSize: 10,
    color: colors.blanco,
    fontFamily: fonts.mergeOne,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})

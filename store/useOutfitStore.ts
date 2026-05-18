import { create } from 'zustand'
import { Outfit } from '../types'

interface OutfitState {
  outfits: Outfit[]
  setOutfits: (outfits: Outfit[]) => void
  addOutfits: (outfits: Outfit[]) => void
}

export const useOutfitStore = create<OutfitState>((set) => ({
  outfits: [],
  setOutfits: (outfits) => set({ outfits }),
  addOutfits: (outfits) => set((state) => ({ outfits: [...state.outfits, ...outfits] })),
}))

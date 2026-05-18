import { create } from 'zustand'
import { Garment } from '../types'

interface WardrobeState {
  items: Garment[]
  setItems: (items: Garment[]) => void
}

export const useWardrobeStore = create<WardrobeState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))

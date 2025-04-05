import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StockItem {
  Marka: string
  "Ürün Grubu": string
  "Ürün Kodu": string
  "Renk Kodu": string
  Beden: string
  Envanter: number
}

interface StockState {
  stockData: StockItem[]
  setStockData: (data: StockItem[]) => void
}

export const useStockStore = create<StockState>()(
  persist(
    (set) => ({
      stockData: [],
      setStockData: (data) => set({ stockData: data }),
    }),
    {
      name: 'stock-storage',
    }
  )
) 
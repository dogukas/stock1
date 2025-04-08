import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface StockItem {
  "Ürün Kodu": string
  "Ürün Grubu": string
  Marka: string
  Beden: string
  Envanter: number
  Barkod: string
  [key: string]: any
}

interface StockStore {
  stockData: StockItem[]
  loading: boolean
  error: string | null
  setStockData: (data: StockItem[]) => void
  fetchStockData: () => Promise<void>
}

export const useStockStore = create<StockStore>()(
  persist(
    (set) => ({
      stockData: [],
      loading: false,
      error: null,
      setStockData: (data) => set({ stockData: data }),
      fetchStockData: async () => {
        try {
          set({ loading: true, error: null })
          
          const { data, error } = await supabase
            .from('excel_data')
            .select('*')
          
          if (error) {
            throw new Error(error.message)
          }
          
          if (!data) {
            throw new Error('Veri bulunamadı')
          }

          // Veriyi StockItem formatına dönüştür
          const formattedData = data.map(item => ({
            "Ürün Kodu": String(item["Ürün Kodu"] || ""),
            "Ürün Grubu": String(item["Ürün Grubu"] || ""),
            Marka: String(item["Marka"] || ""),
            Beden: String(item["Beden"] || ""),
            Envanter: Number(item["Envanter"]) || 0,
            Barkod: String(item["Barkod"] || "")
          }))

          set({ stockData: formattedData, loading: false })
        } catch (error) {
          console.error('Veri çekme hatası:', error)
          set({ error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu', loading: false })
        }
      }
    }),
    {
      name: 'stock-storage', // localStorage'da kullanılacak anahtar
      version: 1, // versiyon numarası
      partialize: (state) => ({ stockData: state.stockData }), // Sadece stockData'yı kaydet
    }
  )
) 
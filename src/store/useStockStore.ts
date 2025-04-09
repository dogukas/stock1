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
  [key: string]: string | number
}

interface StockStore {
  stockData: StockItem[]
  loading: boolean
  error: string | null
  setStockData: (data: StockItem[]) => void
  fetchStockData: () => Promise<void>
  clearData: () => Promise<void>
}

export const useStockStore = create<StockStore>()(
  persist(
    (set) => ({
      stockData: [],
      loading: false,
      error: null,
      setStockData: (data) => set({ stockData: data }),
      clearData: async () => {
        try {
          set({ loading: true, error: null })
          
          const { error } = await supabase
            .from('excel_data')
            .delete()
            .neq('id', 0)
          
          if (error) {
            throw new Error(error.message)
          }
          
          set({ stockData: [], loading: false })
        } catch (error) {
          console.error('Veri silme hatası:', error)
          set({ error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu', loading: false })
        }
      },
      fetchStockData: async () => {
        try {
          set({ loading: true, error: null })
          
          const { data, error, count } = await supabase
            .from('excel_data')
            .select('*', { count: 'exact' })
            .order('id', { ascending: true })
            .limit(100000)

          if (error) {
            throw new Error(error.message)
          }
          
          if (!data) {
            throw new Error('Veri bulunamadı')
          }

          console.log('Toplam kayıt sayısı:', count)

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
      name: 'stock-storage',
      version: 1,
      partialize: (state) => ({ stockData: state.stockData }),
    }
  )
) 
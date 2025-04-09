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
  subscribeToChanges: () => () => void
}

export const useStockStore = create<StockStore>()(
  persist(
    (set, get) => ({
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
          // Local storage'ı temizle
          localStorage.removeItem('stock-storage')
        } catch (error) {
          console.error('Veri silme hatası:', error)
          set({ error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu', loading: false })
        }
      },
      fetchStockData: async () => {
        try {
          set({ loading: true, error: null })
          
          let allData: any[] = []
          let page = 0
          const pageSize = 1000
          
          while (true) {
            const { data, error, count } = await supabase
              .from('excel_data')
              .select('*', { count: 'exact' })
              .order('id', { ascending: true })
              .range(page * pageSize, (page + 1) * pageSize - 1)

            if (error) {
              throw new Error(error.message)
            }
            
            if (!data || data.length === 0) {
              break
            }

            allData = [...allData, ...data]
            
            // Eğer bu sayfa tam dolmadıysa, başka sayfa yoktur
            if (data.length < pageSize) {
              break
            }
            
            page++
          }

          if (allData.length === 0) {
            throw new Error('Veri bulunamadı')
          }

          const formattedData = allData.map(item => ({
            "Ürün Kodu": String(item["Ürün Kodu"] || ""),
            "Ürün Grubu": String(item["Ürün Grubu"] || ""),
            Marka: String(item["Marka"] || ""),
            Beden: String(item["Beden"] || ""),
            Envanter: Number(item["Envanter"]) || 0,
            Barkod: String(item["Barkod"] || "")
          }))

          set({ stockData: formattedData, loading: false })
          
          // Local storage'ı güncelle
          localStorage.setItem('stock-storage', JSON.stringify({
            state: { stockData: formattedData },
            version: 3
          }))
        } catch (error) {
          console.error('Veri çekme hatası:', error)
          set({ error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu', loading: false })
        }
      },
      subscribeToChanges: () => {
        // Supabase real-time subscription
        const subscription = supabase
          .channel('excel_data_changes')
          .on('postgres_changes', {
            event: '*', // Tüm değişiklikleri dinle (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'excel_data'
          }, () => {
            // Herhangi bir değişiklik olduğunda verileri yeniden çek
            get().fetchStockData()
          })
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }
      }
    }),
    {
      name: 'stock-storage',
      version: 3, // Versiyon numarasını artırarak eski cache'i temizle
      partialize: (state) => ({ stockData: state.stockData }),
      onRehydrateStorage: () => (state) => {
        // Storage'dan veri yüklendiğinde güncel verileri çek
        if (state) {
          state.fetchStockData()
        }
      }
    }
  )
) 
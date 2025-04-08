export type Database = {
  public: {
    Tables: {
      excel_data: {
        Row: {
          id: number
          created_at?: string
          // Excel'deki diğer sütunlar otomatik olarak eşleşecek
          [key: string]: any // dinamik sütunlar için
        }
        Insert: {
          id?: number
          created_at?: string
          [key: string]: any
        }
      }
    }
  }
} 
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key gerekli')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Veri okuma yardımcı fonksiyonu
export async function getExcelData() {
  const { data, error } = await supabase
    .from('excel_data')
    .select('*')
  
  if (error) {
    console.error('Error fetching excel data:', error)
    return null
  }
  
  return data
} 
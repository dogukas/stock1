"use client"

import { useEffect, useMemo } from "react"
import { useStockStore } from "@/store/useStockStore"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertTriangle, Package } from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function Home() {
  const { stockData, loading, error, fetchStockData, subscribeToChanges } = useStockStore()

  useEffect(() => {
    // Sayfa yüklendiğinde verileri çek ve real-time güncellemeleri dinle
    fetchStockData()
    const unsubscribe = subscribeToChanges()
    
    return () => {
      unsubscribe()
    }
  }, [])

  // Marka bazlı stok dağılımı
  const brandDistribution = useMemo(() => {
    if (!stockData?.length) return []
    
    const distribution = stockData.reduce((acc: { [key: string]: number }, item) => {
      const brand = item.Marka
      acc[brand] = (acc[brand] || 0) + Number(item.Envanter)
      return acc
    }, {})

    return Object.entries(distribution)
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Sadece ilk 5 marka
  }, [stockData])

  // Ürün grubu bazlı stok dağılımı
  const productGroupDistribution = useMemo(() => {
    if (!stockData?.length) return []
    
    const distribution = stockData.reduce((acc: { [key: string]: number }, item) => {
      const group = item["Ürün Grubu"]
      acc[group] = (acc[group] || 0) + Number(item.Envanter)
      return acc
    }, {})

    return Object.entries(distribution)
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // İlk 8 ürün grubu
  }, [stockData])

  // Stok durumu analizi
  const stockAnalysis = useMemo(() => {
    if (!stockData?.length) return {
      totalStock: 0,
      uniqueProducts: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0
    }

    const analysis = stockData.reduce((acc, item) => {
      const stock = Number(item.Envanter)
      return {
        totalStock: acc.totalStock + stock,
        uniqueProducts: acc.uniqueProducts + 1,
        lowStock: acc.lowStock + (stock <= 5 ? 1 : 0),
        outOfStock: acc.outOfStock + (stock === 0 ? 1 : 0),
        totalValue: acc.totalValue + (stock * 100) // Ortalama ürün değeri 100 TL
      }
    }, {
      totalStock: 0,
      uniqueProducts: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0
    })

    return analysis
  }, [stockData])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => fetchStockData()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stok Yönetim Paneli</h1>
        <div className="text-sm text-muted-foreground">
          Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockAnalysis.totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stockAnalysis.uniqueProducts} farklı ürün
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-900/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stockAnalysis.lowStock}
            </div>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
              5 veya daha az stok
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <CardTitle className="text-sm font-medium">Stok Yok</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stockAnalysis.outOfStock}
            </div>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
              Tükenen ürünler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{stockAnalysis.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tahmini stok değeri
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafikler */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Marka Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>En Çok Stoktaki Markalar</CardTitle>
            <CardDescription>İlk 5 marka</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {brandDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ürün Grubu Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>Ürün Grubu Dağılımı</CardTitle>
            <CardDescription>En çok stoktaki gruplar</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productGroupDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" name="Stok Miktarı" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


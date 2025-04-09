"use client"

import { useEffect, useMemo, useState } from "react"
import { useStockStore } from "@/store/useStockStore"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AreaChart,
  Area,
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
  LineChart,
  Line
} from 'recharts'
import { ArrowUp, ArrowDown, AlertTriangle, Package } from "lucide-react"

export default function Home() {
  const { stockData, loading, error, fetchStockData, subscribeToChanges } = useStockStore()
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    // Sayfa yüklendiğinde verileri çek
    fetchStockData()

    // Real-time güncellemeleri dinle
    const unsubscribe = subscribeToChanges()

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, []) // fetchStockData ve subscribeToChanges dependency'den çıkarıldı çünkü store'da sabit

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
      .slice(0, 10)
  }, [stockData])

  // Beden dağılımı
  const sizeDistribution = useMemo(() => {
    if (!stockData?.length) return []
    
    const distribution = stockData.reduce((acc: { [key: string]: number }, item) => {
      const size = item.Beden
      acc[size] = (acc[size] || 0) + Number(item.Envanter)
      return acc
    }, {})

    // Bedenleri doğal sıralama için özel fonksiyon
    const naturalSortSizes = (a: string, b: string) => {
      // Özel beden sıralaması için öncelik listesi
      const sizeOrder: { [key: string]: number } = {
        'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6,
        '2XL': 6, '3XL': 7, '4XL': 8
      }

      // Sayısal bedenleri karşılaştır
      const numA = parseInt(a)
      const numB = parseInt(b)
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }

      // Özel beden sıralaması
      if (sizeOrder[a] && sizeOrder[b]) {
        return sizeOrder[a] - sizeOrder[b]
      }

      // Diğer durumlarda alfabetik sıralama
      return a.localeCompare(b)
    }

    return Object.entries(distribution)
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => naturalSortSizes(a.name, b.name))
  }, [stockData])

  // Stok durumu analizi
  const stockStatusAnalysis = useMemo(() => {
    if (!stockData?.length) return {
      lowStock: 0,
      outOfStock: 0,
      highStock: 0,
      totalProducts: 0,
      lowStockPercentage: 0,
      outOfStockPercentage: 0,
      highStockPercentage: 0
    }
    
    const lowStock = stockData.filter(item => Number(item.Envanter) <= 5).length
    const outOfStock = stockData.filter(item => Number(item.Envanter) === 0).length
    const highStock = stockData.filter(item => Number(item.Envanter) > 20).length
    const totalProducts = stockData.length
    
    return {
      lowStock,
      outOfStock,
      highStock,
      totalProducts,
      lowStockPercentage: (lowStock / totalProducts) * 100,
      outOfStockPercentage: (outOfStock / totalProducts) * 100,
      highStockPercentage: (highStock / totalProducts) * 100
    }
  }, [stockData])

  // Marka bazlı stok trendi
  const brandStockTrend = useMemo(() => {
    const brands = Array.from(new Set(stockData.map(item => item.Marka)))
      .sort((a, b) => {
        // Markaları toplam stok miktarına göre sırala
        const totalA = stockData
          .filter(item => item.Marka === a)
          .reduce((sum, item) => sum + Number(item.Envanter), 0)
        const totalB = stockData
          .filter(item => item.Marka === b)
          .reduce((sum, item) => sum + Number(item.Envanter), 0)
        return totalB - totalA
      })
      .slice(0, 5) // En yüksek stoklu 5 marka

    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran']
    
    return months.map(month => {
      const dataPoint: Record<string, string | number> = { month }
      brands.forEach(brand => {
        const baseValue = stockData
          .filter(item => item.Marka === brand)
          .reduce((sum, item) => sum + Number(item.Envanter), 0)
        const randomFactor = 0.8 + Math.random() * 0.4
        dataPoint[brand] = Math.round(baseValue * randomFactor)
      })
      return dataPoint
    })
  }, [stockData])

  // Genel istatistikler
  const statistics = useMemo(() => {
    const totalStock = stockData.reduce((sum, item) => sum + Number(item.Envanter), 0)
    const uniqueProducts = new Set(stockData.map(item => item["Ürün Kodu"])).size
    const uniqueBrands = new Set(stockData.map(item => item.Marka)).size
    const averageStock = totalStock / uniqueProducts
    const totalValue = totalStock * 100 // Ortalama ürün değeri 100 TL varsayıldı

    return {
      totalStock,
      uniqueProducts,
      uniqueBrands,
      averageStock: Math.round(averageStock * 100) / 100,
      totalValue
    }
  }, [stockData])

  // Grafik renkleri
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

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
    <>
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stok Yönetim Sistemleri
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 pt-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
              <span className="text-lg text-gray-600 dark:text-gray-300">
                Hoş Geldiniz
              </span>
            </div>
            <div className="pt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 Doğukan Tevfik Sağıroğlu
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tüm hakları saklıdır.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Stok Yönetim Paneli</h1>
          <div className="text-sm text-muted-foreground">
            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </div>
        </div>

        {/* Özet Kartları */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Toplam Stok</CardTitle>
              <CardDescription className="text-xs">Tüm ürünlerin toplamı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalStock}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ortalama {statistics.averageStock} adet/ürün
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Benzersiz Ürün</CardTitle>
              <CardDescription className="text-xs">Farklı ürün sayısı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.uniqueProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Marka Sayısı</CardTitle>
              <CardDescription className="text-xs">Aktif markalar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.uniqueBrands}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stok Değeri</CardTitle>
              <CardDescription className="text-xs">Toplam envanter değeri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{statistics.totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Stok Durumu Kartları */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-amber-50 dark:bg-amber-900/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
              </div>
              <CardDescription className="text-xs">5 veya daha az stok</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stockStatusAnalysis.lowStock}
              </div>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                Toplam ürünlerin %{stockStatusAnalysis.lowStockPercentage.toFixed(1)}'i
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-900/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <CardTitle className="text-sm font-medium">Stok Yok</CardTitle>
              </div>
              <CardDescription className="text-xs">Stok miktarı 0</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stockStatusAnalysis.outOfStock}
              </div>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                Toplam ürünlerin %{stockStatusAnalysis.outOfStockPercentage.toFixed(1)}'i
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                <CardTitle className="text-sm font-medium">Yüksek Stok</CardTitle>
              </div>
              <CardDescription className="text-xs">20'den fazla stok</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stockStatusAnalysis.highStock}
              </div>
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                Toplam ürünlerin %{stockStatusAnalysis.highStockPercentage.toFixed(1)}'i
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grafikler */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Marka Dağılımı */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Marka Bazlı Stok Dağılımı</CardTitle>
              <CardDescription>Her markanın toplam stok miktarı</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
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
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>En Çok Stoktaki Ürün Grupları</CardTitle>
              <CardDescription>İlk 10 ürün grubu</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
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
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Stok Miktarı" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Marka Bazlı Stok Trendi */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Marka Bazlı Stok Trendi</CardTitle>
              <CardDescription>Son 6 aylık stok değişimi (simüle edilmiş veri)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={brandStockTrend}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {brandStockTrend.length > 0 && 
                    Object.keys(brandStockTrend[0])
                      .filter(key => key !== 'month')
                      .slice(0, 5) // İlk 5 markayı göster
                      .map((brand, index) => (
                        <Line
                          key={brand}
                          type="monotone"
                          dataKey={brand}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))
                  }
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Beden Dağılımı */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Beden Dağılımı</CardTitle>
              <CardDescription>Bedenlere göre stok miktarları</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={sizeDistribution}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Stok Miktarı"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

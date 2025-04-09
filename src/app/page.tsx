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
import { Button } from "@/components/ui/button"

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

  // Renk kodu bazlı stok dağılımı
  const colorDistribution = useMemo(() => {
    if (!stockData?.length) return []
    
    const distribution = stockData.reduce((acc: { [key: string]: number }, item) => {
      const color = item["Renk Kodu"] || "Belirtilmemiş"
      acc[color] = (acc[color] || 0) + Number(item.Envanter)
      return acc
    }, {})

    return Object.entries(distribution)
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // İlk 10 renk
  }, [stockData])

  // Stok durumu analizi
  const stockAnalysis = useMemo(() => {
    if (!stockData?.length) return {
      totalStock: 0,
      uniqueProducts: 0,
      lowStock: 0,
      highStock: 0,
      outOfStock: 0,
      totalValue: 0
    }

    const analysis = stockData.reduce((acc, item) => {
      const stock = Number(item.Envanter)
      return {
        totalStock: acc.totalStock + stock,
        uniqueProducts: acc.uniqueProducts + 1,
        lowStock: acc.lowStock + (stock < 2 ? 1 : 0), // 2'den az olan stoklar
        highStock: acc.highStock + (stock > 5 ? 1 : 0), // 5'ten fazla olan stoklar
        outOfStock: acc.outOfStock + (stock === 0 ? 1 : 0),
        totalValue: acc.totalValue + (stock * 100)
      }
    }, {
      totalStock: 0,
      uniqueProducts: 0,
      lowStock: 0,
      highStock: 0,
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

  // Veri yoksa özel mesaj göster
  if (!stockData || stockData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Package className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-700">Henüz Stok Verisi Yok</h2>
          <p className="text-gray-500">
            Stok verilerini görüntülemek için önce Excel dosyanızı yüklemeniz gerekiyor.
          </p>
          <Button
            onClick={() => window.location.href = '/stock-query'}
            className="mt-4"
          >
            Veri Yükle
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => fetchStockData()}
            className="mt-4"
          >
            Tekrar Dene
          </Button>
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
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Stok</CardTitle>
            <CardDescription className="text-xs">Tüm ürünlerin toplamı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockAnalysis.totalStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Benzersiz Ürün</CardTitle>
            <CardDescription className="text-xs">Farklı ürün sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockAnalysis.uniqueProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Düşük Stok</CardTitle>
            <CardDescription className="text-xs">2'den az stoklu ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stockAnalysis.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Toplam ürünlerin {((stockAnalysis.lowStock / stockAnalysis.uniqueProducts) * 100).toFixed(1)}%'i
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Yüksek Stok</CardTitle>
            <CardDescription className="text-xs">5'ten fazla stoklu ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stockAnalysis.highStock}</div>
            <p className="text-xs text-muted-foreground">
              Toplam ürünlerin {((stockAnalysis.highStock / stockAnalysis.uniqueProducts) * 100).toFixed(1)}%'i
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Stok Yok</CardTitle>
            <CardDescription className="text-xs">Tükenmiş ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stockAnalysis.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              Toplam ürünlerin {((stockAnalysis.outOfStock / stockAnalysis.uniqueProducts) * 100).toFixed(1)}%'i
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
            <CardDescription className="text-xs">Tahmini stok değeri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stockAnalysis.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Grafikler */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Marka Dağılımı */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Marka Dağılımı</CardTitle>
            <CardDescription>En çok stoğu olan markalar</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
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
            <CardTitle className="text-lg">Ürün Grubu Dağılımı</CardTitle>
            <CardDescription>Kategorilere göre stok dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productGroupDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {productGroupDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Renk Kodu Dağılımı */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Renk Dağılımı</CardTitle>
            <CardDescription>Renklere göre stok dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={colorDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {colorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


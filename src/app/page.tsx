"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import { useStockStore } from "@/store/useStockStore"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function Home() {
  const { stockData } = useStockStore()

  // İstatistikleri hesapla
  const stats = {
    totalStock: stockData.reduce((sum, item) => sum + item.Envanter, 0),
    uniqueBrands: new Set(stockData.map(item => item.Marka)).size,
    uniqueProducts: stockData.length,
    lowStock: stockData.filter(item => item.Envanter <= 2).length,
  }

  // Marka bazlı envanter dağılımı
  const brandData = stockData.reduce((acc, item) => {
    acc[item.Marka] = (acc[item.Marka] || 0) + item.Envanter
    return acc
  }, {} as Record<string, number>)

  // Beden bazlı envanter dağılımı
  const sizeData = stockData.reduce((acc, item) => {
    acc[item.Beden] = (acc[item.Beden] || 0) + item.Envanter
    return acc
  }, {} as Record<string, number>)

  const brandChartData = {
    labels: Object.keys(brandData),
    datasets: [
      {
        label: 'Envanter Sayısı',
        data: Object.values(brandData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const sizeChartData = {
    labels: Object.keys(sizeData),
    datasets: [
      {
        label: 'Beden Dağılımı',
        data: Object.values(sizeData),
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock}</div>
            <p className="text-xs text-muted-foreground">adet ürün</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benzersiz Marka</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueBrands}</div>
            <p className="text-xs text-muted-foreground">farklı marka</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ürün Çeşidi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueProducts}</div>
            <p className="text-xs text-muted-foreground">farklı ürün</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">kritik seviyede</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Marka Bazlı Stok Dağılımı</CardTitle>
            <CardDescription>Markalara göre envanter dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar 
              data={brandChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beden Dağılımı</CardTitle>
            <CardDescription>Bedenlere göre stok dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <Pie 
              data={sizeChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

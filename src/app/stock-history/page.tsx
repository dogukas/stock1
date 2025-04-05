"use client"

import { useState, useMemo, useEffect } from "react"
import { useStockStore } from "@/store/useStockStore"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Save, Filter, CheckSquare, Square, MessageSquarePlus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DialogTrigger,
} from "@/components/ui/dialog"

interface DisplayStatus {
  isDisplayed: boolean
  lastChecked: string
  notes?: string
}

type StockDisplayStatus = Record<string, DisplayStatus>

// localStorage yardımcı fonksiyonları
const storage = {
  save: (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },
  load: (key: string) => {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    }
    return null
  }
}

export default function StockHistoryPage() {
  const { stockData } = useStockStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterColumn, setFilterColumn] = useState<keyof StockItem>("Marka")
  const [displayStatus, setDisplayStatus] = useState<StockDisplayStatus>({})
  const [selectedNote, setSelectedNote] = useState<string>("")
  const [filterDisplayed, setFilterDisplayed] = useState<"all" | "displayed" | "not-displayed">("all")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkNote, setBulkNote] = useState("")
  const [isAllSelected, setIsAllSelected] = useState(false)

  // localStorage'dan verileri yükle
  useEffect(() => {
    const saved = storage.load('stockDisplayStatus')
    if (saved) {
      setDisplayStatus(saved)
    }
  }, [])

  const columns: (keyof StockItem)[] = ["Marka", "Ürün Grubu", "Ürün Kodu", "Renk Kodu", "Beden", "Envanter"]

  const handleCheckboxChange = (productKey: string, checked: boolean) => {
    const newStatus = {
      ...displayStatus,
      [productKey]: {
        isDisplayed: checked,
        lastChecked: new Date().toISOString(),
        notes: selectedNote || undefined
      }
    }
    setDisplayStatus(newStatus)
    storage.save('stockDisplayStatus', newStatus)
    setSelectedNote("") // Reset note after saving
  }

  const getProductKey = (item: StockItem) => {
    return `${item.Marka}-${item["Ürün Kodu"]}-${item["Renk Kodu"]}-${item.Beden}`
  }

  const filteredData = useMemo(() => {
    return stockData.filter(item => {
      const matchesSearch = String(item[filterColumn])
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const productKey = getProductKey(item)
      const status = displayStatus[productKey]

      switch (filterDisplayed) {
        case "displayed":
          return matchesSearch && status?.isDisplayed
        case "not-displayed":
          return matchesSearch && (!status?.isDisplayed)
        default:
          return matchesSearch
      }
    })
  }, [stockData, searchTerm, filterColumn, filterDisplayed, displayStatus])

  const stats = useMemo(() => {
    const total = stockData.length
    let displayed = 0
    let notDisplayed = 0
    
    // Her stok verisi için kontrol et
    stockData.forEach(item => {
      const productKey = getProductKey(item)
      const status = displayStatus[productKey]
      
      if (status) {
        if (status.isDisplayed) {
          displayed++
        } else {
          notDisplayed++
        }
      }
    })

    const unchecked = total - displayed - notDisplayed

    return { 
      total,
      displayed,
      notDisplayed,
      unchecked,
      completionRate: total > 0 ? Math.round(((displayed + notDisplayed) / total) * 100) : 0
    }
  }, [stockData, displayStatus])

  // Toplu seçim işlemi
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems(new Set())
    } else {
      const newSelected = new Set(filteredData.map(item => getProductKey(item)))
      setSelectedItems(newSelected)
    }
    setIsAllSelected(!isAllSelected)
  }

  // Tekli seçim işlemi
  const handleSelectItem = (productKey: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(productKey)) {
      newSelected.delete(productKey)
    } else {
      newSelected.add(productKey)
    }
    setSelectedItems(newSelected)
    setIsAllSelected(newSelected.size === filteredData.length)
  }

  // Toplu durum güncelleme
  const handleBulkStatusUpdate = (isDisplayed: boolean) => {
    const newStatus = { ...displayStatus }
    selectedItems.forEach(productKey => {
      newStatus[productKey] = {
        isDisplayed,
        lastChecked: new Date().toISOString(),
        notes: displayStatus[productKey]?.notes
      }
    })
    setDisplayStatus(newStatus)
    storage.save('stockDisplayStatus', newStatus)
  }

  // Toplu not ekleme
  const handleBulkAddNote = () => {
    if (!bulkNote.trim()) return
    
    const newStatus = { ...displayStatus }
    selectedItems.forEach(productKey => {
      newStatus[productKey] = {
        isDisplayed: displayStatus[productKey]?.isDisplayed || false,
        lastChecked: new Date().toISOString(),
        notes: bulkNote
      }
    })
    setDisplayStatus(newStatus)
    storage.save('stockDisplayStatus', newStatus)
    setBulkNote("")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stok Kontrol Listesi</h1>
        <div className="text-sm text-muted-foreground">
          Tamamlanma Oranı: %{stats.completionRate}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
            <CardDescription className="text-xs">Stokta bulunan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sergilenen</CardTitle>
            <CardDescription className="text-xs">Vitrin/rafta mevcut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.displayed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.displayed / stats.total) * 100) : 0}% oranında
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sergilenmeyen</CardTitle>
            <CardDescription className="text-xs">Depoda bekleyen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.notDisplayed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.notDisplayed / stats.total) * 100) : 0}% oranında
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kontrol Edilmemiş</CardTitle>
            <CardDescription className="text-xs">Bekleyen ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.unchecked}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.unchecked / stats.total) * 100) : 0}% oranında
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {isAllSelected ? <CheckSquare className="h-4 w-4 mr-2" /> : <Square className="h-4 w-4 mr-2" />}
            {isAllSelected ? "Tümünü Kaldır" : "Tümünü Seç"}
          </Button>

          {selectedItems.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate(true)}
                className="text-green-600"
              >
                Seçilenleri Sergile ({selectedItems.size})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate(false)}
                className="text-red-600"
              >
                Seçilenleri Kaldır
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    Toplu Not Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Toplu Not Ekle</DialogTitle>
                    <DialogDescription>
                      Seçili {selectedItems.size} ürüne not ekle
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Not ekle..."
                      value={bulkNote}
                      onChange={(e) => setBulkNote(e.target.value)}
                    />
                    <Button onClick={handleBulkAddNote}>
                      Notu Kaydet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <Input
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[200px]"
          />
          <Select
            value={filterColumn}
            onValueChange={(value) => setFilterColumn(value as keyof StockItem)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Arama Kolonu" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select
          value={filterDisplayed}
          onValueChange={(value) => setFilterDisplayed(value as "all" | "displayed" | "not-displayed")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="displayed">Sergilenenler</SelectItem>
            <SelectItem value="not-displayed">Sergilenmeyenler</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seç</TableHead>
              <TableHead>Durum</TableHead>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
              <TableHead>Not</TableHead>
              <TableHead>Son Kontrol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item, index) => {
              const productKey = getProductKey(item)
              const status = displayStatus[productKey]
              return (
                <TableRow key={index}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.has(productKey)}
                      onCheckedChange={() => handleSelectItem(productKey)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={status?.isDisplayed || false}
                        onCheckedChange={(checked) => handleCheckboxChange(productKey, checked as boolean)}
                      />
                      {status?.isDisplayed ? 
                        <span className="text-green-600">Sergileniyor</span> : 
                        <span className="text-red-600">Sergilenmiyor</span>
                      }
                    </div>
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column}>{item[column]}</TableCell>
                  ))}
                  <TableCell>
                    <Input
                      placeholder="Not ekle..."
                      value={selectedNote}
                      onChange={(e) => setSelectedNote(e.target.value)}
                      className="max-w-[200px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCheckboxChange(productKey, status?.isDisplayed || false)
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {status?.lastChecked ? 
                      new Date(status.lastChecked).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 
                      'Kontrol edilmedi'
                    }
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
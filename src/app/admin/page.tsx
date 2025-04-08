"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Shield, Users, Settings, FileText, Database, Key } from "lucide-react"
import { useStockStore } from "@/store/useStockStore"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {
  const { setStockData } = useStockStore()
  const [activeTab, setActiveTab] = useState("users")
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Örnek veriler
  const users = [
    { id: 1, name: "Admin", email: "admin@example.com", role: "Yönetici", status: "Aktif" },
    { id: 2, name: "Kullanıcı 1", email: "user1@example.com", role: "Kullanıcı", status: "Aktif" },
    { id: 3, name: "Kullanıcı 2", email: "user2@example.com", role: "Kullanıcı", status: "Pasif" },
  ]

  const logs = [
    { id: 1, action: "Giriş", user: "Admin", timestamp: "2024-03-20 10:30", ip: "192.168.1.1" },
    { id: 2, action: "Stok Güncelleme", user: "Kullanıcı 1", timestamp: "2024-03-20 11:15", ip: "192.168.1.2" },
    { id: 3, action: "Çıkış", user: "Admin", timestamp: "2024-03-20 12:00", ip: "192.168.1.1" },
  ]

  const apiKeys = [
    { id: 1, name: "Stok API", key: "sk_test_123...", created: "2024-03-01", lastUsed: "2024-03-20" },
    { id: 2, name: "Raporlama API", key: "sk_test_456...", created: "2024-03-15", lastUsed: "2024-03-19" },
  ]

  const handleClearData = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Supabase'den verileri sil
      const { error: supabaseError } = await supabase
        .from('excel_data')
        .delete()
        .neq('id', 0) // Tüm kayıtları sil

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Local store'u temizle
      setStockData([])
      setShowConfirm(false)
    } catch (err) {
      console.error('Veri silme hatası:', err)
      setError(err instanceof Error ? err.message : 'Verileri silerken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Paneli</h1>
        <div className="text-sm text-muted-foreground">
          Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ayarlar
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Log Kayıtları
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Yedekleme
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Anahtarları
          </TabsTrigger>
        </TabsList>

        {/* Kullanıcılar Sekmesi */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Yönetimi</CardTitle>
              <CardDescription>Sistem kullanıcılarını yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>Yeni Kullanıcı Ekle</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.status}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Düzenle</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ayarlar Sekmesi */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Ayarları</CardTitle>
              <CardDescription>Genel sistem ayarlarını yapılandırın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">E-posta Bildirimleri</Label>
                  <Switch id="notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="backup">Otomatik Yedekleme</Label>
                  <Switch id="backup" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance">Bakım Modu</Label>
                  <Switch id="maintenance" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Log Kayıtları Sekmesi */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Logları</CardTitle>
              <CardDescription>Sistem aktivite kayıtları</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Tarih/Saat</TableHead>
                    <TableHead>IP Adresi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yedekleme Sekmesi */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yedekleme ve Geri Yükleme</CardTitle>
              <CardDescription>Sistem verilerini yedekleyin ve geri yükleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button>Yedek Al</Button>
                <Button variant="outline">Geri Yükle</Button>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Son Yedekler</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Boyut</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2024-03-20 10:00</TableCell>
                      <TableCell>2.5 MB</TableCell>
                      <TableCell>Tamamlandı</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">İndir</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Anahtarları Sekmesi */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Anahtarları</CardTitle>
              <CardDescription>Sistem API anahtarlarını yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>Yeni API Anahtarı Oluştur</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>İsim</TableHead>
                    <TableHead>Anahtar</TableHead>
                    <TableHead>Oluşturulma</TableHead>
                    <TableHead>Son Kullanım</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.id}</TableCell>
                      <TableCell>{key.name}</TableCell>
                      <TableCell>{key.key}</TableCell>
                      <TableCell>{key.created}</TableCell>
                      <TableCell>{key.lastUsed}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Yenile</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Veri Yönetimi</h2>
        
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded">
              <p>{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 className="font-medium">Tüm Verileri Sil</h3>
              <p className="text-sm text-gray-500">
                Bu işlem tüm stok verilerini kalıcı olarak silecektir.
              </p>
            </div>
            
            <button
              onClick={handleClearData}
              disabled={loading}
              className={`px-4 py-2 rounded ${
                showConfirm 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } transition-colors disabled:opacity-50`}
            >
              {loading ? 'Siliniyor...' : showConfirm ? 'Emin misiniz?' : 'Verileri Sil'}
            </button>
          </div>

          {showConfirm && (
            <p className="text-sm text-red-500">
              ⚠️ Bu işlem geri alınamaz. Onaylamak için tekrar "Emin misiniz?" butonuna tıklayın.
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 
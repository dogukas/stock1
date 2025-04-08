"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Menu, Shield, Search, History, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      {/* Mobil menü */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden"
            size="icon"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <div className="px-1 py-6 flex flex-col gap-4">
            <SidebarContent isCollapsed={false} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Masaüstü sidebar */}
      <nav
        className={cn(
          "relative hidden md:block flex-shrink-0 border-r h-screen transition-all duration-300",
          isCollapsed ? "w-[60px]" : "w-[240px]",
          className
        )}
      >
        <div className="h-full py-6 pl-4 pr-2">
          <SidebarContent isCollapsed={isCollapsed} />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-[-12px] top-6 h-6 w-6 rounded-full border bg-background"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </nav>
    </>
  )
}

interface SidebarContentProps {
  isCollapsed: boolean
}

function SidebarContent({ isCollapsed }: SidebarContentProps) {
  const menuItems = [
    { title: "Ana Sayfa", href: "/", icon: Home },
    { title: "Stok Sorgula", href: "/stock-query", icon: Search },
    { title: "Stock Checklist List", href: "/stock-history", icon: History },
    { title: "Admin", href: "/admin", icon: Shield },
  ]

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        <div className="py-2">
          {!isCollapsed && (
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Menü</h2>
          )}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    isCollapsed && "justify-center px-2"
                  )}
                  asChild
                >
                  <a href={item.href} title={isCollapsed ? item.title : undefined}>
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && item.title}
                  </a>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
} 
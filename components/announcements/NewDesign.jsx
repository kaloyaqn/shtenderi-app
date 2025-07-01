"use client"

import { useEffect, useState } from "react"
import { X, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AnnouncementModal() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenAnnouncement")
    if (!hasSeenModal) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("hasSeenAnnouncement", "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-0">
        <CardHeader className="relative pb-4">
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close announcement"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>

          {/* Image Placeholder */}
          <div className="w-full h-48 bg bg-gray-100 rounded-lg flex items-center justify-center relatieve">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Megaphone className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Image Placeholder</p>
              <p className="text-xs text-gray-400">400 x 200px</p>
            </div>
            <img className="absolute" src="https://k.assets-edge.com/u/ws_c384806f1263879ccc5063d9/6862c48153bfd-image.png"  />
          </div>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Добре дошли в Обновената версия на Stendo</h2>
            <p className="text-gray-600 leading-relaxed">
            Хей! Забеляза ли новия ни облик? Направихме нещата по-красиви и по-удобни. Ако нещо изглежда счупено или старо — драсни ни, ще го оправим!</p>
          </div>

          <div className="pt-2">
            <Button onClick={handleDismiss}>
              Уауу! Нека разгледам
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

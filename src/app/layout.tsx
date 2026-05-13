import './globals.css'
import type { Metadata, Viewport } from 'next'
import Navbar from '../components/Navbar'

export const metadata: Metadata = {
  title: '装修记账本',
  description: '装修花费追踪管理应用',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-ios-bg min-h-screen">
        <Navbar />
        <main className="pb-20 pt-2">
          {children}
        </main>
      </body>
    </html>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Receipt } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/renovation', label: '装修', icon: Receipt },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <nav className="ios-nav-bar">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <span className="font-semibold text-gray-900 text-lg">聚财通录</span>
          </div>
        </div>
      </div>

      {/* iOS Tab Bar */}
      <div className="ios-tab-bar">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-around h-14">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 w-20 h-full transition-colors relative ${
                    active ? 'text-ios-blue' : 'text-gray-400'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-xs font-medium ${active ? 'text-ios-blue' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                  {active && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-ios-blue" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
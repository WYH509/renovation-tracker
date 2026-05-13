'use client'

import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ChevronRight, FolderKanban, Wallet, CreditCard } from 'lucide-react'

interface Project {
  id: number
  name: string
  description: string | null
  createdAt: string
  _count: { items: number; categories: number }
  totalSpent: number
  totalPaid: number
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="ios-card p-4 active:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
            {project.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{project.description}</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FolderKanban size={16} className="text-ios-blue" />
            </div>
            <div>
              <p className="text-xs text-gray-500">采购项</p>
              <p className="font-semibold text-gray-900">{project._count.items}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Wallet size={16} className="text-ios-green" />
            </div>
            <div>
              <p className="text-xs text-gray-500">总花费</p>
              <p className="font-semibold text-gray-900 ios-money truncate max-w-[100px]">{formatCurrency(project.totalSpent)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <CreditCard size={16} className="text-ios-orange" />
            </div>
            <div>
              <p className="text-xs text-gray-500">已付</p>
              <p className="font-semibold text-ios-green ios-money truncate max-w-[100px]">{formatCurrency(project.totalPaid)}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">{formatDate(project.createdAt)}</span>
          <span className="text-xs text-ios-blue font-medium">查看详情 →</span>
        </div>
      </div>
    </Link>
  )
}

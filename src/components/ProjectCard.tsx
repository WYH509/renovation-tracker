'use client'

import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

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
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
            )}
          </div>
          <span className="text-2xl">🏗️</span>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">项目数</p>
            <p className="font-semibold text-slate-700">{project._count.items}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">总花费</p>
            <p className="font-semibold text-blue-600">{formatCurrency(project.totalSpent)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">已付</p>
            <p className="font-semibold text-emerald-600">{formatCurrency(project.totalPaid)}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
          创建于 {formatDate(project.createdAt)}
        </div>
      </div>
    </Link>
  )
}
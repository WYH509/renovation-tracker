'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProjectCard from '../components/ProjectCard'
import StatsCharts from '../components/StatsCharts'
import { Plus, TrendingUp, Wallet, Clock, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Project {
  id: number
  name: string
  description: string | null
  createdAt: string
  _count: { items: number; categories: number }
  totalSpent: number
  totalPaid: number
}

interface StatsData {
  totalSpent: number
  totalPaid: number
  totalUnpaid: number
  itemsCount: number
  completedItems: number
  byCategory: { name: string; spent: number; paid: number }[]
  monthlyTrend: { month: string; amount: number }[]
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc })
      })
      setShowCreateModal(false)
      setNewProjectName('')
      setNewProjectDesc('')
      fetchProjects()
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 顶部统计 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} />
              <span className="text-sm opacity-80">总花费</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={18} />
              <span className="text-sm opacity-80">已付款</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} />
              <span className="text-sm opacity-80">待付款</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalUnpaid)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} />
              <span className="text-sm opacity-80">采购项</span>
            </div>
            <p className="text-2xl font-bold">{stats.itemsCount}</p>
          </div>
        </div>
      )}

      {/* 图表 */}
      {stats && stats.byCategory.length > 0 && (
        <StatsCharts data={stats} />
      )}

      {/* 项目列表 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">我的装修项目</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
          >
            <Plus size={18} />
            新建项目
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <span className="text-6xl mb-4 block">🏠</span>
            <h3 className="text-lg font-medium text-slate-700 mb-2">还没有装修项目</h3>
            <p className="text-slate-500 mb-4">创建你的第一个装修项目，开始追踪花费</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              创建项目
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* 创建项目弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">新建装修项目</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">项目名称 *</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="如：我的新家装修"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">项目描述</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
                  placeholder="可选的项目描述..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

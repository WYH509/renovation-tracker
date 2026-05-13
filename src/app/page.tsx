'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProjectCard from '../components/ProjectCard'
import StatsCharts from '../components/StatsCharts'
import { Plus, TrendingUp, Wallet, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
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
    <div className="max-w-2xl mx-auto px-4 space-y-6">
      {/* iOS Large Title */}
      <div className="pt-2">
        <h1 className="ios-large-title text-gray-900">概览</h1>
      </div>

      {/* iOS Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="ios-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp size={16} className="text-ios-blue" />
              </div>
              <span className="text-sm text-gray-500">总花费</span>
            </div>
            <p className="ios-full-amount text-gray-900">{formatCurrency(stats.totalSpent)}</p>
          </div>
          <div className="ios-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet size={16} className="text-ios-green" />
              </div>
              <span className="text-sm text-gray-500">已付款</span>
            </div>
            <p className="ios-full-amount text-ios-green">{formatCurrency(stats.totalPaid)}</p>
          </div>
          <div className="ios-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock size={16} className="text-ios-orange" />
              </div>
              <span className="text-sm text-gray-500">待付款</span>
            </div>
            <p className="ios-full-amount text-ios-orange">{formatCurrency(stats.totalUnpaid)}</p>
          </div>
          <div className="ios-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <AlertTriangle size={16} className="text-ios-purple" />
              </div>
              <span className="text-sm text-gray-500">采购项</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.itemsCount}</p>
          </div>
        </div>
      )}

      {/* iOS Charts Card */}
      {stats && stats.byCategory.length > 0 && (
        <StatsCharts data={stats} />
      )}

      {/* iOS Section - Projects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="ios-headline text-gray-900">我的项目</h2>
          <Link 
            href="/projects"
            className="text-ios-blue text-sm font-medium flex items-center gap-0.5"
          >
            查看全部 <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="ios-card p-8 text-center">
            <p className="text-gray-400">加载中...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="ios-card p-8 text-center">
            <span className="text-5xl mb-3 block">🏠</span>
            <h3 className="ios-headline text-gray-900 mb-1">还没有装修项目</h3>
            <p className="text-gray-500 text-sm mb-4">创建你的第一个装修项目</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="ios-btn-filled max-w-xs"
            >
              创建项目
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 3).map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* iOS FAB Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-ios-blue text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* iOS Create Modal */}
      {showCreateModal && (
        <div className="ios-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="ios-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="ios-title text-gray-900">新建项目</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="ios-label">项目名称 *</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="ios-input"
                  placeholder="如：我的新家装修"
                />
              </div>
              <div>
                <label className="ios-label">项目描述</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={3}
                  className="ios-input resize-none"
                  placeholder="简单描述一下..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="ios-btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateProject}
                  className="ios-btn-filled"
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

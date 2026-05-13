'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProjectCard from '../../components/ProjectCard'
import { Plus, FolderKanban } from 'lucide-react'

interface Project {
  id: number
  name: string
  description: string | null
  createdAt: string
  _count: { items: number; categories: number }
  totalSpent: number
  totalPaid: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
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
        <h1 className="ios-large-title text-gray-900">项目</h1>
        <p className="text-gray-500 text-sm mt-1">管理你的装修项目</p>
      </div>

      {/* iOS Content */}
      {loading ? (
        <div className="ios-card p-8 text-center">
          <p className="text-gray-400">加载中...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="ios-card p-8 text-center">
          <span className="text-5xl mb-3 block">🏗️</span>
          <h3 className="ios-headline text-gray-900 mb-1">还没有装修项目</h3>
          <p className="text-gray-500 text-sm mb-4">创建你的第一个项目开始追踪花费</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="ios-btn-filled max-w-xs"
          >
            创建项目
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

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

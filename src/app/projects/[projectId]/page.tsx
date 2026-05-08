'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ItemList from '@/components/ItemList'
import ItemForm from '@/components/ItemForm'
import { ArrowLeft, Plus, FolderKanban, BarChart3, Bell, Edit2, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Category { id: number; name: string }
interface Item {
  id: number
  name: string
  unit: string | null
  quantity: string | null
  totalPrice: string | null
  paidAmount: string | null
  paymentStatus: string
  paymentDate: string | null
  expectedDeliveryDate: string | null
  isCompleted: boolean
  category: { name: string }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [project, setProject] = useState<any>(null)
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [activeTab, setActiveTab] = useState<'items' | 'reports' | 'reminders'>('items')

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const [projectRes, itemsRes, categoriesRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/items`),
        fetch(`/api/projects/${projectId}/categories`)
      ])
      
      const projectData = await projectRes.json()
      const itemsData = await itemsRes.json()
      const categoriesData = await categoriesRes.json()

      setProject(projectData)
      setItems(itemsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateItem = async (formData: any) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setShowItemForm(false)
        fetchProjectData()
      }
    } catch (error) {
      console.error('Failed to create item:', error)
    }
  }

  const handleUpdateItem = async (formData: any) => {
    if (!editingItem) return
    try {
      const res = await fetch(`/api/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setEditingItem(null)
        setShowItemForm(false)
        fetchProjectData()
      }
    } catch (error) {
      console.error('Failed to update item:', error)
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (!confirm('确定删除此采购项？')) return
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' })
      fetchProjectData()
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setShowItemForm(true)
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">加载中...</div>
  }

  if (!project) {
    return <div className="text-center py-12 text-slate-400">项目不存在</div>
  }

  const totalSpent = items.reduce((sum, i) => sum + parseFloat(i.totalPrice || '0'), 0)
  const totalPaid = items.reduce((sum, i) => sum + parseFloat(i.paidAmount || '0'), 0)

  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-slate-500 mt-1">{project.description}</p>
          )}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">总花费</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">已付款</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">待付款</p>
          <p className="text-xl font-bold text-amber-600">{formatCurrency(totalSpent - totalPaid)}</p>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
            activeTab === 'items' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FolderKanban size={16} />
          采购项
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
            activeTab === 'reports' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 size={16} />
          数据报表
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
            activeTab === 'reminders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bell size={16} />
          提醒
        </button>
      </div>

      {/* 内容区 */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">共 {items.length} 个采购项</p>
            <button
              onClick={() => { setEditingItem(null); setShowItemForm(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus size={18} />
              添加采购项
            </button>
          </div>
          <ItemList items={items} onEdit={handleEditItem} onDelete={handleDeleteItem} />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-slate-500 text-center py-8">数据报表功能开发中...</p>
          <div className="flex gap-3 justify-center">
            <a
              href={`/api/export?projectId=${projectId}&format=excel`}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
            >
              导出 Excel
            </a>
            <a
              href={`/api/export?projectId=${projectId}&format=pdf`}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              导出 PDF
            </a>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-slate-500 text-center py-8">提醒功能开发中...</p>
        </div>
      )}

      {/* 添加/编辑采购项弹窗 */}
      {showItemForm && (
        <ItemForm
          categories={categories}
          materialTypes={[]}
          initialData={editingItem ? {
            name: editingItem.name,
            categoryId: categories.find(c => c.name === editingItem.category.name)?.id || categories[0]?.id,
            unit: editingItem.unit || '',
            quantity: editingItem.quantity || '',
            unitPrice: '',
            totalPrice: editingItem.totalPrice || '',
            paidAmount: editingItem.paidAmount || '0',
            paymentDate: editingItem.paymentDate || '',
            expectedDeliveryDate: editingItem.expectedDeliveryDate || '',
            notes: ''
          } : undefined}
          onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
          onClose={() => { setShowItemForm(false); setEditingItem(null) }}
        />
      )}
    </div>
  )
}
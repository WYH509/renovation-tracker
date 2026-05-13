'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ItemList from '../../../components/ItemList'
import ItemForm from '../../../components/ItemForm'
import { ArrowLeft, Plus, FolderKanban, BarChart3, Bell, Edit2, Trash2, Wallet, Clock, CreditCard, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Category { id: number; name: string }
interface MaterialType { id: number; name: string; parentId: number | null }
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
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])
  const [newMaterialTypeName, setNewMaterialTypeName] = useState('')
  const [showMaterialTypeInput, setShowMaterialTypeInput] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [activeTab, setActiveTab] = useState<'items' | 'reports' | 'reminders'>('items')

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const [projectRes, itemsRes, categoriesRes, materialTypesRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/items`),
        fetch(`/api/projects/${projectId}/categories`),
        fetch(`/api/projects/${projectId}/material-types`)
      ])
      
      const projectData = await projectRes.json()
      const itemsData = await itemsRes.json()
      const categoriesData = await categoriesRes.json()
      const materialTypesData = await materialTypesRes.json()

      setProject(projectData)
      setItems(itemsData)
      setCategories(categoriesData)
      setMaterialTypes(materialTypesData || [])
    } catch (error) {
      console.error('Failed to fetch project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMaterialType = async () => {
    if (!newMaterialTypeName.trim()) return
    try {
      const res = await fetch(`/api/projects/${projectId}/material-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMaterialTypeName.trim() })
      })
      if (res.ok) {
        const newType = await res.json()
        setMaterialTypes(prev => [...prev, newType])
        setNewMaterialTypeName('')
        setShowMaterialTypeInput(false)
      }
    } catch (error) {
      console.error('Failed to create material type:', error)
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
    return (
      <div className="max-w-2xl mx-auto px-4">
        <div className="ios-card p-8 text-center">
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <div className="ios-card p-8 text-center">
          <p className="text-gray-400">项目不存在</p>
        </div>
      </div>
    )
  }

  const totalSpent = items.reduce((sum, i) => sum + parseFloat(i.totalPrice || '0'), 0)
  const totalPaid = items.reduce((sum, i) => sum + parseFloat(i.paidAmount || '0'), 0)

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-6">
      {/* iOS Back Button & Title */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => router.push('/')} 
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="ios-title text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* iOS Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="ios-card p-3 text-center">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-1">
            <Wallet size={16} className="text-ios-blue" />
          </div>
          <p className="text-xs text-gray-500 mb-0.5">总花费</p>
          <p className="font-bold text-gray-900 text-sm truncate ios-money">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="ios-card p-3 text-center">
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-1">
            <CreditCard size={16} className="text-ios-green" />
          </div>
          <p className="text-xs text-gray-500 mb-0.5">已付款</p>
          <p className="font-bold text-ios-green text-sm truncate ios-money">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="ios-card p-3 text-center">
          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-1">
            <Clock size={16} className="text-ios-orange" />
          </div>
          <p className="text-xs text-gray-500 mb-0.5">待付款</p>
          <p className="font-bold text-ios-orange text-sm truncate ios-money">{formatCurrency(totalSpent - totalPaid)}</p>
        </div>
      </div>

      {/* iOS Segmented Control */}
      <div className="flex justify-center">
        <div className="ios-segmented">
          <button
            onClick={() => setActiveTab('items')}
            className={`ios-segmented-btn ${activeTab === 'items' ? 'active' : ''}`}
          >
            <FolderKanban size={16} className="inline mr-1" />
            采购项
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`ios-segmented-btn ${activeTab === 'reports' ? 'active' : ''}`}
          >
            <BarChart3 size={16} className="inline mr-1" />
            报表
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`ios-segmented-btn ${activeTab === 'reminders' ? 'active' : ''}`}
          >
            <Bell size={16} className="inline mr-1" />
            提醒
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">共 {items.length} 个采购项</p>
            <button
              onClick={() => { setEditingItem(null); setShowItemForm(true) }}
              className="flex items-center gap-1 px-4 py-2 bg-ios-blue text-white rounded-lg text-sm font-medium active:opacity-80"
            >
              <Plus size={16} />
              添加
            </button>
          </div>
          <ItemList items={items} onEdit={handleEditItem} onDelete={handleDeleteItem} />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="ios-card p-6">
          <p className="text-center text-gray-400 py-4">数据报表功能开发中...</p>
          <div className="flex gap-3 justify-center">
            <a
              href={`/api/export?projectId=${projectId}&format=excel`}
              className="flex items-center gap-2 px-5 py-2.5 bg-ios-green text-white rounded-lg text-sm font-medium active:opacity-80"
            >
              Excel
            </a>
            <a
              href={`/api/export?projectId=${projectId}&format=pdf`}
              className="flex items-center gap-2 px-5 py-2.5 bg-ios-red text-white rounded-lg text-sm font-medium active:opacity-80"
            >
              PDF
            </a>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="ios-card p-6">
          <p className="text-center text-gray-400 py-4">提醒功能开发中...</p>
        </div>
      )}

      {/* iOS FAB Button */}
      {activeTab === 'items' && (
        <button
          onClick={() => { setEditingItem(null); setShowItemForm(true) }}
          className="fixed bottom-24 right-4 w-14 h-14 bg-ios-blue text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* Item Form Modal - Keep original ItemForm component */}
      {showItemForm && (
        <ItemForm
          categories={categories}
          materialTypes={materialTypes}
          onCreateMaterialType={handleCreateMaterialType}
          newMaterialTypeName={newMaterialTypeName}
          setNewMaterialTypeName={setNewMaterialTypeName}
          showMaterialTypeInput={showMaterialTypeInput}
          setShowMaterialTypeInput={setShowMaterialTypeInput}
          initialData={editingItem ? {
            name: editingItem.name,
            categoryId: categories.find(c => c.name === editingItem.category.name)?.id || categories[0]?.id,
            unit: editingItem.unit || '',
            quantity: editingItem.quantity || '',
            unitPrice: '',
            totalPrice: editingItem.totalPrice || '',
            paidAmount: editingItem.paidAmount || '0',
            paymentDate: editingItem.paymentDate || '',
            firstPaymentAmount: (editingItem as any).firstPaymentAmount || '',
            firstPaymentDate: (editingItem as any).firstPaymentDate || '',
            secondPaymentAmount: (editingItem as any).secondPaymentAmount || '',
            secondPaymentDate: (editingItem as any).secondPaymentDate || '',
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

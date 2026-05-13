'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ItemList from '../../../components/ItemList'
import ItemForm from '../../../components/ItemForm'
import { ArrowLeft, FolderKanban, BarChart3, Bell, Plus, Wallet, Clock, CreditCard } from 'lucide-react'
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
  firstPaymentAmount?: string | null
  firstPaymentDate?: string | null
  secondPaymentAmount?: string | null
  secondPaymentDate?: string | null
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [project, setProject] = useState<any>(null)
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])
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
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {/* iOS Back Button & Title */}
      <div className="pt-2 mb-4">
        <div className="flex items-center gap-3">
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

      {/* iOS Stat Cards - Full Width Amounts */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="ios-stat-card-lg text-center">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
            <Wallet size={16} className="text-ios-blue" />
          </div>
          <p className="text-xs text-gray-500 mb-1">总花费</p>
          <p className="ios-full-amount text-gray-900">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="ios-stat-card-lg text-center">
          <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
            <CreditCard size={16} className="text-ios-green" />
          </div>
          <p className="text-xs text-gray-500 mb-1">已付款</p>
          <p className="ios-full-amount text-ios-green">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="ios-stat-card-lg text-center">
          <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-2">
            <Clock size={16} className="text-ios-orange" />
          </div>
          <p className="text-xs text-gray-500 mb-1">待付款</p>
          <p className="ios-full-amount text-ios-orange">{formatCurrency(totalSpent - totalPaid)}</p>
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
          <ItemList 
            items={items} 
            projectId={parseInt(projectId)}
            onEdit={handleEditItem} 
            onDelete={handleDeleteItem} 
          />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="ios-card p-6">
            <h3 className="ios-headline text-gray-900 mb-4">数据报表</h3>
            <p className="text-gray-500 text-sm mb-4">导出项目数据进行统计分析</p>
            <div className="flex gap-3">
              <a
                href={`/api/export?projectId=${projectId}&format=excel`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-ios-green text-white rounded-lg text-sm font-medium active:opacity-80"
              >
                Excel 导出
              </a>
              <a
                href={`/api/export?projectId=${projectId}&format=pdf`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-ios-red text-white rounded-lg text-sm font-medium active:opacity-80"
              >
                PDF 导出
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="ios-card p-6">
            <h3 className="ios-headline text-gray-900 mb-4">提醒管理</h3>
            <p className="text-gray-500 text-sm">设置采购项的交货提醒</p>
            <p className="text-gray-400 text-xs mt-2">提醒功能开发中...</p>
          </div>
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

      {/* iOS Bottom Tab Bar */}
      <div className="ios-page-tab-bar">
        <button
          onClick={() => setActiveTab('items')}
          className={`ios-page-tab-item ${activeTab === 'items' ? 'active' : ''}`}
        >
          <FolderKanban size={22} strokeWidth={activeTab === 'items' ? 2.5 : 2} />
          <span className="text-xs font-medium mt-1">采购项</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`ios-page-tab-item ${activeTab === 'reports' ? 'active' : ''}`}
        >
          <BarChart3 size={22} strokeWidth={activeTab === 'reports' ? 2.5 : 2} />
          <span className="text-xs font-medium mt-1">报表</span>
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`ios-page-tab-item ${activeTab === 'reminders' ? 'active' : ''}`}
        >
          <Bell size={22} strokeWidth={activeTab === 'reminders' ? 2.5 : 2} />
          <span className="text-xs font-medium mt-1">提醒</span>
        </button>
      </div>

      {/* Item Form Modal */}
      {showItemForm && (
        <ItemForm
          categories={categories}
          materialTypes={materialTypes}
          initialData={editingItem ? {
            name: editingItem.name,
            categoryId: categories.find(c => c.name === editingItem.category.name)?.id || categories[0]?.id,
            unit: editingItem.unit || '',
            quantity: editingItem.quantity || '',
            unitPrice: '',
            totalPrice: editingItem.totalPrice || '',
            paidAmount: editingItem.paidAmount || '0',
            paymentDate: editingItem.paymentDate || '',
            firstPaymentAmount: editingItem.firstPaymentAmount || '',
            firstPaymentDate: editingItem.firstPaymentDate || '',
            secondPaymentAmount: editingItem.secondPaymentAmount || '',
            secondPaymentDate: editingItem.secondPaymentDate || '',
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

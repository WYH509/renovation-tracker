'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Calendar, Package, Edit2, Trash2, Plus, CheckCircle, Clock } from 'lucide-react'

interface PaymentRecord {
  id: string
  label: string
  amount: number
  date: string | null
}

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
  notes: string | null
  category: { id: number; name: string }
  materialType: { id: number; name: string } | null
  firstPaymentAmount: string | null
  firstPaymentDate: string | null
  secondPaymentAmount: string | null
  secondPaymentDate: string | null
}

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const itemId = params.itemId as string

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchItem()
  }, [itemId])

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/items/${itemId}`)
      if (res.ok) {
        const data = await res.json()
        setItem(data)
      }
    } catch (error) {
      console.error('Failed to fetch item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定删除此采购项？删除后无法恢复。')) return
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push(`/projects/${projectId}`)
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'paid': return '已付清'
      case 'partial': return '部分付款'
      case 'unpaid': return '未付款'
      default: return status
    }
  }

  const getPaymentRecords = (): PaymentRecord[] => {
    if (!item) return []
    const records: PaymentRecord[] = []
    
    if (item.firstPaymentAmount && parseFloat(item.firstPaymentAmount) > 0) {
      records.push({
        id: 'first',
        label: '定金',
        amount: parseFloat(item.firstPaymentAmount),
        date: item.firstPaymentDate
      })
    }
    
    if (item.secondPaymentAmount && parseFloat(item.secondPaymentAmount) > 0) {
      records.push({
        id: 'second',
        label: '第二笔',
        amount: parseFloat(item.secondPaymentAmount),
        date: item.secondPaymentDate
      })
    }
    
    // Add remaining paid amount as "其他付款" if there's a gap
    const totalPaid = parseFloat(item.paidAmount || '0')
    const recordedPaid = records.reduce((sum, r) => sum + r.amount, 0)
    const remaining = totalPaid - recordedPaid
    
    if (remaining > 0.01) {
      records.push({
        id: 'other',
        label: '其他付款',
        amount: remaining,
        date: item.paymentDate
      })
    }
    
    return records
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

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <div className="ios-card p-8 text-center">
          <p className="text-gray-400">采购项不存在</p>
        </div>
      </div>
    )
  }

  const total = parseFloat(item.totalPrice || '0')
  const paid = parseFloat(item.paidAmount || '0')
  const unpaid = total - paid
  const paymentRecords = getPaymentRecords()

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {/* iOS Back Button & Title */}
      <div className="pt-2 mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/projects/${projectId}`)} 
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="ios-title text-gray-900">{item.name}</h1>
          </div>
          <button 
            onClick={() => setShowEditModal(true)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
          >
            <Edit2 size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Payment Status Banner */}
      <div className={`ios-card p-4 mb-4 border-l-4 ${
        item.paymentStatus === 'paid' ? 'border-ios-green' :
        item.paymentStatus === 'partial' ? 'border-ios-orange' : 'border-ios-red'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.paymentStatus === 'paid' ? (
              <CheckCircle size={24} className="text-ios-green" />
            ) : item.paymentStatus === 'partial' ? (
              <Clock size={24} className="text-ios-orange" />
            ) : (
              <Clock size={24} className="text-ios-red" />
            )}
            <div>
              <p className="font-medium text-gray-900">{getStatusLabel(item.paymentStatus)}</p>
              <p className="text-xs text-gray-500">
                {item.paymentDate ? `付款日期: ${formatDate(item.paymentDate)}` : '暂无付款记录'}
              </p>
            </div>
          </div>
          <span className={`ios-status ${
            item.paymentStatus === 'paid' ? 'ios-status-paid' :
            item.paymentStatus === 'partial' ? 'ios-status-partial' : 'ios-status-unpaid'
          }`}>
            {getStatusLabel(item.paymentStatus)}
          </span>
        </div>
      </div>

      {/* Amount Summary */}
      <div className="ios-card p-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">总价</p>
            <p className="text-lg font-bold text-gray-900 ios-money">{formatCurrency(total)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">已付</p>
            <p className="text-lg font-bold text-ios-green ios-money">{formatCurrency(paid)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">待付</p>
            <p className="text-lg font-bold text-ios-orange ios-money">{formatCurrency(unpaid)}</p>
          </div>
        </div>
      </div>

      {/* Payment Records */}
      <div className="ios-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">付款明细</h3>
          <button 
            onClick={() => setShowEditModal(true)}
            className="text-xs text-ios-blue font-medium"
          >
            编辑
          </button>
        </div>
        
        {paymentRecords.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">暂无付款记录</p>
        ) : (
          <div className="space-y-2">
            {paymentRecords.map((record) => (
              <div key={record.id} className="ios-payment-card">
                <div>
                  <p className="ios-payment-label">{record.label}</p>
                  {record.date && (
                    <p className="text-xs text-gray-400">{formatDate(record.date)}</p>
                  )}
                </div>
                <p className="ios-payment-amount text-ios-green">
                  {formatCurrency(record.amount)}
                </p>
              </div>
            ))}
            
            {/* Total Paid Summary */}
            <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
              <span className="text-sm font-medium text-gray-700">已付总额</span>
              <span className="text-base font-bold text-ios-green ios-money">
                {formatCurrency(paid)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="ios-card p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">采购信息</h3>
        
        <div className="space-y-3">
          <div className="ios-item-row">
            <span className="ios-item-row-label">施工板块</span>
            <span className="ios-item-row-value">{item.category.name}</span>
          </div>
          
          {item.materialType && (
            <div className="ios-item-row">
              <span className="ios-item-row-label">材料分类</span>
              <span className="ios-item-row-value">{item.materialType.name}</span>
            </div>
          )}
          
          {item.unit && item.quantity && (
            <div className="ios-item-row">
              <span className="ios-item-row-label">数量</span>
              <span className="ios-item-row-value">{item.quantity}{item.unit}</span>
            </div>
          )}
          
          {item.expectedDeliveryDate && (
            <div className="ios-item-row">
              <span className="ios-item-row-label">预计交货</span>
              <span className="ios-item-row-value flex items-center gap-1">
                <Calendar size={14} className="text-gray-400" />
                {formatDate(item.expectedDeliveryDate)}
              </span>
            </div>
          )}
          
          {item.notes && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">备注</p>
              <p className="text-sm text-gray-700">{item.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="ios-bottom-bar">
        <div className="flex gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="ios-bottom-btn ios-bottom-btn-primary"
          >
            编辑
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="ios-bottom-btn ios-bottom-btn-danger"
          >
            删除
          </button>
        </div>
      </div>

      {/* Edit Modal - Use ItemForm */}
      {showEditModal && (
        <div className="ios-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="ios-modal-content max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="ios-title text-gray-900">编辑采购项</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 text-center py-8">
                编辑功能将通过表单组件加载
              </p>
              <button
                onClick={() => setShowEditModal(false)}
                className="ios-btn-filled"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="ios-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="ios-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-ios-red" />
              </div>
              <h2 className="ios-title text-gray-900 mb-2">确定删除？</h2>
              <p className="text-sm text-gray-500">
                删除后无法恢复，所有付款记录将被清除。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="ios-bottom-btn ios-bottom-btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="ios-bottom-btn ios-bottom-btn-danger"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

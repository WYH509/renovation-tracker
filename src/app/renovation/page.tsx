'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ChevronRight, Package, X } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RenovationRecord {
  recordId: string
  projectName: string
  category: string[]
  amount: number
  buyDate: Date | null
  notes: string
  status: string[]
}

interface RenovationStats {
  totalSpent: number
  totalPaid: number
  totalUnpaid: number
  byCategory: { name: string; spent: number; paid: number }[]
  byStatus: { name: string; count: number; amount: number }[]
}

const CATEGORIES = ['设计费', '硬装施工', '软装采购', '家电家具', '其他']
const STATUSES = ['已付款', '待付款', '已收货']

export default function RenovationPage() {
  const [items, setItems] = useState<RenovationRecord[]>([])
  const [stats, setStats] = useState<RenovationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RenovationRecord | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<string[]>([])
  const [formAmount, setFormAmount] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formStatus, setFormStatus] = useState<string[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/renovation')
      const data = await res.json()
      setItems(data.items || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Failed to fetch renovation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormName('')
    setFormCategory([])
    setFormAmount('')
    setFormDate('')
    setFormNotes('')
    setFormStatus([])
  }

  const handleAddItem = async () => {
    if (!formName.trim() || !formAmount) return

    try {
      await fetch('/api/renovation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: formName,
          category: formCategory,
          amount: Number(formAmount),
          buyDate: formDate || null,
          notes: formNotes,
          status: formStatus,
        })
      })
      setShowAddModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Failed to add item:', error)
    }
  }

  const toggleCategory = (cat: string) => {
    setFormCategory(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const toggleStatus = (s: string) => {
    setFormStatus(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const openDetail = (item: RenovationRecord) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <div className="pt-2">
          <h1 className="ios-large-title text-gray-900">装修支出</h1>
        </div>
        <div className="ios-card p-8 text-center">
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <h1 className="ios-large-title text-gray-900">装修支出</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 bg-ios-blue text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="ios-card p-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">总花费</p>
              <p className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(stats.totalSpent)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">已付款</p>
              <p className="text-sm font-bold text-ios-green tabular-nums">{formatCurrency(stats.totalPaid)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">待付款</p>
              <p className="text-sm font-bold text-ios-orange tabular-nums">{formatCurrency(stats.totalUnpaid)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="ios-card overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">支出明细</h3>
          <span className="text-xs text-gray-400">{items.length} 项</span>
        </div>
        
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl mb-3 block">📦</span>
            <p className="text-gray-500 mb-1">暂无装修支出</p>
            <p className="text-xs text-gray-400 mb-4">点击右上角添加第一笔支出</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="ios-btn-filled max-w-xs mx-auto"
            >
              添加支出
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item, i) => (
              <div
                key={i}
                className="ios-list-row cursor-pointer"
                onClick={() => openDetail(item)}
              >
                <div className="ios-list-row-content">
                  <p className="ios-list-row-title">{item.projectName}</p>
                  <p className="ios-list-row-subtitle">
                    {item.category.join('、')} · {formatDate(item.buyDate)}
                  </p>
                </div>
                <div className="ios-list-row-action flex items-center gap-2">
                  <span className={`text-sm font-semibold tabular-nums ${item.status.includes('待付款') ? 'text-ios-orange' : 'text-gray-900'}`}>
                    {formatCurrency(item.amount)}
                  </span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom safe area */}
      <div className="h-20" />

      {/* Add Modal */}
      {showAddModal && (
        <div className="ios-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ios-modal-content p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="ios-title text-gray-900">添加支出</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Project Name */}
              <div>
                <label className="ios-label">项目名称 *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="ios-input"
                  placeholder="如：全屋地板"
                />
              </div>

              {/* Category */}
              <div>
                <label className="ios-label">分类</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        formCategory.includes(cat)
                          ? 'bg-ios-blue text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="ios-label">金额 *</label>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="ios-input"
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div>
                <label className="ios-label">购买日期</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="ios-input"
                />
              </div>

              {/* Status */}
              <div>
                <label className="ios-label">状态</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        formStatus.includes(s)
                          ? s === '已付款' || s === '已收货'
                            ? 'bg-ios-green text-white'
                            : 'bg-ios-orange text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="ios-label">备注</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="ios-input resize-none"
                  placeholder="可选备注..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="ios-btn-secondary">
                  取消
                </button>
                <button onClick={handleAddItem} className="ios-btn-filled">
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="ios-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="ios-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="ios-title text-gray-900">支出详情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="ios-item-row">
                <span className="ios-item-row-label">项目名称</span>
                <span className="ios-item-row-value">{selectedItem.projectName}</span>
              </div>
              <div className="ios-item-row">
                <span className="ios-item-row-label">分类</span>
                <span className="ios-item-row-value">{selectedItem.category.join('、') || '-'}</span>
              </div>
              <div className="ios-item-row">
                <span className="ios-item-row-label">金额</span>
                <span className="ios-item-row-value ios-money">{formatCurrency(selectedItem.amount)}</span>
              </div>
              <div className="ios-item-row">
                <span className="ios-item-row-label">购买日期</span>
                <span className="ios-item-row-value">{formatDate(selectedItem.buyDate)}</span>
              </div>
              <div className="ios-item-row">
                <span className="ios-item-row-label">状态</span>
                <div className="flex gap-1">
                  {selectedItem.status.map(s => (
                    <span key={s} className={`ios-status ${s === '已付款' || s === '已收货' ? 'ios-status-paid' : 'ios-status-unpaid'}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {selectedItem.notes && (
                <div className="ios-item-row">
                  <span className="ios-item-row-label">备注</span>
                  <span className="ios-item-row-value text-right max-w-[200px]">{selectedItem.notes}</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button onClick={() => setShowDetailModal(false)} className="ios-btn-secondary">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
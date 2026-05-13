'use client'

import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ChevronRight, Package, Calendar } from 'lucide-react'

interface PaymentRecord {
  amount: string
  date: string | null
  label: string
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
  category: { name: string }
  firstPaymentAmount?: string | null
  firstPaymentDate?: string | null
  secondPaymentAmount?: string | null
  secondPaymentDate?: string | null
}

interface ItemListProps {
  items: Item[]
  projectId: number
  onEdit: (item: Item) => void
  onDelete: (id: number) => void
}

export default function ItemList({ items, projectId, onEdit, onDelete }: ItemListProps) {
  const router = useRouter()

  const handleItemClick = (item: Item) => {
    router.push(`/projects/${projectId}/items/${item.id}`)
  }

  const getPaymentRecords = (item: Item): PaymentRecord[] => {
    const records: PaymentRecord[] = []
    if (item.firstPaymentAmount && parseFloat(item.firstPaymentAmount) > 0) {
      records.push({
        amount: item.firstPaymentAmount || '',
        date: item.firstPaymentDate ?? null,
        label: '定金'
      })
    }
    if (item.secondPaymentAmount && parseFloat(item.secondPaymentAmount) > 0) {
      records.push({
        amount: item.secondPaymentAmount || '',
        date: item.secondPaymentDate ?? null,
        label: '第二笔'
      })
    }
    return records
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'paid': return '已付清'
      case 'partial': return '部分付款'
      case 'unpaid': return '未付款'
      default: return status
    }
  }

  if (items.length === 0) {
    return (
      <div className="ios-card p-8 text-center">
        <span className="text-4xl mb-3 block">📦</span>
        <p className="text-gray-500 text-sm">暂无采购项</p>
        <p className="text-gray-400 text-xs mt-1">点击右上角按钮添加</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const total = parseFloat(item.totalPrice || '0')
        const paid = parseFloat(item.paidAmount || '0')
        const unpaid = total - paid
        const paymentRecords = getPaymentRecords(item)

        return (
          <div 
            key={item.id} 
            className="ios-item-card"
            onClick={() => handleItemClick(item)}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
                  <span className={`ios-status ${
                    item.paymentStatus === 'paid' ? 'ios-status-paid' : 
                    item.paymentStatus === 'partial' ? 'ios-status-partial' : 'ios-status-unpaid'
                  }`}>
                    {getStatusLabel(item.paymentStatus)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Package size={12} />
                    {item.category.name}
                  </span>
                  {item.unit && item.quantity && (
                    <span>{item.quantity}{item.unit}</span>
                  )}
                  {item.expectedDeliveryDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(item.expectedDeliveryDate)}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="ios-chevron flex-shrink-0 mt-1" />
            </div>

            {/* Payment Info - Full Amount Display */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-0.5">总价</p>
                <p className="text-sm font-bold text-gray-900 ios-money">{formatCurrency(total)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-0.5">已付</p>
                <p className="text-sm font-bold text-ios-green ios-money">{formatCurrency(paid)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-0.5">待付</p>
                <p className="text-sm font-bold text-ios-orange ios-money">{formatCurrency(unpaid)}</p>
              </div>
            </div>

            {/* Payment Records Preview */}
            {paymentRecords.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">付款记录</p>
                <div className="flex flex-wrap gap-2">
                  {paymentRecords.map((record, idx) => (
                    <span key={idx} className="text-xs bg-blue-50 text-ios-blue px-2 py-0.5 rounded">
                      {record.label}: ¥{parseFloat(record.amount).toLocaleString('zh-CN')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
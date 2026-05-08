'use client'

import { formatCurrency, formatDate, getStatusBgColor, getStatusColor } from '@/lib/utils'

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

export default function ItemList({ items, onEdit, onDelete }: { items: Item[]; onEdit: (item: Item) => void; onDelete: (id: number) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wide">采购项</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wide">板块</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wide">总价</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wide">已付</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wide">状态</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wide">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  暂无采购项，点击上方按钮添加
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const total = parseFloat(item.totalPrice || '0')
                const paid = parseFloat(item.paidAmount || '0')
                const unpaid = total - paid

                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          {item.unit && item.quantity ? `${item.quantity}${item.unit}` : ''}
                          {item.expectedDeliveryDate && ` · 交货 ${formatDate(item.expectedDeliveryDate)}`}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
                        {item.category.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {formatCurrency(total)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-600">{formatCurrency(paid)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(item.paymentStatus)} ${getStatusColor(item.paymentStatus)}`}>
                        {item.paymentStatus === 'paid' ? '已付清' : item.paymentStatus === 'partial' ? '部分付款' : '未付款'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-700 text-sm mr-3"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
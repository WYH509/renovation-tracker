'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface ItemFormData {
  name: string
  categoryId: number
  materialTypeId?: number
  unit: string
  quantity: string
  unitPrice: string
  totalPrice: string
  paidAmount: string
  paymentDate: string
  expectedDeliveryDate: string
  reminderDays: string
  notes: string
}

interface Category {
  id: number
  name: string
}

interface MaterialType {
  id: number
  name: string
}

interface ItemFormProps {
  categories: Category[]
  materialTypes: MaterialType[]
  onCreateMaterialType?: () => void
  newMaterialTypeName?: string
  setNewMaterialTypeName?: (v: string) => void
  showMaterialTypeInput?: boolean
  setShowMaterialTypeInput?: (v: boolean) => void
  initialData?: Partial<ItemFormData>
  onSubmit: (data: ItemFormData) => void
  onClose: () => void
}

export default function ItemForm({ categories, materialTypes, initialData, onSubmit, onClose }: ItemFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: initialData?.name || '',
    categoryId: initialData?.categoryId || categories[0]?.id || 0,
    materialTypeId: initialData?.materialTypeId,
    unit: initialData?.unit || '',
    quantity: initialData?.quantity || '',
    unitPrice: initialData?.unitPrice || '',
    totalPrice: initialData?.totalPrice || '',
    paidAmount: initialData?.paidAmount || '0',
    paymentDate: initialData?.paymentDate || '',
    expectedDeliveryDate: initialData?.expectedDeliveryDate || '',
    reminderDays: initialData?.reminderDays || '3',
    notes: initialData?.notes || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'quantity' || name === 'unitPrice') {
      const qty = name === 'quantity' ? parseFloat(value) || 0 : parseFloat(formData.quantity) || 0
      const price = name === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(formData.unitPrice) || 0
      setFormData(prev => ({ ...prev, totalPrice: (qty * price).toString() }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{initialData?.name ? '编辑采购项' : '新增采购项'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">项目名称 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：诺贝尔瓷砖 800x800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">施工板块 *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">材料分类</label>
              <select
                name="materialTypeId"
                value={formData.materialTypeId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择</option>
                {materialTypes.map(mt => (
                  <option key={mt.id} value={mt.id}>{mt.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="如：块、米"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">数量</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">单价(元)</label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">总价(元)</label>
              <input
                type="number"
                name="totalPrice"
                value={formData.totalPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">已付款(元)</label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">付款日期</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">预计交货日期</label>
              <input
                type="date"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">提前提醒(天)</label>
              <input
                type="number"
                name="reminderDays"
                value={formData.reminderDays}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
              placeholder="其他备注信息..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
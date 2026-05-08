'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface StatsData {
  totalSpent: number
  totalPaid: number
  totalUnpaid: number
  itemsCount: number
  completedItems: number
  byCategory: { name: string; spent: number; paid: number }[]
  monthlyTrend: { month: string; amount: number }[]
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function StatsCharts({ data }: { data: StatsData }) {
  return (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">总花费</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(data.totalSpent)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">已付款</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(data.totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">待付款</p>
          <p className="text-xl font-bold text-amber-600">{formatCurrency(data.totalUnpaid)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">采购项</p>
          <p className="text-xl font-bold text-slate-700">{data.itemsCount}</p>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 分类费用饼图 */}
        {data.byCategory.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">费用分类占比</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.byCategory}
                  dataKey="spent"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.byCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 月度趋势柱状图 */}
        {data.monthlyTrend.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">月度费用趋势</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 分类明细 */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">各板块费用明细</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">板块</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">花费</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">已付</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">待付</th>
              </tr>
            </thead>
            <tbody>
              {data.byCategory.map((cat, i) => {
                const unpaid = cat.spent - cat.paid
                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">{formatCurrency(cat.spent)}</td>
                    <td className="py-3 px-4 text-right text-emerald-600">{formatCurrency(cat.paid)}</td>
                    <td className="py-3 px-4 text-right text-amber-600">{formatCurrency(unpaid)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
'use client'

import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface StatsData {
  totalSpent: number
  totalPaid: number
  totalUnpaid: number
  itemsCount: number
  completedItems: number
  byCategory: { name: string; spent: number; paid: number }[]
  monthlyTrend: { month: string; amount: number }[]
}

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FFCC00', '#FF2D55']

export default function StatsCharts({ data }: { data: StatsData }) {
  return (
    <div className="space-y-4">
      {/* iOS Card with Charts */}
      <div className="ios-card p-5">
        <h3 className="ios-headline text-gray-900 mb-4">费用概览</h3>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">总花费</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(data.totalSpent)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">已付款</p>
            <p className="text-lg font-bold text-ios-green">{formatCurrency(data.totalPaid)}</p>
          </div>
        </div>

        {/* Category Pie Chart */}
        {data.byCategory.length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-medium text-gray-700 mb-3">分类占比</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.byCategory}
                  dataKey="spent"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.byCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Trend Bar Chart */}
        {data.monthlyTrend.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">月度趋势</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8e8e93' }} axisLine={false} tickLine={false} tickFormatter={(v) => `¥${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#007AFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* iOS Category List Card */}
      {data.byCategory.length > 0 && (
        <div className="ios-card p-5">
          <h3 className="ios-headline text-gray-900 mb-4">板块明细</h3>
          <div className="space-y-3">
            {data.byCategory.map((cat, i) => {
              const unpaid = cat.spent - cat.paid
              return (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                    />
                    <span className="text-gray-900 font-medium">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-semibold">{formatCurrency(cat.spent)}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(cat.paid)} 已付 · {formatCurrency(unpaid)} 待付</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

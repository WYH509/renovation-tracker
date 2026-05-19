'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Wallet, Clock, PieChart, ArrowUpRight, ArrowDownRight, ChevronRight, Plus, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FundStats {
  name: string
  buyAmount: number
  yearStartValue: number
  currentValue: number
  weekProfit: number
  weekReturn: number
  monthProfit: number
  monthReturn: number
  yearProfit: number
  yearReturn: number
}

interface FundSummary {
  totalInvested: number
  totalCurrentValue: number
  totalYearProfit: number
  totalWeekProfit: number
  totalMonthProfit: number
  fundCount: number
}

interface RenovationStats {
  totalSpent: number
  totalPaid: number
  totalUnpaid: number
  byCategory: { name: string; spent: number; paid: number }[]
  byStatus: { name: string; count: number; amount: number }[]
}

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FFCC00', '#FF2D55']

function formatPercent(val: number): string {
  const sign = val >= 0 ? '+' : ''
  return `${sign}${val.toFixed(2)}%`
}

function ProfitBadge({ value, return: ret, small = false }: { value: number; return: number; small?: boolean }) {
  const isPositive = value >= 0
  const colorClass = isPositive ? 'text-ios-green' : 'text-ios-red'
  const bgClass = isPositive ? 'bg-green-50' : 'bg-red-50'
  const Arrow = isPositive ? ArrowUpRight : ArrowDownRight
  
  return (
    <div className={`flex items-center gap-1 ${bgClass} px-2 py-1 rounded-lg`}>
      <Arrow size={14} className={colorClass} />
      <span className={`font-medium tabular-nums ${colorClass} ${small ? 'text-xs' : 'text-sm'}`}>
        {formatCurrency(Math.abs(value))}
      </span>
      <span className={`${colorClass} ${small ? 'text-xs' : 'text-sm'}`}>
        ({formatPercent(ret)})
      </span>
    </div>
  )
}

export default function HomePage() {
  const [funds, setFunds] = useState<FundStats[]>([])
  const [fundSummary, setFundSummary] = useState<FundSummary | null>(null)
  const [renovation, setRenovation] = useState<RenovationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'funds' | 'renovation'>('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [fundRes, renoRes] = await Promise.all([
        fetch('/api/funds'),
        fetch('/api/renovation'),
      ])
      const fundData = await fundRes.json()
      const renoData = await renoRes.json()
      
      setFunds(fundData.stats || [])
      setFundSummary(fundData.summary || null)
      setRenovation(renoData.stats || null)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <div className="pt-2">
          <h1 className="ios-large-title text-gray-900">【聚财通录 · 资产总览】</h1>
        </div>
        <div className="ios-card p-8 text-center">
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  // Calculate portfolio-level stats
  const totalInvested = fundSummary?.totalInvested || 0
  const totalCurrentValue = fundSummary?.totalCurrentValue || 0
  const totalYearProfit = fundSummary?.totalYearProfit || 0
  const yearReturn = totalInvested > 0 ? (totalYearProfit / totalInvested) * 100 : 0

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-6">
      {/* iOS Large Title */}
      <div className="pt-2">
        <h1 className="ios-large-title text-gray-900">我的资产</h1>
      </div>

      {/* Tab Bar */}
      <div className="ios-segmented w-full">
        <button
          onClick={() => setActiveTab('overview')}
          className={`ios-segmented-btn flex-1 ${activeTab === 'overview' ? 'active' : ''}`}
        >
          总览
        </button>
        <button
          onClick={() => setActiveTab('funds')}
          className={`ios-segmented-btn flex-1 ${activeTab === 'funds' ? 'active' : ''}`}
        >
          基金
        </button>
        <button
          onClick={() => setActiveTab('renovation')}
          className={`ios-segmented-btn flex-1 ${activeTab === 'renovation' ? 'active' : ''}`}
        >
          装修
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Portfolio Summary Card */}
          <div className="ios-card p-5">
            <h3 className="ios-headline text-gray-900 mb-4">基金总览</h3>
            
            <div className="space-y-4">
              {/* Main Values */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500 mb-1">当前总市值</p>
                  <p className="ios-full-amount text-gray-900">{formatCurrency(totalCurrentValue)}</p>
                </div>
                <ProfitBadge value={totalYearProfit} return={yearReturn} />
              </div>
              
              <div className="h-px bg-gray-100" />
              
              {/* Secondary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">累计投入</p>
                  <p className="text-base font-semibold text-gray-900 tabular-nums">{formatCurrency(totalInvested)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">本年收益</p>
                  <p className={`text-base font-semibold tabular-nums ${totalYearProfit >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                    {formatCurrency(totalYearProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">本周收益</p>
                  <p className={`text-base font-semibold tabular-nums ${(fundSummary?.totalWeekProfit || 0) >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                    {formatCurrency(fundSummary?.totalWeekProfit || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">本月收益</p>
                  <p className={`text-base font-semibold tabular-nums ${(fundSummary?.totalMonthProfit || 0) >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                    {formatCurrency(fundSummary?.totalMonthProfit || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Renovation Summary Card */}
          {renovation && (
            <div className="ios-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="ios-headline text-gray-900">装修总支出</h3>
                <Link href="/renovation" className="text-ios-blue text-sm font-medium flex items-center gap-0.5">
                  明细 <ChevronRight size={14} />
                </Link>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">总花费</p>
                    <p className="ios-full-amount text-gray-900">{formatCurrency(renovation.totalSpent)}</p>
                  </div>
                </div>
                
                <div className="h-px bg-gray-100" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">已付款</p>
                    <p className="text-base font-semibold text-ios-green tabular-nums">{formatCurrency(renovation.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">待付款</p>
                    <p className="text-base font-semibold text-ios-orange tabular-nums">{formatCurrency(renovation.totalUnpaid)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Breakdown - Renovation */}
          {renovation && renovation.byCategory.length > 0 && (
            <div className="ios-card p-5">
              <h3 className="ios-headline text-gray-900 mb-4">装修分类</h3>
              <div className="space-y-3">
                {renovation.byCategory.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(cat.spent)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Funds Tab */}
      {activeTab === 'funds' && (
        <>
          {/* Portfolio Summary */}
          <div className="ios-card p-5">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">当前总市值</p>
                <p className="ios-full-amount text-gray-900">{formatCurrency(totalCurrentValue)}</p>
              </div>
              <ProfitBadge value={totalYearProfit} return={yearReturn} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">持有基金</p>
                <p className="text-lg font-bold text-gray-900">{fundSummary?.fundCount || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">本周</p>
                <p className={`text-sm font-bold tabular-nums ${(fundSummary?.totalWeekProfit || 0) >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                  {formatPercent(fundSummary?.totalWeekProfit || 0)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">本月</p>
                <p className={`text-sm font-bold tabular-nums ${(fundSummary?.totalMonthProfit || 0) >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                  {formatPercent(fundSummary?.totalMonthProfit || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Fund List */}
          <div className="ios-card overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">基金明细</h3>
            </div>
            {funds.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400">暂无基金数据</p>
                <p className="text-xs text-gray-400 mt-1">在飞书基金录入表中添加数据</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {funds.map((fund, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{fund.name}</span>
                      <span className={`text-sm font-semibold tabular-nums ${fund.yearProfit >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                        {formatCurrency(fund.currentValue)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">持有金额：</span>
                        <span className="text-gray-900 tabular-nums">{formatCurrency(fund.buyAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">年初市值：</span>
                        <span className="text-gray-900 tabular-nums">{formatCurrency(fund.yearStartValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">本周收益：</span>
                        <span className={`tabular-nums ${fund.weekProfit >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                          {formatCurrency(fund.weekProfit)} ({formatPercent(fund.weekReturn)})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">本月收益：</span>
                        <span className={`tabular-nums ${fund.monthProfit >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                          {formatCurrency(fund.monthProfit)} ({formatPercent(fund.monthReturn)})
                        </span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-gray-500">本年收益：</span>
                        <span className={`tabular-nums ${fund.yearProfit >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                          {formatCurrency(fund.yearProfit)} ({formatPercent(fund.yearReturn)})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Renovation Tab */}
      {activeTab === 'renovation' && (
        <>
          {/* Summary Card */}
          {renovation && (
            <div className="ios-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="ios-headline text-gray-900">装修支出</h3>
                <BarChart3 size={20} className="text-ios-blue" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">总花费</p>
                  <p className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(renovation.totalSpent)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">已付款</p>
                  <p className="text-sm font-bold text-ios-green tabular-nums">{formatCurrency(renovation.totalPaid)}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">待付款</p>
                  <p className="text-sm font-bold text-ios-orange tabular-nums">{formatCurrency(renovation.totalUnpaid)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {renovation && renovation.byCategory.length > 0 && (
            <div className="ios-card p-5">
              <h3 className="ios-headline text-gray-900 mb-4">分类汇总</h3>
              <div className="space-y-3">
                {renovation.byCategory.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(cat.spent)}</span>
                      {cat.paid > 0 && (
                        <span className="text-xs text-gray-400 ml-2">（{formatCurrency(cat.paid)} 已付）</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Breakdown */}
          {renovation && renovation.byStatus.length > 0 && (
            <div className="ios-card p-5">
              <h3 className="ios-headline text-gray-900 mb-4">状态分布</h3>
              <div className="space-y-3">
                {renovation.byStatus.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${s.name === '已付款' ? 'bg-ios-green' : s.name === '待付款' ? 'bg-ios-orange' : 'bg-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(s.amount)}</span>
                      <span className="text-xs text-gray-400 ml-2">×{s.count}项</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom safe area */}
      <div className="h-20" />
    </div>
  )
}
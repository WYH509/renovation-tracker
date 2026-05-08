import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function d2n(val: unknown): number {
  if (!val) return 0
  if (typeof val === 'string') return parseFloat(val)
  if (typeof val === 'number') return val
  if (typeof val === 'object' && val !== null && 'toString' in val) {
    return parseFloat(String(val))
  }
  return 0
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)

    const items = await prisma.item.findMany({
      where: { projectId },
      include: { category: true }
    })

    // 按分类汇总
    const categoryMap = new Map<string, { name: string; spent: number; paid: number }>()
    items.forEach(item => {
      const catName = item.category.name
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, { name: catName, spent: 0, paid: 0 })
      }
      const cat = categoryMap.get(catName)!
      cat.spent += d2n(item.totalPrice)
      cat.paid += d2n(item.paidAmount)
    })

    // 按月统计
    const monthlyMap = new Map<string, { month: string; amount: number }>()
    items.forEach(item => {
      if (item.paymentDate) {
        const month = item.paymentDate.toISOString().slice(0, 7)
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, { month, amount: 0 })
        }
        monthlyMap.get(month)!.amount += d2n(item.paidAmount)
      }
    })

    const totalSpent = items.reduce((sum, i) => sum + d2n(i.totalPrice), 0)
    const totalPaid = items.reduce((sum, i) => sum + d2n(i.paidAmount), 0)

    const stats = {
      totalSpent,
      totalPaid,
      totalUnpaid: totalSpent - totalPaid,
      itemsCount: items.length,
      completedItems: items.filter(i => i.isCompleted).length,
      byCategory: Array.from(categoryMap.values()),
      monthlyTrend: Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
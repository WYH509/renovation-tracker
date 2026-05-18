import { NextResponse } from 'next/server'
import { listRecords, createRecord, d2n, feishuDateToDate, RenovationRecord, RenovationStats } from '@/lib/feishu'

// Renovation app tokens from environment
const RENOVATION_APP_TOKEN = process.env.FEISHU_RENOVATION_APP_TOKEN || 'IoG4bZmqraEcKZsHOdVciaA9nyb'
const RENOVATION_TABLE_ID = process.env.FEISHU_RENOVATION_TABLE_ID || 'tblZOMEKoLLIDnHV'

export async function GET() {
  try {
    const rawRecords = await listRecords(RENOVATION_APP_TOKEN, RENOVATION_TABLE_ID)
    
    // Parse records - skip placeholder rows
    const items: RenovationRecord[] = rawRecords
      .filter(r => r.fields['项目名称'] && String(r.fields['项目名称']).trim() && !String(r.fields['项目名称']).includes('统计表'))
      .map(r => {
        const f = r.fields
        const category = Array.isArray(f['分类']) ? f['分类'] as string[] : []
        const status = Array.isArray(f['状态']) ? f['状态'] as string[] : []
        
        return {
          recordId: r.record_id,
          projectName: String(f['项目名称'] || ''),
          category,
          amount: d2n(f['金额']),
          buyDate: feishuDateToDate(f['购买日期']),
          notes: String(f['备注'] || ''),
          status,
        }
      })

    // Calculate stats
    const stats: RenovationStats = {
      totalSpent: items.reduce((sum, i) => sum + i.amount, 0),
      totalPaid: items.reduce((sum, i) => {
        const isPaid = i.status.includes('已付款') || i.status.includes('已收货')
        return sum + (isPaid ? i.amount : 0)
      }, 0),
      totalUnpaid: items.reduce((sum, i) => {
        const isUnpaid = i.status.includes('待付款')
        return sum + (isUnpaid ? i.amount : 0)
      }, 0),
      byCategory: calculateByCategory(items),
      byStatus: calculateByStatus(items),
    }

    return NextResponse.json({ items, stats })
  } catch (error) {
    console.error('Error fetching renovation items:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to fetch renovation items: ${message}` }, { status: 500 })
  }
}

function calculateByCategory(items: RenovationRecord[]): { name: string; spent: number; paid: number }[] {
  const map = new Map<string, { name: string; spent: number; paid: number }>()
  
  items.forEach(item => {
    const cats = item.category.length > 0 ? item.category : ['未分类']
    cats.forEach(cat => {
      if (!map.has(cat)) {
        map.set(cat, { name: cat, spent: 0, paid: 0 })
      }
      const entry = map.get(cat)!
      entry.spent += item.amount
      if (item.status.includes('已付款') || item.status.includes('已收货')) {
        entry.paid += item.amount
      }
    })
  })
  
  return Array.from(map.values())
}

function calculateByStatus(items: RenovationRecord[]): { name: string; count: number; amount: number }[] {
  const map = new Map<string, { name: string; count: number; amount: number }>()
  
  const statusLabels: Record<string, string> = {
    '已付款': '已付款',
    '待付款': '待付款',
    '已收货': '已收货',
  }
  
  items.forEach(item => {
    const statuses = item.status.length > 0 ? item.status : ['未知']
    statuses.forEach(s => {
      const label = statusLabels[s] || s
      if (!map.has(label)) {
        map.set(label, { name: label, count: 0, amount: 0 })
      }
      const entry = map.get(label)!
      entry.count += 1
      entry.amount += item.amount
    })
  })
  
  return Array.from(map.values())
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectName, category, amount, buyDate, notes, status } = body

    const fields: Record<string, unknown> = {
      '项目名称': projectName,
      '金额': Number(amount) || 0,
      '备注': notes || '',
      '分类': category || [],
      '状态': status || [],
    }

    if (buyDate) {
      fields['购买日期'] = new Date(buyDate).getTime()
    }

    const record = await createRecord(RENOVATION_APP_TOKEN, RENOVATION_TABLE_ID, fields)
    return NextResponse.json(record)
  } catch (error) {
    console.error('Error creating renovation item:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to create renovation item: ${message}` }, { status: 500 })
  }
}
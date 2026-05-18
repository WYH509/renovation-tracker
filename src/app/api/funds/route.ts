import { NextResponse } from 'next/server'
import { listRecords, createRecord, deleteRecord, updateRecord, d2n, feishuDateToDate, FundRecord, FundStats } from '@/lib/feishu'

// Fund app tokens from environment
const FUND_APP_TOKEN = process.env.FEISHU_FUND_APP_TOKEN || 'YKR1bf0p0ae3BcsG4cCcFJN9nIg'
const FUND_TABLE_ID = process.env.FEISHU_FUND_TABLE_ID || 'tblU8GoozI25dtPs'

export async function GET() {
  try {
    const rawRecords = await listRecords(FUND_APP_TOKEN, FUND_TABLE_ID)
    
    // Parse records - skip placeholder rows
    const funds: FundRecord[] = rawRecords
      .filter(r => r.fields['基金名称'] && String(r.fields['基金名称']).trim() && !String(r.fields['基金名称']).includes('统计表'))
      .map(r => {
        const f = r.fields
        return {
          recordId: r.record_id,
          name: String(f['基金名称'] || ''),
          buyDate: feishuDateToDate(f['购买日期']),
          buyAmount: d2n(f['购买金额']),
          share: d2n(f['持仓份额']),
          todayNav: d2n(f['今日净值']),
          lastWeekNav: d2n(f['上周净值']),
          lastMonthNav: d2n(f['上月净值']),
          yearStartNav: d2n(f['年初净值']),
          totalDividend: d2n(f['累计分红']),
        }
      })

    // Calculate stats for each fund
    const stats: FundStats[] = funds.map(f => {
      const currentValue = f.share * f.todayNav + f.totalDividend
      const yearStartValue = f.share * f.yearStartNav
      const lastWeekValue = f.share * f.lastWeekNav
      const lastMonthValue = f.share * f.lastMonthNav

      return {
        name: f.name,
        buyAmount: f.buyAmount,
        yearStartValue,
        currentValue,
        weekProfit: currentValue - lastWeekValue,
        weekReturn: lastWeekValue > 0 ? (currentValue - lastWeekValue) / lastWeekValue * 100 : 0,
        monthProfit: currentValue - lastMonthValue,
        monthReturn: lastMonthValue > 0 ? (currentValue - lastMonthValue) / lastMonthValue * 100 : 0,
        yearProfit: currentValue - yearStartValue,
        yearReturn: yearStartValue > 0 ? (currentValue - yearStartValue) / yearStartValue * 100 : 0,
      }
    })

    // Portfolio-level summary
    const summary = {
      totalInvested: funds.reduce((sum, f) => sum + f.buyAmount, 0),
      totalCurrentValue: stats.reduce((sum, s) => sum + s.currentValue, 0),
      totalYearProfit: stats.reduce((sum, s) => sum + s.yearProfit, 0),
      totalWeekProfit: stats.reduce((sum, s) => sum + s.weekProfit, 0),
      totalMonthProfit: stats.reduce((sum, s) => sum + s.monthProfit, 0),
      fundCount: funds.length,
    }

    return NextResponse.json({ funds, stats, summary })
  } catch (error) {
    console.error('Error fetching funds:', error)
    return NextResponse.json({ error: 'Failed to fetch funds' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, buyDate, buyAmount, share, todayNav, lastWeekNav, lastMonthNav, yearStartNav, totalDividend } = body

    const fields: Record<string, unknown> = {
      '基金名称': name,
      '购买金额': Number(buyAmount) || 0,
      '持仓份额': Number(share) || 0,
      '今日净值': Number(todayNav) || 0,
      '上周净值': Number(lastWeekNav) || 0,
      '上月净值': Number(lastMonthNav) || 0,
      '年初净值': Number(yearStartNav) || 0,
      '累计分红': Number(totalDividend) || 0,
    }

    if (buyDate) {
      fields['购买日期'] = new Date(buyDate).getTime()
    }

    const record = await createRecord(FUND_APP_TOKEN, FUND_TABLE_ID, fields)
    return NextResponse.json(record)
  } catch (error) {
    console.error('Error creating fund:', error)
    return NextResponse.json({ error: 'Failed to create fund' }, { status: 500 })
  }
}
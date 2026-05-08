import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Prisma } from '@prisma/client'

// Helper to convert Prisma Decimal to number string
function decimalToString(val: unknown): string {
  if (!val) return '0'
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  // Prisma Decimal object has toString method
  if (typeof val === 'object' && val !== null && 'toString' in val) {
    return String((val as { toString(): string }).toString())
  }
  return '0'
}

function decimalToNumber(val: unknown): number {
  return parseFloat(decimalToString(val))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const format = searchParams.get('format')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const pid = parseInt(projectId)
    const project = await prisma.project.findUnique({
      where: { id: pid },
      include: {
        items: { include: { category: true } },
        categories: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (format === 'excel') {
      // 构建Excel数据
      const items = project.items.map(item => {
        const totalPrice = decimalToNumber(item.totalPrice)
        const paidAmount = decimalToNumber(item.paidAmount)
        return {
          '项目名称': item.name,
          '施工板块': item.category.name,
          '单位': item.unit || '',
          '数量': item.quantity?.toString() || '',
          '单价': item.unitPrice?.toString() || '',
          '总价': totalPrice.toFixed(2),
          '已付款': paidAmount.toFixed(2),
          '待付款': (totalPrice - paidAmount).toFixed(2),
          '付款状态': item.paymentStatus === 'paid' ? '已付清' : item.paymentStatus === 'partial' ? '部分付款' : '未付款',
          '付款日期': item.paymentDate ? item.paymentDate.toISOString().slice(0, 10) : '',
          '预计交货': item.expectedDeliveryDate ? item.expectedDeliveryDate.toISOString().slice(0, 10) : '',
          '是否完工': item.isCompleted ? '是' : '否'
        }
      })

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(items)
      XLSX.utils.book_append_sheet(wb, ws, '采购明细')

      // 汇总
      const totalSpent = project.items.reduce((sum, i) => sum + decimalToNumber(i.totalPrice), 0)
      const totalPaid = project.items.reduce((sum, i) => sum + decimalToNumber(i.paidAmount), 0)
      const summary = [
        { '项目': project.name },
        { '总花费': totalSpent.toFixed(2) },
        { '已付款': totalPaid.toFixed(2) },
        { '待付款': (totalSpent - totalPaid).toFixed(2) }
      ]
      const wsSummary = XLSX.utils.json_to_sheet(summary)
      XLSX.utils.book_append_sheet(wb, wsSummary, '项目汇总')

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${project.name}-装修费用.xlsx"`
        }
      })
    } else if (format === 'pdf') {
      const doc = new jsPDF()

      // 标题
      doc.setFontSize(20)
      doc.text(project.name + ' - 装修费用报表', 14, 22)

      // 项目信息
      doc.setFontSize(12)
      const totalSpent = project.items.reduce((sum, i) => sum + decimalToNumber(i.totalPrice), 0)
      const totalPaid = project.items.reduce((sum, i) => sum + decimalToNumber(i.paidAmount), 0)
      doc.text(`总花费: ¥${totalSpent.toFixed(2)}  已付款: ¥${totalPaid.toFixed(2)}  待付款: ¥${(totalSpent - totalPaid).toFixed(2)}`, 14, 32)

      // 表格数据
      const tableData = project.items.map(item => [
        item.name,
        item.category.name,
        item.unit || '-',
        item.quantity?.toString() || '-',
        item.unitPrice?.toString() || '-',
        decimalToString(item.totalPrice),
        decimalToString(item.paidAmount),
        item.paymentStatus === 'paid' ? '已付清' : item.paymentStatus === 'partial' ? '部分' : '未付'
      ])

      ;(doc as any).autoTable({
        head: [['项目名称', '板块', '单位', '数量', '单价', '总价', '已付', '状态']],
        body: tableData,
        startY: 40
      })

      const buffer = doc.output('arraybuffer')

      return new NextResponse(Buffer.from(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${project.name}-装修费用.pdf"`
        }
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
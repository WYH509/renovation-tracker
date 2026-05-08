import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const items = await prisma.item.findMany({
      where: { 
        projectId,
        ...(categoryId ? { categoryId: parseInt(categoryId) } : {})
      },
      include: { 
        category: true, 
        materialType: true,
        reminders: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)
    const body = await request.json()
    
    const {
      name, categoryId, materialTypeId, unit, quantity, unitPrice,
      totalPrice, paidAmount, paymentDate, expectedDeliveryDate,
      reminderDays, notes
    } = body

    // 计算付款状态
    const total = parseFloat(totalPrice || '0')
    const paid = parseFloat(paidAmount || '0')
    let paymentStatus = 'unpaid'
    if (paid > 0 && paid < total) paymentStatus = 'partial'
    if (paid >= total && total > 0) paymentStatus = 'paid'

    // 计算提醒日期
    let reminderDate = null
    if (expectedDeliveryDate && reminderDays) {
      const deliveryDate = new Date(expectedDeliveryDate)
      deliveryDate.setDate(deliveryDate.getDate() - parseInt(reminderDays))
      reminderDate = deliveryDate
    }

    const item = await prisma.item.create({
      data: {
        projectId,
        categoryId: parseInt(categoryId),
        materialTypeId: materialTypeId ? parseInt(materialTypeId) : null,
        name,
        unit: unit || null,
        quantity: quantity ? parseFloat(quantity) : null,
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        totalPrice: totalPrice ? parseFloat(totalPrice) : null,
        paidAmount: paid ? new Prisma.Decimal(parseFloat(String(paid))) : new Prisma.Decimal(0),
        paymentStatus,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        reminderDays: reminderDays ? parseInt(reminderDays) : null,
        reminderDate,
        notes: notes || null
      }
    })

    // 如果有提醒日期，创建提醒
    if (reminderDate) {
      await prisma.reminder.create({
        data: {
          itemId: item.id,
          reminderDate,
          message: `请跟进「${name}」的施工/交货进度`
        }
      })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
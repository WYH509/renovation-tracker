import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id)
    const body = await request.json()
    
    const {
      name, categoryId, materialTypeId, unit, quantity, unitPrice,
      totalPrice, paidAmount, paymentDate, expectedDeliveryDate,
      isCompleted, reminderDays, notes
    } = body

    // 重新计算付款状态
    const total = parseFloat(totalPrice || '0')
    const paid = parseFloat(paidAmount || '0')
    let paymentStatus = 'unpaid'
    if (paid > 0 && paid < total) paymentStatus = 'partial'
    if (paid >= total && total > 0) paymentStatus = 'paid'

    // 重新计算提醒日期
    let reminderDate = null
    if (expectedDeliveryDate && reminderDays) {
      const deliveryDate = new Date(expectedDeliveryDate)
      deliveryDate.setDate(deliveryDate.getDate() - parseInt(reminderDays))
      reminderDate = deliveryDate

      // 更新关联的提醒
      await prisma.reminder.updateMany({
        where: { itemId },
        data: {
          reminderDate,
          message: `请跟进「${name}」的施工/交货进度`
        }
      })
    }

    const item = await prisma.item.update({
      where: { id: itemId },
      data: {
        name,
        categoryId: parseInt(categoryId),
        materialTypeId: materialTypeId ? parseInt(materialTypeId) : null,
        unit: unit || null,
        quantity: quantity ? parseFloat(quantity) : null,
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        totalPrice: totalPrice ? parseFloat(totalPrice) : null,
        paidAmount: paid ? new Prisma.Decimal(parseFloat(String(paid))) : new Prisma.Decimal(0),
        paymentStatus,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        isCompleted: isCompleted || false,
        reminderDays: reminderDays ? parseInt(reminderDays) : null,
        reminderDate,
        notes: notes || null
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id)
    await prisma.item.delete({ where: { id: itemId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
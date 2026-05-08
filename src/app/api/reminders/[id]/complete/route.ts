import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reminderId = parseInt(params.id)
    const reminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: { isCompleted: true }
    })
    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error completing reminder:', error)
    return NextResponse.json({ error: 'Failed to complete reminder' }, { status: 500 })
  }
}
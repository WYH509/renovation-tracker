import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const pid = parseInt(params.projectId)
    
    // 获取当前项目所有未完成的提醒（且提醒日期在7天内或已逾期）
    const now = new Date()
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const reminders = await prisma.reminder.findMany({
      where: {
        item: { projectId: pid },
        isCompleted: false,
        reminderDate: { lte: weekLater }
      },
      include: { item: true },
      orderBy: { reminderDate: 'asc' }
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}
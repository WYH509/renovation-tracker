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

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: { select: { items: true, categories: true } },
        items: {
          select: { totalPrice: true, paidAmount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const projectsWithStats = projects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      createdAt: p.createdAt.toISOString(),
      _count: p._count,
      totalSpent: p.items.reduce((sum, i) => sum + d2n(i.totalPrice), 0),
      totalPaid: p.items.reduce((sum, i) => sum + d2n(i.paidAmount), 0)
    }))

    const allItems = await prisma.item.findMany()
    const totalSpent = allItems.reduce((sum, i) => sum + d2n(i.totalPrice), 0)
    const totalPaid = allItems.reduce((sum, i) => sum + d2n(i.paidAmount), 0)

    const stats = {
      totalSpent,
      totalPaid,
      totalUnpaid: totalSpent - totalPaid,
      itemsCount: allItems.length,
      completedItems: allItems.filter(i => i.isCompleted).length,
      byCategory: [] as { name: string; spent: number; paid: number }[],
      monthlyTrend: [] as { month: string; amount: number }[]
    }

    return NextResponse.json({ projects: projectsWithStats, stats })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        categories: {
          create: [
            { name: '主料', sortOrder: 0 },
            { name: '水电工程', sortOrder: 1 },
            { name: '泥瓦工程', sortOrder: 2 },
            { name: '木工工程', sortOrder: 3 },
            { name: '油漆工程', sortOrder: 4 },
            { name: '安装工程', sortOrder: 5 },
            { name: '软装采购', sortOrder: 6 }
          ]
        }
      },
      include: { categories: true }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
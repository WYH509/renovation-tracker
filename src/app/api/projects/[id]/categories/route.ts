import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)
    const categories = await prisma.category.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)
    const body = await request.json()
    const { name } = body

    const maxOrder = await prisma.category.findFirst({
      where: { projectId },
      orderBy: { sortOrder: 'desc' }
    })

    const category = await prisma.category.create({
      data: {
        projectId,
        name,
        sortOrder: (maxOrder?.sortOrder || 0) + 1
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
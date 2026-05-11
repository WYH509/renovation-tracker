import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)

    const materialTypes = await prisma.materialType.findMany({
      where: { projectId },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(materialTypes)
  } catch (error) {
    console.error('Error fetching material types:', error)
    return NextResponse.json({ error: 'Failed to fetch material types' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)
    const { name, parentId } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const materialType = await prisma.materialType.create({
      data: {
        projectId,
        name: name.trim(),
        parentId: parentId || null
      }
    })

    return NextResponse.json(materialType)
  } catch (error) {
    console.error('Error creating material type:', error)
    return NextResponse.json({ error: 'Failed to create material type' }, { status: 500 })
  }
}

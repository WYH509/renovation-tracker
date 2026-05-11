import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
    const count = await prisma.project.deleteMany()
    return NextResponse.json({ deleted: count.count })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const count = await prisma.project.count()
    return NextResponse.json({ projectCount: count })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
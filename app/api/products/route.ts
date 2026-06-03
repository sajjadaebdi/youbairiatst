import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return []
}

async function findSeller(sellerId: string) {
  return await prisma.seller.findFirst({
    where: {
      OR: [{ id: sellerId }, { userId: sellerId }],
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const title = String(formData.get('title') ?? '').trim()
      const description = String(formData.get('description') ?? '').trim()
      const category = String(formData.get('category') ?? '').trim()
      const price = Number(formData.get('price')) || 0
      const sellerId = String(formData.get('sellerId') ?? '').trim()
      const thumbnail = formData.get('thumbnail') as File | null
      const files = formData.getAll('files') as File[]

      if (!title || !description || !category || !sellerId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      if (files.length === 0) {
        return NextResponse.json({ error: 'At least one product file is required' }, { status: 400 })
      }

      const seller = await findSeller(sellerId)
      if (!seller) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
      }

      const imageUrl = thumbnail ? '/placeholder.jpg' : '/placeholder.jpg'

      const product = await prisma.product.create({
        data: {
          title,
          description,
          shortDescription: description,
          longDescription: description,
          category,
          price,
          image: imageUrl,
          tags: [],
          sellerId: seller.id,
          status: 'PENDING',
        },
      })

      return NextResponse.json(product)
    }

    const body = await req.json()
    const title = String(body.title ?? '').trim()
    const shortDescription = String(body.shortDescription ?? '').trim()
    const longDescription = String(body.longDescription ?? '').trim()
    const category = String(body.category ?? '').trim()
    const tags = normalizeTags(body.tags)
    const sellerId = String(body.sellerId ?? '').trim()
    const price = Number(body.price) || 0
    const status = String(body.status ?? 'PENDING').trim().toUpperCase()

    if (!title || !shortDescription || !longDescription || !category || !sellerId) {
      return NextResponse.json({ error: 'Missing required product draft fields' }, { status: 400 })
    }

    const seller = await findSeller(sellerId)
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const product = await prisma.product.create({
      data: {
        title,
        description: longDescription,
        shortDescription,
        longDescription,
        category,
        price,
        tags,
        image: '/placeholder.jpg',
        sellerId: seller.id,
        status: status || 'PENDING',
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error creating product',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const sellerId = searchParams.get('sellerId')
    const status = searchParams.get('status')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (sellerId) {
      const seller = await findSeller(sellerId)
      if (seller) {
        where.sellerId = seller.id
      } else {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
      }
    }

    if (status) {
      where.status = status.toUpperCase()
    } else if (!sellerId) {
      where.status = 'APPROVED'
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            shopName: true,
            shopUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    )
  }
}
 
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const price = parseFloat(formData.get('price') as string)
    const sellerId = formData.get('sellerId') as string
    const thumbnail = formData.get('thumbnail') as File | null
    const files = formData.getAll('files') as File[]

    // Validate required fields
    if (!title || !description || !category || !price || !sellerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'At least one product file is required' },
        { status: 400 }
      )
    }

    // Validate seller exists
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId }
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    // TODO: Handle file upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll store placeholder values
    const imageUrl = thumbnail ? '/placeholder.jpg' : '/placeholder.jpg'
    const fileUrls = files.map(() => '/placeholder-file.zip')

    // Create product
    const product = await prisma.product.create({
      data: {
        title,
        description,
        category,
        price,
        image: imageUrl,
        sellerId,
        status: 'PENDING', // Products need admin approval
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error creating product' },
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
      where.sellerId = sellerId
    }

    if (status) {
      where.status = status
    } else {
      // Default to only approved products for public access
      where.status = 'APPROVED'
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            shopName: true,
            shopUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
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
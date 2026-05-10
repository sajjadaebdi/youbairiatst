import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/rewards - List all active reward tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const status = searchParams.get('status') || 'ACTIVE';

    const where: any = {
      status: status,
    };

    if (contentType) {
      where.contentType = contentType;
    }

    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) where.budget.gte = parseFloat(minBudget);
      if (maxBudget) where.budget.lte = parseFloat(maxBudget);
    }

    const tasks = await prisma.rewardTask.findMany({
      where,
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        contentSubmissions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching reward tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reward tasks' },
      { status: 500 }
    );
  }
}

// POST /api/rewards - Create a new reward task (Sellers only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true },
    });

    if (!user?.seller) {
      return NextResponse.json(
        { error: 'Only sellers can create reward tasks' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      productDetails,
      contentType,
      requirements,
      budget,
      deadline,
      maxSubmissions = 10,
    } = body;

    // Validate required fields
    if (!title || !description || !productDetails || !contentType || !requirements || !budget || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const task = await prisma.rewardTask.create({
      data: {
        sellerId: user.seller.id,
        title,
        description,
        productDetails,
        contentType,
        requirements,
        budget: parseFloat(budget),
        deadline: new Date(deadline),
        maxSubmissions: parseInt(maxSubmissions),
      },
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating reward task:', error);
    return NextResponse.json(
      { error: 'Failed to create reward task' },
      { status: 500 }
    );
  }
}

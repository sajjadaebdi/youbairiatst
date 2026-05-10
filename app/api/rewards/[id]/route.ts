import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/rewards/[id] - Get a specific reward task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.rewardTask.findUnique({
      where: { id: params.id },
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
          include: {
            marketer: {
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
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Reward task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching reward task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reward task' },
      { status: 500 }
    );
  }
}

// PUT /api/rewards/[id] - Update a reward task (Seller only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Only sellers can update reward tasks' },
        { status: 403 }
      );
    }

    const task = await prisma.rewardTask.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Reward task not found' },
        { status: 404 }
      );
    }

    if (task.sellerId !== user.seller.id) {
      return NextResponse.json(
        { error: 'You can only update your own reward tasks' },
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
      maxSubmissions,
      status,
    } = body;

    const updatedTask = await prisma.rewardTask.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(productDetails && { productDetails }),
        ...(contentType && { contentType }),
        ...(requirements && { requirements }),
        ...(budget && { budget: parseFloat(budget) }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(maxSubmissions && { maxSubmissions: parseInt(maxSubmissions) }),
        ...(status && { status }),
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

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Error updating reward task:', error);
    return NextResponse.json(
      { error: 'Failed to update reward task' },
      { status: 500 }
    );
  }
}

// DELETE /api/rewards/[id] - Delete a reward task (Seller only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Only sellers can delete reward tasks' },
        { status: 403 }
      );
    }

    const task = await prisma.rewardTask.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Reward task not found' },
        { status: 404 }
      );
    }

    if (task.sellerId !== user.seller.id) {
      return NextResponse.json(
        { error: 'You can only delete your own reward tasks' },
        { status: 403 }
      );
    }

    await prisma.rewardTask.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Reward task deleted successfully' });
  } catch (error) {
    console.error('Error deleting reward task:', error);
    return NextResponse.json(
      { error: 'Failed to delete reward task' },
      { status: 500 }
    );
  }
}

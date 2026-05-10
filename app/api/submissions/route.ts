import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/submissions - Get submissions (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const taskId = searchParams.get('taskId');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true, marketer: true },
    });

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (taskId) {
      where.taskId = taskId;
    }

    // Filter based on user role
    if (user?.seller) {
      // Sellers can see submissions for their tasks
      const sellerTasks = await prisma.rewardTask.findMany({
        where: { sellerId: user.seller.id },
        select: { id: true },
      });
      where.taskId = { in: sellerTasks.map(task => task.id) };
    } else if (user?.marketer) {
      // Marketers can see their own submissions
      where.marketerId = user.marketer.id;
    } else if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const submissions = await prisma.contentSubmission.findMany({
      where,
      include: {
        task: {
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
        },
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
        payout: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/submissions - Submit content (Marketers only)
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
      include: { marketer: true },
    });

    if (!user?.marketer) {
      return NextResponse.json(
        { error: 'Only marketers can submit content' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { taskId, content, mediaUrls, notes } = body;

    // Validate required fields
    if (!taskId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if task exists and is active
    const task = await prisma.rewardTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Reward task not found' },
        { status: 404 }
      );
    }

    if (task.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This reward task is not accepting submissions' },
        { status: 400 }
      );
    }

    if (new Date() > task.deadline) {
      return NextResponse.json(
        { error: 'Submission deadline has passed' },
        { status: 400 }
      );
    }

    // Check if marketer has already submitted for this task
    const existingSubmission = await prisma.contentSubmission.findFirst({
      where: {
        taskId,
        marketerId: user.marketer.id,
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted content for this task' },
        { status: 400 }
      );
    }

    // Check if task has reached max submissions
    const submissionCount = await prisma.contentSubmission.count({
      where: { taskId },
    });

    if (submissionCount >= task.maxSubmissions) {
      return NextResponse.json(
        { error: 'This task has reached maximum submissions' },
        { status: 400 }
      );
    }

    const submission = await prisma.contentSubmission.create({
      data: {
        taskId,
        marketerId: user.marketer.id,
        content,
        mediaUrls: mediaUrls || [],
        notes,
      },
      include: {
        task: {
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
        },
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
    });

    // Update task submission count
    await prisma.rewardTask.update({
      where: { id: taskId },
      data: {
        totalSubmissions: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

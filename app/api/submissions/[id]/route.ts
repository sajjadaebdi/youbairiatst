import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/submissions/[id] - Get a specific submission
export async function GET(
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

    const submission = await prisma.contentSubmission.findUnique({
      where: { id: params.id },
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
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true, marketer: true },
    });

    const canAccess = 
      user?.role === 'ADMIN' ||
      (user?.seller && submission.task.sellerId === user.seller.id) ||
      (user?.marketer && submission.marketerId === user.marketer.id);

    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

// PUT /api/submissions/[id] - Review submission (Seller only)
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
        { error: 'Only sellers can review submissions' },
        { status: 403 }
      );
    }

    const submission = await prisma.contentSubmission.findUnique({
      where: { id: params.id },
      include: {
        task: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.task.sellerId !== user.seller.id) {
      return NextResponse.json(
        { error: 'You can only review submissions for your own tasks' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, feedback } = body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    const updatedSubmission = await prisma.contentSubmission.update({
      where: { id: params.id },
      data: {
        status,
        feedback,
        reviewedAt: new Date(),
        reviewedBy: user.id,
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

    // Update task approved submissions count if approved
    if (status === 'APPROVED') {
      await prisma.rewardTask.update({
        where: { id: submission.taskId },
        data: {
          approvedSubmissions: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({ submission: updatedSubmission });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

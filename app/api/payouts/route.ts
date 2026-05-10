import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { getPaytmUpiId, PAYMENT_CONFIG } from '@/lib/payment-config';


const prisma = new PrismaClient();

// GET /api/payouts - Get payouts (Admin only)
export async function GET(request: NextRequest) {
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
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const payouts = await prisma.payout.findMany({
      where,
      include: {
        submission: {
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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ payouts });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

// POST /api/payouts - Process payout (Admin only)
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
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { submissionId } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Get submission with approval status
    const submission = await prisma.contentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: true,
        marketer: true,
        payout: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved submissions can be paid out' },
        { status: 400 }
      );
    }

    if (submission.payout) {
      return NextResponse.json(
        { error: 'Payout already exists for this submission' },
        { status: 400 }
      );
    }

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        submissionId,
        marketerId: submission.marketer.id,
        userId: user.id,
        amount: submission.task.budget,
        paymentMethod: PAYMENT_CONFIG.DEFAULT_PAYMENT_METHOD,
        status: 'PROCESSING',
      },
      include: {
        submission: {
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

    try {
      // Process Paytm UPI payout
      const paytmPayoutId = `PAYTM_${Date.now()}_${submissionId}`;
      const upiId = getPaytmUpiId();
      
      // Simulate Paytm UPI payment processing
      // In a real implementation, you would integrate with Paytm API
      const paytmPayout = {
        id: paytmPayoutId,
        status: 'success',
        upiId: upiId,
        amount: submission.task.budget,
        currency: PAYMENT_CONFIG.PAYTM_UPI.CURRENCY,
        description: `Payout for task: ${submission.task.title}`,
        timestamp: new Date().toISOString(),
      };

      // Update payout with Paytm ID
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          stripePayoutId: paytmPayoutId, // Reusing this field for Paytm ID
          upiId: upiId,
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      // Update marketer stats
      await prisma.marketer.update({
        where: { id: submission.marketer.id },
        data: {
          totalEarnings: {
            increment: submission.task.budget,
          },
          completedTasks: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ 
        payout: {
          ...payout,
          paytmPayoutId: paytmPayoutId,
          status: 'COMPLETED',
          processedAt: new Date(),
          upiId: upiId,
        },
        paytmDetails: paytmPayout
      }, { status: 201 });
    } catch (paytmError) {
      // Update payout status to failed
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: 'FAILED',
        },
      });

      console.error('Paytm UPI payout error:', paytmError);
      return NextResponse.json(
        { error: 'Failed to process Paytm UPI payout' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing payout:', error);
    return NextResponse.json(
      { error: 'Failed to process payout' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateAIResponse, determineStage, type ConversationMessage } from "@/lib/ai-orchestrator"
import { getServerSession } from "next-auth/next"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, draftId, conversationHistory } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get or create seller
    let seller = await prisma.seller.findUnique({
      where: { userId: user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
    }

    // Get or create draft and conversation thread
    let draft = draftId
      ? await prisma.productDraft.findUnique({
          where: { id: draftId },
          include: { conversationThread: true },
        })
      : null

    if (draftId && (!draft || draft.sellerId !== seller.id)) {
      return NextResponse.json({ error: "Draft not found or unauthorized" }, { status: 404 })
    }

    // Create new draft if needed
    if (!draft) {
      draft = await prisma.productDraft.create({
        data: {
          sellerId: seller.id,
          title: "",
          status: "DRAFT",
        },
        include: { conversationThread: true },
      })
    }

    // Get or create conversation thread
    let conversation = draft.conversationThread

    if (!conversation) {
      conversation = await prisma.conversationThread.create({
        data: {
          sellerId: seller.id,
          productDraftId: draft.id,
          messages: [],
          stage: "intent_gathering",
        },
      })

      // Update draft with conversation thread ID
      draft = await prisma.productDraft.update({
        where: { id: draft.id },
        data: { conversationThreadId: conversation.id },
        include: { conversationThread: true },
      })
    }

    // Parse existing messages
    const messages: ConversationMessage[] = Array.isArray(conversation.messages)
      ? conversation.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }))
      : []

    // Add user message
    messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    })

    // Get AI response
    const aiDraft = await generateAIResponse(message, messages.slice(0, -1))

    // Add assistant response
    messages.push({
      role: "assistant",
      content: aiDraft.nextQuestion
        ? `Got it! ${aiDraft.nextQuestion}`
        : "Perfect! Your product structure is ready. You can edit any field below before publishing.",
      timestamp: new Date(),
    })

    // Determine stage
    const stage = determineStage(aiDraft)

    // Update draft and conversation
    const updatedConversation = await prisma.conversationThread.update({
      where: { id: conversation.id },
      data: {
        messages: messages as any,
        stage,
        productType: aiDraft.productType,
        missingFields: aiDraft.missingFields,
      },
    })

    const updatedDraft = await prisma.productDraft.update({
      where: { id: draft.id },
      data: {
        title: aiDraft.title,
        shortDescription: aiDraft.shortDescription,
        longDescription: aiDraft.longDescription,
        category: aiDraft.category,
        productType: aiDraft.productType,
        tags: aiDraft.tags,
        price: aiDraft.price,
        pricingSuggestion: aiDraft.pricingSuggestion,
        deliveryType: aiDraft.deliveryType,
        benefits: aiDraft.benefits,
        features: aiDraft.features as any,
        targetAudience: aiDraft.targetAudience,
        requirements: aiDraft.requirements,
        faqs: aiDraft.faqs,
        status: stage === "ready_to_publish" ? "READY_TO_PUBLISH" : "DRAFT",
        aiContext: {
          ...aiDraft,
          stage,
        },
      },
    })

    return NextResponse.json({
      success: true,
      draft: updatedDraft,
      conversation: updatedConversation,
      aiResponse: aiDraft,
    })
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Chat failed",
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import Notification from '@/models/Notification'
import ClaimRequest from '@/models/ClaimRequest'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// GET /api/messages — Fetch messages for a claim
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const { searchParams } = new URL(request.url)
        const claimId = searchParams.get('claimId')

        if (!claimId) {
            return NextResponse.json({ error: 'claimId is required' }, { status: 400 })
        }

        // Verify user has access to this claim (is claimant or admin)
        const claim = await ClaimRequest.findById(claimId)
        if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

        if (claim.claimantId.toString() !== decoded.id && decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const messages = await Message.find({ claimId })
            .populate('senderId', 'name email')
            .sort({ createdAt: 1 })
            .lean()

        // Mark messages as read for the current user
        await Message.updateMany(
            { claimId, recipientId: decoded.id, read: false },
            { read: true, readAt: new Date() }
        )

        return NextResponse.json({ messages })
    } catch (err) {
        console.error('[Messages GET]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST /api/messages — Send a new message
export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const { claimId, message } = await request.json()

        if (!claimId || !message?.trim()) {
            return NextResponse.json(
                { error: 'claimId and message are required' },
                { status: 400 }
            )
        }

        // Find claim and verify access
        const claim = await ClaimRequest.findById(claimId)
            .populate('claimantId', 'name email')
            .populate('foundItemId', 'submittedBy')

        if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

        // Determine roles and recipients
        const isAdmin = decoded.role === 'admin'
        const isClaimant = claim.claimantId._id.toString() === decoded.id

        if (!isAdmin && !isClaimant) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Sender must be claimant or admin
        const senderRole = isAdmin ? 'admin' : 'user'
        const sender = await User.findById(decoded.id)

        // Determine recipient
        let recipientId
        if (isAdmin) {
            // Admin sending to claimant
            recipientId = claim.claimantId._id
        } else {
            // User sending to admin (send to all admins? or system admin?)
            // For now, we'll send to item submitter if available, otherwise system
            // Actually, let's send to all admins. First, let's just use the first admin
            const admin = await User.findOne({ role: 'admin' })
            if (!admin) {
                return NextResponse.json(
                    { error: 'No admin available' },
                    { status: 400 }
                )
            }
            recipientId = admin._id
        }

        // Create message
        const newMessage = await Message.create({
            claimId,
            senderId: decoded.id,
            senderRole,
            senderName: sender.name || 'Unknown',
            recipientId,
            message: message.trim(),
        })

        // Create notification for recipient
        const notificationTitle = isAdmin
            ? `💬 Message from Admin`
            : `💬 Message from ${sender.name}`

        const notificationMessage = isAdmin
            ? `Admin: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`
            : `"${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`

        await Notification.create({
            userId: recipientId,
            type: 'chat_message',
            title: notificationTitle,
            message: notificationMessage,
            claimId,
            messageId: newMessage._id,
        })

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'name email')

        return NextResponse.json({ message: populatedMessage }, { status: 201 })
    } catch (err) {
        console.error('[Messages POST]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

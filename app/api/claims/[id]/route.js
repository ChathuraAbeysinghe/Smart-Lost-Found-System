export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClaimRequest from '@/models/ClaimRequest'
import Notification from '@/models/Notification'
import { verifyToken } from '@/lib/auth'

export async function GET(request, { params }) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const claim = await ClaimRequest.findById(params.id)
            .populate('lostItemId')
            .populate('foundItemId')
            .populate('claimantId', '-password')
            .lean()
        if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (claim.claimantId._id.toString() !== decoded.id && decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Strip AI-internal fields for non-admin users
        if (decoded.role !== 'admin') {
            delete claim.aiMatchScore
            delete claim.aiRiskScore
            delete claim.aiBreakdown
            delete claim.aiSuggestedDecision
        }

        return NextResponse.json({ claim })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function PATCH(request, { params }) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const claim = await ClaimRequest.findById(params.id)
            .populate('lostItemId')
            .populate('foundItemId')
            .populate('claimantId', '-password')
        if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const body = await request.json()

        // --- Non-admin users ---
        if (decoded.role !== 'admin') {
            if (claim.claimantId._id.toString() !== decoded.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }

            // WITHDRAW action — hard delete from database
            if (body.action === 'withdraw') {
                const editableStatuses = ['under_review', 'ai_matched']
                if (!editableStatuses.includes(claim.status)) {
                    return NextResponse.json({ error: 'Claim cannot be withdrawn at this stage' }, { status: 400 })
                }
                await ClaimRequest.findByIdAndDelete(claim._id)
                return NextResponse.json({ deleted: true, message: 'Claim withdrawn and deleted successfully' })
            }

            // UPDATE (edit) action — only allowed when under_review or ai_matched
            if (body.action === 'update') {
                const editableStatuses = ['under_review', 'ai_matched']
                if (!editableStatuses.includes(claim.status)) {
                    return NextResponse.json({ error: 'Claim cannot be edited at this stage' }, { status: 400 })
                }
                const allowed = ['ownershipExplanation', 'hiddenDetails', 'exactColorBrand', 'dateLost', 'timeLost', 'locationLost', 'proofUrl', 'pickupPreference']
                allowed.forEach(field => {
                    if (body[field] !== undefined) claim[field] = body[field]
                })
                claim.trackingHistory.push({ status: 'Updated', note: 'Claim details updated by claimant', updatedBy: decoded.name })
                await claim.save()
                const updated = await ClaimRequest.findById(claim._id)
                    .populate('lostItemId').populate('foundItemId').populate('claimantId', '-password').lean()
                return NextResponse.json({ claim: updated })
            }

            if (body.action === 'schedule_pickup') {
                if (claim.status !== 'approved') {
                    return NextResponse.json({ error: 'Pickup can only be scheduled after approval' }, { status: 400 })
                }

                const { pickupDate, pickupTimeSlot } = body
                if (!pickupDate || !pickupTimeSlot) {
                    return NextResponse.json({ error: 'Pickup date and time slot are required' }, { status: 400 })
                }

                const scheduledDate = new Date(pickupDate)
                if (Number.isNaN(scheduledDate.getTime())) {
                    return NextResponse.json({ error: 'Invalid pickup date' }, { status: 400 })
                }

                scheduledDate.setHours(0, 0, 0, 0)

                claim.status = 'pickup_scheduled'
                claim.pickupScheduledAt = scheduledDate
                claim.pickupTimeSlot = pickupTimeSlot
                claim.trackingHistory.push({
                    status: 'Pickup Scheduled',
                    note: `Pickup scheduled for ${scheduledDate.toLocaleDateString('en-US')} at ${pickupTimeSlot}`,
                    updatedBy: decoded.name,
                })
                await claim.save()

                await Notification.create({
                    userId: claim.claimantId?._id || claim.claimantId,
                    type: 'claim_update',
                    title: 'Pickup Scheduled',
                    message: `Your pickup for "${claim.foundItemId?.title || 'the claimed item'}" is scheduled for ${scheduledDate.toLocaleDateString('en-US')} at ${pickupTimeSlot}.`,
                    foundItemId: claim.foundItemId?._id || claim.foundItemId,
                    claimId: claim._id,
                })

                const updated = await ClaimRequest.findById(claim._id)
                    .populate('lostItemId').populate('foundItemId').populate('claimantId', '-password').lean()
                return NextResponse.json({ claim: updated })
            }

            if (body.action === 'complete_pickup') {
                if (claim.status !== 'pickup_scheduled') {
                    return NextResponse.json({ error: 'Pickup can only be completed after it is scheduled' }, { status: 400 })
                }

                const completedAt = new Date()
                claim.status = 'completed'
                claim.completedAt = completedAt
                claim.trackingHistory.push({
                    status: 'Completed',
                    note: 'Item pickup confirmed by claimant',
                    updatedBy: decoded.name,
                })
                await claim.save()

                await Notification.create({
                    userId: claim.claimantId?._id || claim.claimantId,
                    type: 'claim_update',
                    title: 'Pickup Confirmed',
                    message: `You confirmed pickup for "${claim.foundItemId?.title || 'the claimed item'}". This claim is now marked as completed.`,
                    foundItemId: claim.foundItemId?._id || claim.foundItemId,
                    claimId: claim._id,
                })

                const updated = await ClaimRequest.findById(claim._id)
                    .populate('lostItemId').populate('foundItemId').populate('claimantId', '-password').lean()
                return NextResponse.json({ claim: updated })
            }

            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        return NextResponse.json({ error: 'Use admin endpoint' }, { status: 400 })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

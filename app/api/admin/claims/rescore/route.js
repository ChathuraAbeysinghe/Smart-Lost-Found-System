export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClaimRequest from '@/models/ClaimRequest'
import FoundItem from '@/models/FoundItem'
import LostItem from '@/models/LostItem'
import { verifyToken } from '@/lib/auth'
import { computeMatchScore, computeClaimMatchScore } from '@/lib/aiEngine'

// POST /api/admin/claims/rescore — Re-run AI scoring on a specific claim or all pending claims
export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await connectDB()
        const body = await request.json()
        const { claimId } = body

        // If claimId provided → score one claim. Otherwise score all pending 0-score claims.
        const filter = claimId
            ? { _id: claimId }
            : { aiMatchScore: { $lte: 0 }, status: { $nin: ['approved', 'rejected', 'completed'] } }

        const claims = await ClaimRequest.find(filter).lean()
        let scored = 0

        for (const claim of claims) {
            try {
                const foundItem = claim.foundItemId
                    ? await FoundItem.findById(claim.foundItemId).lean()
                    : null

                if (!foundItem) continue

                let aiResult

                if (claim.lostItemId) {
                    // Linked claim — use full match score
                    const lostItem = await LostItem.findById(claim.lostItemId).lean()
                    if (!lostItem) continue
                    aiResult = await computeMatchScore(lostItem, foundItem, {
                        ownershipExplanation: claim.ownershipExplanation,
                        hiddenDetails: claim.hiddenDetails,
                        exactColorBrand: claim.exactColorBrand,
                    })
                    const matchScore = aiResult.matchScore
                    await ClaimRequest.findByIdAndUpdate(claim._id, {
                        aiMatchScore: matchScore,
                        aiRiskScore: aiResult.riskScore,
                        aiSuggestedDecision: aiResult.suggestedDecision,
                        aiBreakdown: aiResult.breakdown,
                        aiMatchLevel: matchScore >= 70 ? 'HIGH' : matchScore >= 40 ? 'MEDIUM' : matchScore >= 20 ? 'LOW' : 'UNLIKELY',
                        aiMatchReasons: [
                            ...(aiResult.breakdown.descriptionScore >= 50 ? ['Description aligns with found item'] : []),
                            ...(aiResult.breakdown.categoryScore >= 100 ? ['Category matches exactly'] : []),
                            ...(aiResult.breakdown.locationScore >= 50 ? ['Location is close to where item was found'] : []),
                            ...(aiResult.breakdown.dateScore >= 70 ? ['Date lost aligns with date found'] : []),
                        ],
                        aiRedFlags: [
                            ...((claim.ownershipExplanation || '').trim().length < 50 ? ['Ownership explanation is very brief'] : []),
                            ...(!claim.hiddenDetails?.trim() ? ['No hidden/identifying details provided'] : []),
                        ],
                        claimType: 'matched',
                    })
                } else {
                    // Direct claim — use claim text as proxy
                    aiResult = await computeClaimMatchScore({
                        ownershipExplanation: claim.ownershipExplanation,
                        hiddenDetails: claim.hiddenDetails,
                        exactColorBrand: claim.exactColorBrand,
                        dateLost: claim.dateLost,
                        locationLost: claim.locationLost || '',
                        category: claim.category || '',
                    }, foundItem)

                    await ClaimRequest.findByIdAndUpdate(claim._id, {
                        aiMatchScore: aiResult.matchScore,
                        aiRiskScore: aiResult.riskScore,
                        aiMatchLevel: aiResult.matchLevel,
                        aiSuggestedDecision: aiResult.suggestedDecision,
                        aiMatchReasons: aiResult.matchReasons,
                        aiRedFlags: aiResult.redFlags,
                        aiBreakdown: aiResult.breakdown,
                        claimType: 'direct',
                    })
                }

                scored++
            } catch (err) {
                console.error(`[Rescore] Failed for claim ${claim._id}:`, err.message)
            }
        }

        return NextResponse.json({ success: true, scored, total: claims.length })
    } catch (err) {
        console.error('[Rescore]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

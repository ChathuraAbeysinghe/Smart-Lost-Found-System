export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClaimRequest from '@/models/ClaimRequest'

export async function GET(request, { params }) {
    try {
        await connectDB()
        const { id } = await params
        const pendingClaimCount = await ClaimRequest.countDocuments({
            foundItemId: id,
            status: { $nin: ['rejected', 'withdrawn', 'completed', 'approved'] },
        })
        return NextResponse.json({ pendingClaimCount })
    } catch {
        return NextResponse.json({ pendingClaimCount: 0 })
    }
}

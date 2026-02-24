'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/ui/StatusBadge'
import AIScoreDisplay from '@/components/ui/AIScoreDisplay'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Shield, Check, X, MessageCircle, ChevronDown, ChevronUp, Filter } from 'lucide-react'

export default function AdminClaimsPage() {
    const { user, loading: authLoading, isAdmin } = useAuth()
    const router = useRouter()
    const [claims, setClaims] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [expanded, setExpanded] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [adminNote, setAdminNote] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        if (!user) return
        const qs = filter ? `?status=${filter}` : ''
        fetch(`/api/admin/claims${qs}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setClaims(d.claims || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user, filter])

    const handleAction = async (claimId, action) => {
        setActionLoading(claimId)
        setSuccessMsg('')
        try {
            const res = await fetch('/api/admin/claims', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claimId, action, adminNote }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSuccessMsg(`Claim ${action}${action === 'approve' ? 'd' : action === 'reject' ? 'ed' : ' - info requested'} successfully`)
            setClaims(prev => prev.map(c => c._id === claimId ? { ...c, status: data.claim.status } : c))
            setAdminNote('')
        } catch (err) {
            alert(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    if (authLoading) return <div className="page-bg min-h-screen"><Navbar /></div>
    if (!user || !isAdmin) { router.push('/login'); return null }

    return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Shield size={22} className="text-indigo-400" /> Claims Review</h1>
                        <p className="text-white/50 text-sm mt-1">{claims.length} claim(s) total</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-white/40" />
                        <select className="glass-select text-sm w-44" value={filter} onChange={e => setFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="under_review">Under Review</option>
                            <option value="ai_matched">AI Matched</option>
                            <option value="admin_review">Admin Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {successMsg && (
                    <div className="mb-4 p-3 rounded-xl text-sm text-emerald-400" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        ✅ {successMsg}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="glass-card h-20 animate-pulse" style={{ opacity: 0.4 }} />)}</div>
                ) : claims.length === 0 ? (
                    <div className="glass-card p-16 text-center"><div className="text-5xl mb-4">📋</div><h3 className="text-white font-semibold mb-2">No claims to review</h3></div>
                ) : (
                    <div className="space-y-4">
                        {claims.map(c => (
                            <div key={c._id} className="glass-card overflow-hidden">
                                {/* Row */}
                                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === c._id ? null : c._id)}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-semibold text-sm truncate">{c.lostItemId?.title || 'Unknown'}</span>
                                            <span className="text-white/30">→</span>
                                            <span className="text-white/70 text-sm truncate">{c.foundItemId?.title || 'Unknown'}</span>
                                        </div>
                                        <div className="text-white/40 text-xs">by {c.claimant?.name || 'Unknown'} · {new Date(c.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm" style={{ color: c.aiMatchScore >= 70 ? '#6ee7b7' : c.aiMatchScore >= 40 ? '#fcd34d' : '#fca5a5' }}>
                                            {c.aiMatchScore}% AI
                                        </span>
                                        <StatusBadge status={c.status} />
                                        {expanded === c._id ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                                    </div>
                                </div>

                                {/* Expanded */}
                                {expanded === c._id && (
                                    <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                                        <AIScoreDisplay matchScore={c.aiMatchScore} riskScore={c.aiRiskScore} breakdown={c.aiBreakdown} suggestion={c.aiSuggestedDecision} />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="glass-card p-4 space-y-2">
                                                <span className="text-xs text-white/40 uppercase tracking-wide">Ownership Explanation</span>
                                                <p className="text-white/80 text-sm">{c.ownershipExplanation || 'Not provided'}</p>
                                            </div>
                                            <div className="glass-card p-4 space-y-2">
                                                <span className="text-xs text-white/40 uppercase tracking-wide">Hidden Details</span>
                                                <p className="text-white/80 text-sm">{c.hiddenDetails || 'Not provided'}</p>
                                            </div>
                                        </div>

                                        {c.exactColorBrand && (
                                            <div className="text-sm text-white/60"><strong className="text-white/40">Exact Color/Brand:</strong> {c.exactColorBrand}</div>
                                        )}

                                        {/* Admin actions */}
                                        {!['approved', 'rejected', 'completed'].includes(c.status) && (
                                            <div className="space-y-3 pt-2">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-white/50">Admin Note (optional)</label>
                                                    <textarea className="glass-input min-h-[60px]" placeholder="Add a note..."
                                                        value={adminNote} onChange={e => setAdminNote(e.target.value)} />
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    <button onClick={() => handleAction(c._id, 'approve')} disabled={actionLoading === c._id}
                                                        className="btn-glass-success text-sm"><Check size={14} /> Approve</button>
                                                    <button onClick={() => handleAction(c._id, 'reject')} disabled={actionLoading === c._id}
                                                        className="btn-glass-danger text-sm"><X size={14} /> Reject</button>
                                                    <button onClick={() => handleAction(c._id, 'request_info')} disabled={actionLoading === c._id}
                                                        className="btn-glass text-sm"><MessageCircle size={14} /> Request Info</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

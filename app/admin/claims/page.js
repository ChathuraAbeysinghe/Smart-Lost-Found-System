'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard, FileText, ShieldAlert, Activity,
    Shield, Check, X, MessageCircle, ChevronDown, ChevronUp,
    Filter, LogOut, AlertTriangle, ChevronRight, Sparkles,
    ArrowUpDown, User as UserIcon, History, Trophy, Send,
    Eye, MapPin, Calendar, Tag, Package, Unlock, Clock,
} from 'lucide-react'

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusPill({ status }) {
    const map = {
        under_review: { label: 'Under Review', bg: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: 'rgba(212,175,55,0.3)' },
        ai_matched: { label: 'AI Matched', bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
        admin_review: { label: 'Info Requested', bg: 'rgba(249,115,22,0.12)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' },
        approved: { label: 'Approved', bg: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
        rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.25)' },
        completed: { label: 'Completed', bg: 'rgba(74,222,128,0.1)', color: '#4ade80', border: 'rgba(74,222,128,0.25)' },
    }
    const s = map[status] || { label: status, bg: 'rgba(255,255,255,0.06)', color: 'rgba(245,246,250,0.6)', border: 'rgba(255,255,255,0.1)' }
    return (
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
            style={{ background: s.bg, color: s.color, borderColor: s.border }}>
            {s.label}
        </span>
    )
}

function AiScoreWidget({ score, level, reasons = [], redFlags = [], suggestion }) {
    const levelMap = {
        HIGH: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', label: 'HIGH MATCH' },
        MEDIUM: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'MEDIUM MATCH' },
        LOW: { color: '#D4AF37', bg: 'rgba(212,175,55,0.1)', label: 'LOW MATCH' },
        UNLIKELY: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'UNLIKELY' },
        PENDING: { color: 'rgba(245,246,250,0.4)', bg: 'rgba(255,255,255,0.04)', label: 'PENDING' },
    }
    const suggestMap = {
        approve: { color: '#4ade80', label: '✓ Recommend: APPROVE' },
        review: { color: '#D4AF37', label: '◉ Recommend: REVIEW' },
        reject: { color: '#ef4444', label: '✕ Recommend: REJECT' },
        pending: { color: 'rgba(245,246,250,0.4)', label: '— Pending' },
    }
    const lv = levelMap[level] || levelMap.PENDING
    const sg = suggestMap[suggestion] || suggestMap.pending

    return (
        <div className="rounded-2xl p-5 border" style={{ background: 'rgba(26,26,100,0.12)', borderColor: 'rgba(99,102,241,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} style={{ color: '#D4AF37' }} />
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(245,246,250,0.5)' }}>AI Analysis</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: lv.bg, color: lv.color, border: `1px solid ${lv.color}30` }}>
                    {lv.label}
                </span>
            </div>

            {/* Score bar */}
            <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-black" style={{ color: lv.color }}>{score ?? '—'}%</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${score ?? 0}%`, background: `linear-gradient(90deg, ${lv.color}80, ${lv.color})` }} />
                </div>
                <span className="text-xs font-bold" style={{ color: sg.color }}>{sg.label}</span>
            </div>

            {/* Match reasons */}
            {reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {reasons.map((r, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                            ✓ {r}
                        </span>
                    ))}
                </div>
            )}

            {/* Red flags */}
            {redFlags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {redFlags.map((f, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                            ⚠ {f}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Confirm Action Modal ─────────────────────────────────────────────────────
function ConfirmModal({ action, claimId, foundItemTitle, onConfirm, onCancel, loading }) {
    const [note, setNote] = useState('')
    const [error, setError] = useState('')
    const isReject = action === 'reject'
    const isApprove = action === 'approve'
    const title = isApprove ? '✅ Approve Claim' : '❌ Reject Claim'
    const accentColor = isApprove ? '#4ade80' : '#ef4444'
    const accentBg = isApprove ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.1)'

    const submit = () => {
        if (isReject && !note.trim()) { setError('A rejection reason is required.'); return }
        setError('')
        onConfirm(claimId, action, note)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
            <div className="rounded-3xl border w-full max-w-lg p-7 space-y-5"
                style={{ background: 'rgba(15,15,35,0.97)', borderColor: `${accentColor}30` }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: accentBg, border: `1px solid ${accentColor}30` }}>
                        {isApprove ? <Check size={18} style={{ color: accentColor }} /> : <X size={18} style={{ color: accentColor }} />}
                    </div>
                    <div>
                        <h3 className="text-white font-black text-lg">{title}</h3>
                        <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(245,246,250,0.5)' }}>
                            For: <span className="text-white">{foundItemTitle}</span>
                        </p>
                    </div>
                </div>

                {isApprove && (
                    <div className="p-4 rounded-2xl border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
                        <p className="text-xs font-semibold" style={{ color: '#fca5a5' }}>
                            ⚠️ All other pending claims for this item will be automatically rejected and those users notified.
                        </p>
                    </div>
                )}

                <div>
                    <label className="text-xs font-black uppercase tracking-wider block mb-2" style={{ color: 'rgba(245,246,250,0.5)' }}>
                        {isReject ? 'Rejection Reason *' : 'Admin Note (recommended)'}
                    </label>
                    <textarea
                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none min-h-[90px] transition-colors"
                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)', color: '#F5F6FA' }}
                        placeholder={isReject ? 'Explain why this claim does not meet the criteria...' : 'Add a message for the student (optional)...'}
                        value={note} onChange={e => { setNote(e.target.value); setError('') }}
                        autoFocus
                    />
                    {error && <p className="text-xs font-semibold mt-1.5" style={{ color: '#f87171' }}>{error}</p>}
                </div>

                <div className="flex gap-3">
                    <button onClick={submit} disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: isApprove ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.15)', color: accentColor, border: `1px solid ${accentColor}35` }}>
                        {loading ? <span className="animate-spin">⟳</span> : (isApprove ? <Check size={15} /> : <X size={15} />)}
                        {loading ? 'Processing...' : (isApprove ? 'Confirm Approval' : 'Confirm Rejection')}
                    </button>
                    <button onClick={onCancel} disabled={loading}
                        className="px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                        style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(245,246,250,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Found Item Side Panel ────────────────────────────────────────────────────
function FoundItemPanel({ item, onClose }) {
    if (!item) return null
    return (
        <div className="fixed inset-0 z-40 flex justify-end"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}>
            <div className="h-full w-full max-w-md overflow-y-auto p-6 space-y-5"
                style={{ background: 'rgba(11,15,26,0.98)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-black text-lg">Found Item Details</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                        <X size={16} style={{ color: 'rgba(245,246,250,0.5)' }} />
                    </button>
                </div>

                {/* Image */}
                <div className="rounded-2xl overflow-hidden h-52 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.1) 100%)' }}>
                    {item.photoUrl
                        ? <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
                        : <div className="flex flex-col items-center gap-2">
                            <Package size={40} className="text-white/20" />
                            <span className="text-white/30 text-xs">{item.category}</span>
                        </div>
                    }
                </div>

                {/* Details */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-white font-bold text-lg">{item.title}</h4>
                        {item.description && <p className="text-sm mt-1 leading-relaxed" style={{ color: 'rgba(245,246,250,0.6)' }}>{item.description}</p>}
                    </div>
                    <div className="space-y-2.5">
                        {item.category && (
                            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(245,246,250,0.6)' }}>
                                <Tag size={13} style={{ color: '#D4AF37' }} /> {item.category}
                            </div>
                        )}
                        {item.locationFound && (
                            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(245,246,250,0.6)' }}>
                                <MapPin size={13} style={{ color: '#60a5fa' }} /> {item.locationFound}
                            </div>
                        )}
                        {item.dateFound && (
                            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(245,246,250,0.6)' }}>
                                <Calendar size={13} style={{ color: '#4ade80' }} />
                                {new Date(item.dateFound).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        )}
                        {item.color && (
                            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(245,246,250,0.6)' }}>
                                <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: item.color }} />
                                Color: {item.color}
                            </div>
                        )}
                    </div>
                    {/* Keywords */}
                    {item.keywords?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(245,246,250,0.4)' }}>Keywords</p>
                            <div className="flex flex-wrap gap-1.5">
                                {item.keywords.map((k, i) => (
                                    <span key={i} className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                                        style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Link href={`/found-items/${item._id}`} target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}>
                    <Eye size={14} /> View Full Item Page
                </Link>
            </div>
        </div>
    )
}

// ─── Claim Card ───────────────────────────────────────────────────────────────
function ClaimCard({ claim, onAction, actionLoading }) {
    const [expanded, setExpanded] = useState(false)
    const [infoMode, setInfoMode] = useState(false)
    const [infoNote, setInfoNote] = useState('')
    const [infoError, setInfoError] = useState('')
    const [confirmAction, setConfirmAction] = useState(null)
    const isDone = ['approved', 'rejected', 'completed'].includes(claim.status)

    const handleInfoSubmit = () => {
        if (!infoNote.trim()) { setInfoError('Message cannot be empty.'); return }
        setInfoError('')
        onAction(claim._id, 'request_info', infoNote)
        setInfoNote('')
        setInfoMode(false)
    }

    return (
        <>
            {confirmAction && (
                <ConfirmModal
                    action={confirmAction}
                    claimId={claim._id}
                    foundItemTitle={claim.foundItemId?.title || 'item'}
                    onConfirm={(id, act, note) => { onAction(id, act, note); setConfirmAction(null) }}
                    onCancel={() => setConfirmAction(null)}
                    loading={actionLoading === claim._id}
                />
            )}
            <div className="rounded-2xl border overflow-hidden transition-all"
                style={{
                    background: 'rgba(255,255,255,0.015)',
                    borderColor: expanded ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                }}>
                {/* Claim row header */}
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpanded(e => !e)}>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <UserIcon size={13} style={{ color: '#D4AF37' }} />
                            <span className="text-white font-bold text-sm truncate">
                                {claim.claimantId?.name || claim.claimantName || 'Unknown'}
                            </span>
                            <span className="text-xs" style={{ color: 'rgba(245,246,250,0.4)' }}>
                                {claim.claimantId?.campusId && `· ${claim.claimantId.campusId}`}
                            </span>
                        </div>
                        <div className="text-xs" style={{ color: 'rgba(245,246,250,0.4)' }}>
                            {new Date(claim.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            {claim.claimType === 'direct' && <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>Direct</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Compact AI score */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
                            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
                            <Sparkles size={11} style={{ color: aiLevelColor(claim.aiMatchLevel) }} />
                            <span className="text-xs font-black" style={{ color: aiLevelColor(claim.aiMatchLevel) }}>
                                {claim.aiMatchScore ?? '—'}%
                            </span>
                        </div>
                        <StatusPill status={claim.status} />
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center border"
                            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                            {expanded ? <ChevronUp size={12} style={{ color: 'rgba(245,246,250,0.5)' }} /> : <ChevronDown size={12} style={{ color: 'rgba(245,246,250,0.5)' }} />}
                        </div>
                    </div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                    <div className="border-t px-5 pb-6 pt-5 space-y-5" style={{ borderTopColor: 'rgba(255,255,255,0.05)' }}>

                        {/* AI Score Widget */}
                        <AiScoreWidget
                            score={claim.aiMatchScore}
                            level={claim.aiMatchLevel || 'PENDING'}
                            reasons={claim.aiMatchReasons || []}
                            redFlags={claim.aiRedFlags || []}
                            suggestion={claim.aiSuggestedDecision}
                        />

                        {/* Claimant history */}
                        {claim.claimantHistory && (
                            <div className="rounded-xl p-4 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <History size={12} style={{ color: '#D4AF37' }} />
                                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'rgba(245,246,250,0.5)' }}>Claimant History</span>
                                    {claim.claimantHistory.trustedFinder && (
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border" style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.3)' }}>
                                            <Trophy size={8} className="inline mr-1" />TRUSTED FINDER
                                        </span>
                                    )}
                                    {claim.claimantHistory.accountStatus === 'restricted' && (
                                        <span className="text-[9px] font-bold text-red-400 uppercase">⛔ RESTRICTED</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    {[
                                        { v: claim.claimantHistory.totalClaims, l: 'Total', c: 'white' },
                                        { v: claim.claimantHistory.approvedClaims, l: 'Approved', c: '#4ade80' },
                                        { v: claim.claimantHistory.rejectedClaims, l: 'Rejected', c: '#f87171' },
                                        { v: `${claim.claimantHistory.warningCount}/3`, l: 'Warnings', c: claim.claimantHistory.warningCount > 0 ? '#fb923c' : 'white' },
                                    ].map((s, i) => (
                                        <div key={i} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                            <p className="text-sm font-black" style={{ color: s.c }}>{s.v}</p>
                                            <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'rgba(245,246,250,0.4)' }}>{s.l}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Claim details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl p-4 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                <span className="text-[10px] uppercase font-black tracking-wider block mb-2" style={{ color: 'rgba(245,246,250,0.4)' }}>Ownership Explanation</span>
                                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,246,250,0.8)' }}>{claim.ownershipExplanation || 'Not provided'}</p>
                            </div>
                            <div className="rounded-xl p-4 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                <span className="text-[10px] uppercase font-black tracking-wider block mb-2" style={{ color: 'rgba(245,246,250,0.4)' }}>Identifying Details</span>
                                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,246,250,0.8)' }}>{claim.hiddenDetails || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'rgba(245,246,250,0.5)' }}>
                            {claim.exactColorBrand && <span><strong className="text-white/60">Color/Brand:</strong> {claim.exactColorBrand}</span>}
                            {claim.dateLost && <span><strong className="text-white/60">Date Lost:</strong> {new Date(claim.dateLost).toLocaleDateString('en-GB')}</span>}
                            {claim.claimantId?.email && <span><strong className="text-white/60">Email:</strong> {claim.claimantId.email}</span>}
                        </div>

                        {/* Admin note if already acted on */}
                        {claim.adminNote && isDone && (
                            <div className="p-3 rounded-xl border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
                                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'rgba(245,246,250,0.4)' }}>Admin Note</p>
                                <p className="text-sm" style={{ color: 'rgba(245,246,250,0.7)' }}>{claim.adminNote}</p>
                            </div>
                        )}

                        {/* Action buttons */}
                        {!isDone && (
                            <div className="space-y-3 pt-2 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setConfirmAction('approve')} disabled={actionLoading === claim._id}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                                        <Check size={14} /> Approve
                                    </button>
                                    <button onClick={() => setConfirmAction('reject')} disabled={actionLoading === claim._id}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                                        <X size={14} /> Reject
                                    </button>
                                    <button onClick={() => setInfoMode(m => !m)} disabled={actionLoading === claim._id}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(245,246,250,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <MessageCircle size={14} /> Request Info
                                    </button>
                                </div>

                                {/* Inline request info form */}
                                {infoMode && (
                                    <div className="space-y-2">
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none min-h-[72px] transition-colors"
                                            style={{ background: 'rgba(255,255,255,0.04)', borderColor: infoError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)', color: '#F5F6FA' }}
                                            placeholder="Type your message to the student..."
                                            value={infoNote}
                                            onChange={e => { setInfoNote(e.target.value); setInfoError('') }}
                                            autoFocus
                                        />
                                        {infoError && <p className="text-xs font-semibold" style={{ color: '#f87171' }}>{infoError}</p>}
                                        <div className="flex gap-2">
                                            <button onClick={handleInfoSubmit} disabled={actionLoading === claim._id}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                                                style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                                                <Send size={12} /> Send Message
                                            </button>
                                            <button onClick={() => { setInfoMode(false); setInfoNote(''); setInfoError('') }}
                                                className="px-4 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white/70 transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

function aiLevelColor(level) {
    if (level === 'HIGH') return '#4ade80'
    if (level === 'MEDIUM') return '#60a5fa'
    if (level === 'LOW') return '#D4AF37'
    if (level === 'UNLIKELY') return '#ef4444'
    return 'rgba(245,246,250,0.4)'
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminClaimsPage() {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const router = useRouter()
    const [grouped, setGrouped] = useState([])
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [sortBy, setSortBy] = useState('score')
    const [actionLoading, setActionLoading] = useState(null)
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [filterOpen, setFilterOpen] = useState(false)
    const [sidePanelItem, setSidePanelItem] = useState(null)
    const [rescoring, setRescoring] = useState(false)
    const filterRef = useRef(null)

    // Close filter dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const fetchClaims = useCallback(() => {
        if (!user) return
        setLoading(true)
        const qs = new URLSearchParams()
        if (filter) qs.set('status', filter)
        qs.set('sort', sortBy)
        fetch(`/api/admin/claims?${qs}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                setGrouped(d.grouped || [])
                setStats(d.stats || { total: 0, pending: 0, approved: 0, rejected: 0 })
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user, filter, sortBy])

    useEffect(() => { fetchClaims() }, [fetchClaims])

    const handleAction = async (claimId, action, adminNote) => {
        setActionLoading(claimId)
        setSuccessMsg('')
        setErrorMsg('')
        try {
            const res = await fetch('/api/admin/claims', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claimId, action, adminNote }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            const labels = { approve: 'approved ✅', reject: 'rejected', request_info: 'sent for review' }
            setSuccessMsg(`Claim ${labels[action] || action} successfully!`)
            setTimeout(() => setSuccessMsg(''), 4000)
            fetchClaims()
        } catch (err) {
            setErrorMsg(err.message)
            setTimeout(() => setErrorMsg(''), 5000)
        } finally {
            setActionLoading(null)
        }
    }

    const handleRescore = async () => {
        setRescoring(true)
        setSuccessMsg('')
        setErrorMsg('')
        try {
            const res = await fetch('/api/admin/claims/rescore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSuccessMsg(`AI re-scored ${data.scored} claim${data.scored !== 1 ? 's' : ''} successfully!`)
            setTimeout(() => setSuccessMsg(''), 5000)
            fetchClaims()
        } catch (err) {
            setErrorMsg(err.message)
            setTimeout(() => setErrorMsg(''), 5000)
        } finally {
            setRescoring(false)
        }
    }

    if (authLoading) return <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }} />
    if (!user || !isAdmin) { router.push('/login'); return null }

    const STATUS_FILTERS = [
        { value: '', label: 'All Statuses' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'ai_matched', label: 'AI Matched' },
        { value: 'admin_review', label: 'Info Requested' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
    ]
    const currentFilter = STATUS_FILTERS.find(f => f.value === filter) || STATUS_FILTERS[0]

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/admin/dashboard' },
        { icon: FileText, label: 'Claim Management', href: '/admin/claims', active: true },
        { icon: ShieldAlert, label: 'User Moderation', href: '/admin/dashboard?tab=moderation' },
        { icon: Activity, label: 'Analytics Data', href: '/admin/dashboard?tab=analytics' },
    ]

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#0B0F19', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
            {/* Side Panel */}
            {sidePanelItem && <FoundItemPanel item={sidePanelItem} onClose={() => setSidePanelItem(null)} />}

            {/* Sidebar */}
            <aside className="w-56 shrink-0 flex flex-col border-r hidden md:flex"
                style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="p-5 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                            style={{ background: 'linear-gradient(135deg, #D4AF37, #b8941e)', color: '#0a0a1a' }}>SC</div>
                        <div><p className="text-white font-black text-sm">Admin</p><p className="text-[10px] font-bold" style={{ color: 'rgba(245,246,250,0.4)' }}>Command Center</p></div>
                    </div>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map(({ icon: Icon, label, href, active }) => (
                        <Link key={label} href={href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                            style={active
                                ? { background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }
                                : { color: 'rgba(245,246,250,0.5)', border: '1px solid transparent' }}>
                            <Icon size={15} /> {label}
                        </Link>
                    ))}
                </nav>
                <div className="p-3 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.06)' }}>
                    <button onClick={logout}
                        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5"
                        style={{ color: 'rgba(245,246,250,0.4)' }}>
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 min-h-screen relative z-10 p-6 md:p-8 overflow-y-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(245,246,250,0.4)' }}>
                            <Link href="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                            <ChevronRight size={12} />
                            <span style={{ color: '#D4AF37' }}>Claim Management</span>
                        </div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-wide">
                            <FileText size={24} style={{ color: '#D4AF37' }} /> Claim Management
                        </h2>
                        <p className="text-sm mt-1 font-medium" style={{ color: 'rgba(245,246,250,0.5)' }}>
                            Review, approve, or reject student item claims — grouped by found item
                        </p>
                    </div>

                    {/* Sort + Filter + Rescore */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={handleRescore} disabled={rescoring}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                            {rescoring ? <span className="animate-spin inline-block">⟳</span> : <Sparkles size={12} />}
                            {rescoring ? 'Scoring...' : 'Re-score with AI'}
                        </button>
                        <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
                            <ArrowUpDown size={13} className="ml-2" style={{ color: 'rgba(245,246,250,0.4)' }} />
                            {[{ v: 'score', l: 'AI Score' }, { v: 'date', l: 'Date' }].map(({ v, l }) => (
                                <button key={v} onClick={() => setSortBy(v)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                    style={sortBy === v
                                        ? { background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }
                                        : { color: 'rgba(245,246,250,0.4)', border: '1px solid transparent' }}>
                                    {l}
                                </button>
                            ))}
                        </div>

                        {/* Custom filter dropdown */}
                        <div ref={filterRef} className="relative">
                            <button onClick={() => setFilterOpen(o => !o)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border"
                                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#F5F6FA', minWidth: '150px' }}>
                                <Filter size={13} style={{ color: 'rgba(245,246,250,0.4)' }} />
                                {currentFilter.label}
                                <ChevronDown size={13} className={`ml-auto transition-transform ${filterOpen ? 'rotate-180' : ''}`} style={{ color: 'rgba(245,246,250,0.4)' }} />
                            </button>
                            {filterOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border overflow-hidden z-30 shadow-2xl"
                                    style={{ background: 'rgba(15,18,32,0.98)', borderColor: 'rgba(255,255,255,0.1)' }}>
                                    {STATUS_FILTERS.map(f => (
                                        <button key={f.value}
                                            onClick={() => { setFilter(f.value); setFilterOpen(false) }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/5"
                                            style={{ color: filter === f.value ? '#D4AF37' : 'rgba(245,246,250,0.7)' }}>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Toast messages */}
                {successMsg && (
                    <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold"
                        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
                        <Check size={16} /> {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                        <AlertTriangle size={16} /> {errorMsg}
                    </div>
                )}

                {/* Stats */}
                {!loading && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Claims', value: stats.total, color: '#60a5fa' },
                            { label: 'Pending Review', value: stats.pending, color: '#D4AF37' },
                            { label: 'Approved', value: stats.approved, color: '#4ade80' },
                            { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
                        ].map((s, i) => (
                            <div key={i} className="rounded-2xl p-5 border relative overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-20 rounded-full" style={{ background: s.color }} />
                                <p className="text-3xl font-black text-white relative z-10">{s.value}</p>
                                <p className="text-xs font-bold uppercase tracking-wider mt-1 relative z-10" style={{ color: 'rgba(245,246,250,0.5)' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Claims grouped by found item */}
                {loading ? (
                    <div className="space-y-5">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-3xl h-40 animate-pulse border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }} />
                        ))}
                    </div>
                ) : grouped.length === 0 ? (
                    <div className="rounded-3xl border p-16 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-white font-bold text-lg">No claims to review</h3>
                        <p className="text-sm mt-2" style={{ color: 'rgba(245,246,250,0.4)' }}>
                            All claims have been processed or none exist with the selected filter.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {grouped.map((group, gi) => {
                            const fi = group.foundItem
                            const pendingCount = group.claims.filter(c => !['approved', 'rejected', 'completed'].includes(c.status)).length
                            return (
                                <div key={fi?._id?.toString() || gi} className="rounded-3xl border overflow-hidden"
                                    style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.06)' }}>

                                    {/* Found Item Header */}
                                    <div className="p-5 border-b" style={{ background: 'rgba(212,175,55,0.04)', borderColor: 'rgba(212,175,55,0.12)' }}>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            {/* Thumbnail */}
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                                                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))' }}>
                                                {fi?.photoUrl
                                                    ? <img src={fi.photoUrl} alt={fi.title} className="w-full h-full object-cover" />
                                                    : <Package size={24} className="text-white/20" />
                                                }
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="text-white font-black text-base">{fi?.title || 'Unknown Found Item'}</h3>
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                        style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                                                        Found Item
                                                    </span>
                                                    {pendingCount > 0 && (
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                                                            🎯 {pendingCount} Pending
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'rgba(245,246,250,0.5)' }}>
                                                    {fi?.category && <span className="flex items-center gap-1"><Tag size={10} /> {fi.category}</span>}
                                                    {fi?.locationFound && <span className="flex items-center gap-1"><MapPin size={10} /> {fi.locationFound}</span>}
                                                    {fi?.dateFound && <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(fi.dateFound).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                                </div>
                                                {fi?.keywords?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {fi.keywords.slice(0, 5).map((k, i) => (
                                                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                                                                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>{k}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-sm font-black" style={{ color: 'rgba(245,246,250,0.5)' }}>
                                                    {group.claims.length} claim{group.claims.length !== 1 ? 's' : ''}
                                                </span>
                                                <button onClick={() => setSidePanelItem(fi)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                                                    style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}>
                                                    <Eye size={12} /> View Item
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Claims list within group */}
                                    <div className="p-4 space-y-3">
                                        {group.claims.map(claim => (
                                            <ClaimCard
                                                key={claim._id}
                                                claim={claim}
                                                onAction={handleAction}
                                                actionLoading={actionLoading}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}

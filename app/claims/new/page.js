'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { Send, ArrowLeft, Shield, AlertTriangle, Package, MapPin, Tag, Calendar, Loader2, CheckCircle2, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

function ClaimFormContent() {
    const { user, loading: authLoading, isRestricted } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const foundItemId = searchParams.get('foundItemId') || ''

    const [foundItem, setFoundItem] = useState(null)
    const [lostItems, setLostItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [form, setForm] = useState({
        lostItemId: '', foundItemId,
        ownershipExplanation: '', hiddenDetails: '',
        exactColorBrand: '', dateLost: '', locationLost: '', proofUrl: '',
        pickupPreference: 'Campus Lost & Found Office',
    })

    const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    // Fetch the found item details for preview
    useEffect(() => {
        if (!foundItemId) { setFetching(false); return }
        fetch(`/api/found-items/${foundItemId}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setFoundItem(d.item || null))
            .catch(() => { })
            .finally(() => setFetching(false))
    }, [foundItemId])

    // Fetch user's lost items for optional linking
    useEffect(() => {
        if (!user) return
        fetch('/api/lost-items?page=1&limit=50', { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                const myItems = (d.items || []).filter(i => i.postedBy?.toString() === user.id || i.submittedBy?.toString() === user.id)
                setLostItems(myItems)
            }).catch(() => { })
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const payload = { ...form }
            if (!payload.lostItemId) delete payload.lostItemId // Don't send empty string
            const res = await fetch('/api/claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to submit claim')
            setSuccess(true)
            setTimeout(() => router.push('/user-dashboard'), 2500)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || fetching) return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="flex items-center justify-center pt-40">
                <Loader2 className="animate-spin text-white/30" size={36} />
            </div>
        </div>
    )
    if (!user) return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="glass-card p-12"><div className="text-5xl mb-4">🔒</div><h2 className="text-white font-bold mb-2">Login Required</h2>
                    <Link href="/login" className="btn-glass-primary mt-4">Sign In</Link>
                </div>
            </div>
        </div>
    )

    if (isRestricted) return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="glass-card p-12"><div className="text-5xl mb-4">⛔</div>
                    <h2 className="text-red-400 font-bold mb-2">Account Restricted</h2>
                    <p className="text-white/50 text-sm">Your account has been restricted. Contact admin for help.</p>
                </div>
            </div>
        </div>
    )

    if (success) return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-lg mx-auto pt-32 px-4 animate-slide-up">
                <div className="glass-card p-8 text-center space-y-4">
                    <CheckCircle2 size={48} className="mx-auto" style={{ color: '#4ade80' }} />
                    <h2 className="text-white font-bold text-xl">Claim Submitted!</h2>
                    <p className="text-white/50 text-sm">Your claim has been submitted for admin review. You'll be notified of the result.</p>
                    <p className="text-white/40 text-xs">Redirecting to dashboard...</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="orb w-64 h-64 top-0 left-0 opacity-10" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)' }} />

            <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Link href={foundItemId ? `/found-items/${foundItemId}` : '/found-items'} className="btn-glass px-3 py-2"><ArrowLeft size={16} /></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Submit Claim</h1>
                        <p className="text-white/50 text-sm mt-0.5">Prove ownership to reclaim your item</p>
                    </div>
                </div>

                {/* Warning */}
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-yellow-300">⚠️ Fair Warning</p>
                        <p className="text-xs text-white/50 mt-0.5">False claims will increase your warning count. 3 warnings = account restriction.</p>
                    </div>
                </div>

                {/* Found Item Preview Card */}
                {foundItem && (
                    <div className="mb-6 p-4 rounded-xl flex items-center gap-4"
                        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
                            style={{ background: 'rgba(16,185,129,0.1)' }}>
                            {foundItem.photoUrl ? (
                                <img src={foundItem.photoUrl} alt={foundItem.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package size={24} className="text-emerald-400/30" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#6ee7b7' }}>Claiming This Item</p>
                            <h3 className="text-white font-semibold text-sm truncate">{foundItem.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                {foundItem.category && (
                                    <span className="flex items-center gap-1 text-[10px] text-white/40">
                                        <Tag size={9} /> {foundItem.category}
                                    </span>
                                )}
                                {foundItem.dateFound && (
                                    <span className="flex items-center gap-1 text-[10px] text-white/40">
                                        <Calendar size={9} /> Found {new Date(foundItem.dateFound).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Optional: Link a Lost Item */}
                        {lostItems.length > 0 && (
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide flex items-center gap-1.5">
                                    <LinkIcon size={10} /> Link a Lost Report (optional)
                                </label>
                                <select className="glass-select" value={form.lostItemId} onChange={change('lostItemId')}>
                                    <option value="">Skip — I haven't posted a lost report</option>
                                    {lostItems.map(i => <option key={i._id} value={i._id}>{i.title} ({i.category})</option>)}
                                </select>
                                <p className="text-[10px] text-white/30">Linking a lost report helps AI verify your claim faster, but is not required.</p>
                            </div>
                        )}

                        {foundItemId && (
                            <input type="hidden" value={foundItemId} />
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Ownership Explanation *</label>
                            <textarea className="glass-input min-h-[120px] resize-y"
                                placeholder="Explain how you can prove this item is yours. Be as detailed as possible — describe unique marks, contents, purchase details..."
                                value={form.ownershipExplanation} onChange={change('ownershipExplanation')} required />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Hidden Identifying Details</label>
                            <textarea className="glass-input min-h-[80px] resize-y"
                                placeholder="Describe hidden marks, scratches, stickers, or other details not visible in photos..."
                                value={form.hiddenDetails} onChange={change('hiddenDetails')} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Exact Color / Brand</label>
                                <input className="glass-input" placeholder="e.g. Deep Blue, Apple iPhone 14 Pro" value={form.exactColorBrand} onChange={change('exactColorBrand')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Date Lost</label>
                                <input type="date" className="glass-input" style={{ colorScheme: 'dark' }} value={form.dateLost} onChange={change('dateLost')} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide flex items-center gap-1.5">
                                <MapPin size={10} /> Where did you lose it?
                            </label>
                            <input className="glass-input" placeholder="e.g. Library Block C, 2nd floor reading area" value={form.locationLost} onChange={change('locationLost')} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Additional Proof (URL)</label>
                            <input className="glass-input" placeholder="Link to receipt, photo of purchase, etc." value={form.proofUrl} onChange={change('proofUrl')} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Pickup Preference</label>
                            <select className="glass-select" value={form.pickupPreference} onChange={change('pickupPreference')}>
                                <option value="Campus Lost & Found Office">Campus Lost & Found Office</option>
                                <option value="Security Office">Security Office</option>
                                <option value="Department Office">Department Office</option>
                                <option value="Other">Other (mention in explanation)</option>
                            </select>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-glass-primary w-full justify-center py-3 text-sm font-semibold">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                            {loading ? 'Submitting Claim...' : 'Submit Claim for Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

import { Suspense } from 'react'

export default function NewClaimPage() {
    return (
        <Suspense fallback={<div className="min-h-screen page-bg flex items-center justify-center text-white">Loading...</div>}>
            <ClaimFormContent />
        </Suspense>
    )
}

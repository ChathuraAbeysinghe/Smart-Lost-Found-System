'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import {
    Bell, CheckCircle2, Sparkles, AlertCircle, AlertTriangle,
    ShieldAlert, XCircle, Unlock, Clock, Filter, Eye, ChevronRight,
    Target, Package, MapPin, Tag, MailQuestion, Trash2, CheckCheck,
    ArrowLeft, Loader2, Info,
} from 'lucide-react'

// ─── Time Ago ──────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
    if (!dateStr) return ''
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Notification Type Config ──────────────────────────────────────────────
function getNotifConfig(type) {
    const configs = {
        ai_match: { icon: Sparkles, color: '#D4AF37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.25)', label: 'AI Match', emoji: '🤖' },
        claim_update: { icon: CheckCircle2, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', label: 'Claim Update', emoji: '📋' },
        claim_approved: { icon: CheckCircle2, color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', label: 'Approved', emoji: '✅' },
        claim_rejected: { icon: XCircle, color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Rejected', emoji: '❌' },
        claim_info_requested: { icon: MailQuestion, color: '#fb923c', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', label: 'Info Requested', emoji: 'ℹ️' },
        warning: { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'Warning', emoji: '⚠️' },
        restriction: { icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Restricted', emoji: '🔒' },
        unrestricted: { icon: Unlock, color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', label: 'Unrestricted', emoji: '🔓' },
        appeal_approved: { icon: CheckCircle2, color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', label: 'Appeal Approved', emoji: '✅' },
        appeal_rejected: { icon: XCircle, color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Appeal Rejected', emoji: '❌' },
        system: { icon: Info, color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', label: 'System', emoji: '🔔' },
        system_update: { icon: Info, color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', label: 'System', emoji: '🔔' },
    }
    return configs[type] || { icon: AlertCircle, color: '#F06414', bg: 'rgba(240,100,20,0.1)', border: 'rgba(240,100,20,0.3)', label: 'Update', emoji: '🔔' }
}

// ─── Item Preview Card ─────────────────────────────────────────────────────
function ItemPreview({ item, type = 'found' }) {
    if (!item) return null
    const href = type === 'lost' ? `/lost-items/${item._id}` : `/found-items/${item._id}`
    const image = type === 'lost' ? item.imageUrl : item.photoUrl
    return (
        <Link href={href} className="flex items-center gap-3 p-3 rounded-xl mt-3 group transition-all hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                style={{ background: type === 'lost' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }}>
                {image ? (
                    <img src={image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package size={18} className="text-white/20" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: type === 'lost' ? '#fca5a5' : '#6ee7b7' }}>
                    {type === 'lost' ? '🔍 Lost Item' : '📦 Found Item'}
                </p>
                <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    {item.category && <span className="text-[10px] text-white/40 flex items-center gap-1"><Tag size={8} /> {item.category}</span>}
                    {(item.locationFound || item.possibleLocation) && (
                        <span className="text-[10px] text-white/40 flex items-center gap-1"><MapPin size={8} /> {item.locationFound || item.possibleLocation}</span>
                    )}
                </div>
            </div>
            <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
        </Link>
    )
}

// ─── Admin Note Box ──────────────────────────────────────────────────────────
function AdminNote({ message, type }) {
    // Extract admin note from message if it contains one
    const noteMatch = message?.match(/(?:Admin (?:note|message|says)|Reason|Note):\s*(.+)/i)
    if (!noteMatch) return null

    return (
        <div className="mt-3 p-3 rounded-xl" style={{
            background: type === 'claim_rejected' ? 'rgba(239,68,68,0.06)' : type === 'claim_approved' ? 'rgba(74,222,128,0.06)' : 'rgba(249,115,22,0.06)',
            border: `1px solid ${type === 'claim_rejected' ? 'rgba(239,68,68,0.15)' : type === 'claim_approved' ? 'rgba(74,222,128,0.15)' : 'rgba(249,115,22,0.15)'}`,
        }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{
                color: type === 'claim_rejected' ? '#f87171' : type === 'claim_approved' ? '#4ade80' : '#fb923c',
            }}>
                Admin Note
            </p>
            <p className="text-xs text-white/70 leading-relaxed">{noteMatch[1]}</p>
        </div>
    )
}

// ─── Match Score Badge ───────────────────────────────────────────────────────
function MatchScoreBadge({ score }) {
    if (!score || score <= 0) return null
    const color = score >= 70 ? '#4ade80' : score >= 50 ? '#D4AF37' : '#fb923c'
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
            <Target size={11} /> {score}% Match
        </span>
    )
}

// ─── Single Notification Card ────────────────────────────────────────────────
function NotificationCard({ notif, onMarkRead, onDismiss }) {
    const config = getNotifConfig(notif.type)
    const Icon = config.icon

    const foundItem = notif.foundItemId && typeof notif.foundItemId === 'object' ? notif.foundItemId : null
    const lostItem = notif.lostItemId && typeof notif.lostItemId === 'object' ? notif.lostItemId : null

    // Determine action button
    let actionBtn = null
    if (notif.type === 'claim_approved') {
        actionBtn = (
            <Link href={foundItem ? `/found-items/${foundItem._id}` : '/user-dashboard'}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                <Eye size={12} /> View Pickup Details
            </Link>
        )
    } else if (notif.type === 'claim_info_requested') {
        actionBtn = (
            <Link href={foundItem ? `/claims/new?foundItemId=${foundItem._id}` : '/user-dashboard'}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}>
                <MailQuestion size={12} /> Reply to Admin
            </Link>
        )
    } else if (notif.type === 'ai_match' && foundItem) {
        actionBtn = (
            <Link href={`/found-items/${foundItem._id}`}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                <Sparkles size={12} /> Review Match & Claim
            </Link>
        )
    } else if (notif.type === 'warning') {
        actionBtn = (
            <Link href="/user-dashboard"
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                <AlertTriangle size={12} /> View Details
            </Link>
        )
    }

    return (
        <div className={`group rounded-2xl p-5 border transition-all duration-300 hover:bg-white/[0.02] ${!notif.read ? 'ring-1 ring-white/5' : ''}`}
            style={{
                background: !notif.read ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.01)',
                borderColor: !notif.read ? config.border : 'rgba(255,255,255,0.04)',
            }}>
            <div className="flex gap-4">
                {/* Icon */}
                <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105"
                    style={{ background: config.bg, borderColor: config.border, color: config.color, boxShadow: `0 0 20px ${config.bg}` }}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-bold text-sm ${!notif.read ? 'text-white' : 'text-white/70'}`}>
                                {config.emoji} {notif.title}
                            </h3>
                            {notif.matchScore > 0 && <MatchScoreBadge score={notif.matchScore} />}
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
                                {config.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'rgba(245,246,250,0.35)' }}>
                                {timeAgo(notif.createdAt)}
                            </span>
                            {!notif.read && (
                                <div className="w-2.5 h-2.5 rounded-full"
                                    style={{ background: '#F06414', boxShadow: '0 0 10px rgba(240,100,20,0.6)' }} />
                            )}
                        </div>
                    </div>

                    {/* Full message – no truncation */}
                    <p className="text-sm leading-relaxed font-medium" style={{ color: 'rgba(245,246,250,0.65)' }}>
                        {notif.message}
                    </p>

                    {/* Admin note extraction */}
                    <AdminNote message={notif.message} type={notif.type} />

                    {/* Item previews */}
                    {foundItem && <ItemPreview item={foundItem} type="found" />}
                    {lostItem && <ItemPreview item={lostItem} type="lost" />}

                    {/* Actions row */}
                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                        {actionBtn}
                        {!notif.read && (
                            <button onClick={() => onMarkRead(notif._id)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
                                style={{ color: 'rgba(245,246,250,0.4)' }}>
                                <CheckCircle2 size={10} /> Mark Read
                            </button>
                        )}
                        <button onClick={() => onDismiss(notif._id)}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
                            style={{ color: 'rgba(245,246,250,0.3)' }}>
                            <Trash2 size={10} /> Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('')
    const [counts, setCounts] = useState({ all: 0, claims: 0, ai_matches: 0, warnings: 0, system: 0 })
    const [unreadCount, setUnreadCount] = useState(0)
    const [markingAll, setMarkingAll] = useState(false)

    const TABS = [
        { key: '', label: 'All', icon: Bell },
        { key: 'claims', label: 'Claims', icon: Target },
        { key: 'ai_matches', label: 'AI Matches', icon: Sparkles },
        { key: 'warnings', label: 'Warnings', icon: AlertTriangle },
        { key: 'system', label: 'System', icon: Info },
    ]

    const fetchNotifications = useCallback(() => {
        if (!user) return
        setLoading(true)
        const qs = activeTab ? `?type=${activeTab}` : ''
        fetch(`/api/notifications${qs}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                setNotifications(d.notifications || [])
                setCounts(d.counts || { all: 0, claims: 0, ai_matches: 0, warnings: 0, system: 0 })
                setUnreadCount(d.unreadCount || 0)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user, activeTab])

    useEffect(() => { fetchNotifications() }, [fetchNotifications])

    const handleMarkRead = async (id) => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_read', notificationId: id }),
            credentials: 'include',
        })
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
        setUnreadCount(c => Math.max(0, c - 1))
    }

    const handleDismiss = async (id) => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'dismiss', notificationId: id }),
            credentials: 'include',
        })
        setNotifications(prev => prev.filter(n => n._id !== id))
    }

    const handleMarkAllRead = async () => {
        setMarkingAll(true)
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_all_read' }),
            credentials: 'include',
        })
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
        setMarkingAll(false)
    }

    if (authLoading) return <div className="page-bg min-h-screen"><Navbar /><div className="pt-32 text-center"><Loader2 className="animate-spin text-white/30 mx-auto" size={32} /></div></div>
    if (!user) { router.push('/login'); return null }

    return (
        <div className="page-bg min-h-screen">
            <Navbar />
            <div className="orb w-96 h-96 top-0 left-1/4 opacity-5" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)' }} />
            <div className="orb w-72 h-72 bottom-0 right-0 opacity-5" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)' }} />

            <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 relative z-10">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(245,246,250,0.35)' }}>
                    <Link href="/user-dashboard" className="hover:text-white transition-colors flex items-center gap-1">
                        <ArrowLeft size={12} /> Dashboard
                    </Link>
                    <ChevronRight size={12} />
                    <span style={{ color: '#D4AF37' }}>Notifications</span>
                </div>

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-wide">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)' }}>
                                <Bell size={20} style={{ color: '#D4AF37' }} />
                            </div>
                            Notification Center
                        </h1>
                        <p className="text-sm mt-1.5 font-medium" style={{ color: 'rgba(245,246,250,0.45)' }}>
                            Stay updated on your claims, AI matches, and account activity
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} disabled={markingAll}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(245,246,250,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {markingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                            Mark All as Read ({unreadCount})
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {TABS.map(({ key, label, icon: TabIcon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
                            style={activeTab === key
                                ? { background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 0 15px rgba(212,175,55,0.1)' }
                                : { background: 'rgba(255,255,255,0.02)', color: 'rgba(245,246,250,0.45)', border: '1px solid rgba(255,255,255,0.06)' }
                            }>
                            <TabIcon size={13} />
                            {label}
                            {(counts[key || 'all'] || 0) > 0 && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full ml-0.5"
                                    style={activeTab === key
                                        ? { background: 'rgba(212,175,55,0.25)', color: '#D4AF37' }
                                        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(245,246,250,0.4)' }
                                    }>
                                    {counts[key || 'all']}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notification List */}
                {loading ? (
                    <div className="py-16 text-center">
                        <Loader2 className="animate-spin text-white/20 mx-auto mb-3" size={28} />
                        <p className="text-xs font-medium" style={{ color: 'rgba(245,246,250,0.3)' }}>Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map(notif => (
                            <NotificationCard
                                key={notif._id}
                                notif={notif}
                                onMarkRead={handleMarkRead}
                                onDismiss={handleDismiss}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
                            <Sparkles size={28} style={{ color: '#D4AF37' }} className="animate-pulse" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">
                            {activeTab ? 'No notifications in this category' : 'All caught up!'}
                        </h3>
                        <p className="text-sm font-medium" style={{ color: 'rgba(245,246,250,0.4)' }}>
                            {activeTab
                                ? 'Try switching to a different tab or check back later.'
                                : 'AI is monitoring for potential matches. You\'ll be notified here instantly.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BarChart3, Users, Shield, Package, Search, AlertTriangle, TrendingUp, Clock, Star } from 'lucide-react'

export default function AdminDashboard() {
    const { user, loading: authLoading, isAdmin } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        fetch('/api/admin/stats', { method: 'POST', credentials: 'include' })
            .then(r => r.json())
            .then(d => setStats(d.stats))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user])

    if (authLoading) return <div className="page-bg min-h-screen"><Navbar /></div>
    if (!user || !isAdmin) { router.push('/login'); return null }

    const statCards = stats ? [
        { label: 'Total Lost Items', value: stats.totalLost || 0, icon: Search, color: '#fca5a5' },
        { label: 'Total Found Items', value: stats.totalFound || 0, icon: Package, color: '#6ee7b7' },
        { label: 'Total Claims', value: stats.totalClaims || 0, icon: Shield, color: '#a5b4fc' },
        { label: 'Pending Review', value: stats.pendingClaims || 0, icon: Clock, color: '#fcd34d' },
        { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: '#c4b5fd' },
        { label: 'Restricted Users', value: stats.restrictedUsers || 0, icon: AlertTriangle, color: '#fca5a5' },
    ] : []

    return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="orb w-72 h-72 top-0 right-0 opacity-10" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)' }} />

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <BarChart3 size={24} className="text-indigo-400" /> Admin Dashboard
                        </h1>
                        <p className="text-white/50 text-sm mt-1">System overview and management</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                        style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#c4b5fd' }}>
                        <Star size={12} /> Admin Control Panel
                    </div>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                        {[...Array(6)].map((_, i) => <div key={i} className="glass-card h-24 animate-pulse" style={{ opacity: 0.4 }} />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                        {statCards.map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="glass-card-hover p-5 text-center space-y-2">
                                <Icon size={20} className="mx-auto" style={{ color }} />
                                <div className="text-2xl font-black text-white">{value}</div>
                                <div className="text-white/40 text-xs uppercase tracking-wide">{label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick actions */}
                <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Link href="/admin/claims" className="glass-card-hover p-6 space-y-3 group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <Shield size={22} className="text-indigo-400" />
                        </div>
                        <h3 className="text-white font-semibold">Review Claims</h3>
                        <p className="text-white/50 text-xs">Approve, reject, or request more info on claims with AI scores</p>
                        <span className="text-indigo-400 text-xs group-hover:text-indigo-300 transition-colors">Go to Claims →</span>
                    </Link>

                    <Link href="/admin/users" className="glass-card-hover p-6 space-y-3 group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
                            <Users size={22} className="text-cyan-400" />
                        </div>
                        <h3 className="text-white font-semibold">Manage Users</h3>
                        <p className="text-white/50 text-xs">Warn, restrict, or unrestrict user accounts</p>
                        <span className="text-cyan-400 text-xs group-hover:text-cyan-300 transition-colors">Go to Users →</span>
                    </Link>

                    <Link href="/admin/audit" className="glass-card-hover p-6 space-y-3 group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
                            <TrendingUp size={22} className="text-pink-400" />
                        </div>
                        <h3 className="text-white font-semibold">Audit Logs</h3>
                        <p className="text-white/50 text-xs">View all admin actions with full traceability</p>
                        <span className="text-pink-400 text-xs group-hover:text-pink-300 transition-colors">View Logs →</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

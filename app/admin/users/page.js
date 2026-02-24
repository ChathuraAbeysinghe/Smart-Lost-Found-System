'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Users, AlertTriangle, Shield, Star, Search } from 'lucide-react'

export default function AdminUsersPage() {
    const { user, loading: authLoading, isAdmin } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [search, setSearch] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        if (!user) return
        fetch('/api/admin/users', { credentials: 'include' })
            .then(r => r.json())
            .then(d => setUsers(d.users || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user])

    const handleAction = async (userId, action) => {
        setActionLoading(userId)
        setSuccessMsg('')
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSuccessMsg(`User ${action}${action === 'warn' ? 'ed' : action === 'restrict' ? 'ed' : 'ed'} successfully`)
            setUsers(prev => prev.map(u => u._id === userId ? data.user : u))
        } catch (err) {
            alert(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    if (authLoading) return <div className="page-bg min-h-screen"><Navbar /></div>
    if (!user || !isAdmin) { router.push('/login'); return null }

    const filtered = users.filter(u => {
        if (!search) return true
        const s = search.toLowerCase()
        return u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.campusId?.toLowerCase().includes(s)
    })

    return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Users size={22} className="text-cyan-400" /> User Management</h1>
                        <p className="text-white/50 text-sm mt-1">{users.length} registered user(s)</p>
                    </div>
                    <div className="relative sm:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input className="glass-input pl-9 text-sm" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {successMsg && (
                    <div className="mb-4 p-3 rounded-xl text-sm text-emerald-400" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        ✅ {successMsg}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="glass-card h-16 animate-pulse" style={{ opacity: 0.4 }} />)}</div>
                ) : (
                    <div className="glass-card overflow-hidden rounded-2xl">
                        <div className="overflow-x-auto">
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Campus ID</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Warnings</th>
                                        <th>Status</th>
                                        <th>Badge</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(u => (
                                        <tr key={u._id}>
                                            <td className="text-white text-sm font-medium">{u.name}</td>
                                            <td className="text-white/60 text-sm">{u.campusId}</td>
                                            <td className="text-white/50 text-sm">{u.email}</td>
                                            <td>
                                                <span className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{
                                                        background: u.role === 'admin' ? 'rgba(167,139,250,0.2)' : 'rgba(99,102,241,0.15)',
                                                        color: u.role === 'admin' ? '#c4b5fd' : '#a5b4fc',
                                                        border: `1px solid ${u.role === 'admin' ? 'rgba(167,139,250,0.3)' : 'rgba(99,102,241,0.2)'}`,
                                                    }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="font-bold text-sm" style={{ color: u.warningCount >= 2 ? '#fca5a5' : u.warningCount >= 1 ? '#fcd34d' : '#6ee7b7' }}>
                                                    {u.warningCount || 0}/3
                                                </span>
                                            </td>
                                            <td><StatusBadge status={u.status} /></td>
                                            <td>{u.trustedFinderBadge ? <Star size={16} className="text-yellow-400" /> : <span className="text-white/20">—</span>}</td>
                                            <td>
                                                {u.role !== 'admin' && (
                                                    <div className="flex gap-2">
                                                        {u.status !== 'restricted' ? (
                                                            <>
                                                                <button onClick={() => handleAction(u._id, 'warn')} disabled={actionLoading === u._id}
                                                                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                                                                    style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.2)' }}>
                                                                    <AlertTriangle size={10} className="inline mr-1" />Warn
                                                                </button>
                                                                <button onClick={() => handleAction(u._id, 'restrict')} disabled={actionLoading === u._id}
                                                                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                                                                    style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                                    Restrict
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button onClick={() => handleAction(u._id, 'unrestrict')} disabled={actionLoading === u._id}
                                                                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                                                                style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                                Unrestrict
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import useDashboardData from '@/components/user-dashboard/useDashboardData'
import SidebarNav from '@/components/user-dashboard/SidebarNav'
import MatchCard from '@/components/user-dashboard/MatchCard'
import { Sparkles, Search, Filter, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function MatchesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { matches, loading } = useDashboardData(user)
    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState('')

    if (authLoading) return <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }} />
    if (!user) { router.push('/login'); return null }

    const categories = [...new Set(matches.map(m => m.category).filter(Boolean))]

    const filtered = matches.filter(m => {
        const matchSearch = !search || m.title?.toLowerCase().includes(search.toLowerCase()) || m.location?.toLowerCase().includes(search.toLowerCase())
        const matchCat = !catFilter || m.category === catFilter
        return matchSearch && matchCat
    })

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#0B0F19', color: '#F5F6FA', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-15 blur-[150px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, #1A1A64 0%, transparent 70%)' }} />
            <div className="absolute bottom-[-15%] left-[-5%] w-[40%] h-[50%] rounded-full opacity-10 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />

            <SidebarNav />

            <main className="flex-1 md:ml-64 min-h-screen relative z-10 p-6 md:p-8 overflow-y-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(245,246,250,0.4)' }}>
                            <Link href="/user-dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                            <span style={{ color: 'rgba(245,246,250,0.2)' }}>/</span>
                            <span style={{ color: '#D4AF37' }}>Potential Matches</span>
                        </div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <Sparkles size={28} style={{ color: '#D4AF37' }} /> AI Potential Matches
                        </h1>
                        <p className="text-sm mt-1 font-medium" style={{ color: 'rgba(245,246,250,0.5)' }}>
                            Items our AI engine has matched to your lost reports
                        </p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(245,246,250,0.3)' }} />
                        <input
                            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium border outline-none transition-all focus:border-white/20"
                            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#F5F6FA' }}
                            placeholder="Search matches by title or location..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={14} style={{ color: 'rgba(245,246,250,0.4)' }} />
                        <select
                            className="px-4 py-3 rounded-xl text-sm font-semibold border outline-none"
                            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#F5F6FA' }}
                            value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="rounded-2xl p-4 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-2xl font-black text-white">{matches.length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'rgba(245,246,250,0.5)' }}>Total Matches</p>
                    </div>
                    <div className="rounded-2xl p-4 border" style={{ background: 'rgba(212,175,55,0.05)', borderColor: 'rgba(212,175,55,0.15)' }}>
                        <p className="text-2xl font-black" style={{ color: '#D4AF37' }}>{filtered.length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'rgba(245,246,250,0.5)' }}>Showing</p>
                    </div>
                    <div className="rounded-2xl p-4 border hidden sm:block" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.15)' }}>
                        <p className="text-2xl font-black" style={{ color: '#4ade80' }}>{categories.length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'rgba(245,246,250,0.5)' }}>Categories</p>
                    </div>
                </div>

                {/* Matches Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-72 rounded-[20px] animate-pulse border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-3xl border p-16 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border" style={{ background: 'rgba(212, 175, 55, 0.05)', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                            <Sparkles size={28} color="#D4AF37" className="animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {matches.length === 0 ? 'No matches yet' : 'No results found'}
                        </h3>
                        <p className="text-sm font-medium max-w-sm mx-auto" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                            {matches.length === 0
                                ? 'Our AI is continuously scanning. We\'ll alert you immediately when a strong match is found.'
                                : 'Try adjusting your search or filter criteria.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((match, i) => (
                            <MatchCard
                                key={match.id || i}
                                id={match.id}
                                title={match.title}
                                location={match.location}
                                category={match.category}
                                matchScore={match.matchScore}
                                timeAgo={match.timeAgo || 'Recently'}
                                imageUrl={match.imageUrl}
                                lostItemId={match.lostItemId}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

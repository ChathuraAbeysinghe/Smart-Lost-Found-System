'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ItemCard from '@/components/ui/ItemCard'
import { Search, ArrowRight, Shield, Brain, Users, TrendingUp, Star, MapPin } from 'lucide-react'

export default function HomePage() {
    const [stats, setStats] = useState({ totalLost: 0, totalFound: 0, resolved: 0 })
    const [recentLost, setRecentLost] = useState([])
    const [recentFound, setRecentFound] = useState([])

    useEffect(() => {
        fetch('/api/lost-items?page=1').then(r => r.json()).then(d => {
            setRecentLost(d.items?.slice(0, 3) || [])
            setStats(s => ({ ...s, totalLost: d.total || 0 }))
        }).catch(() => { })
        fetch('/api/found-items?page=1').then(r => r.json()).then(d => {
            setRecentFound(d.items?.slice(0, 3) || [])
            setStats(s => ({ ...s, totalFound: d.total || 0 }))
        }).catch(() => { })
    }, [])

    const features = [
        { icon: Brain, title: 'AI Matching Engine', desc: 'TF-IDF cosine similarity scores claims with up to 95% accuracy', color: '#6366f1' },
        { icon: Shield, title: 'Fraud Detection', desc: 'Risk scoring and 3-strike warning system prevents fake claims', color: '#ec4899' },
        { icon: TrendingUp, title: 'Claim Lifecycle', desc: '7-stage tracking from submission to pickup completion', color: '#06b6d4' },
        { icon: Users, title: 'Role-Based Access', desc: 'Separate admin dashboard with full governance control', color: '#10b981' },
    ]

    return (
        <div className="page-bg">
            <Navbar />
            {/* Floating orbs */}
            <div className="orb w-96 h-96 top-0 left-0 opacity-20" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)' }} />
            <div className="orb w-80 h-80 top-20 right-0 opacity-15" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)' }} />
            <div className="orb w-64 h-64 bottom-0 left-1/3 opacity-10" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.5) 0%, transparent 70%)' }} />

            {/* Hero */}
            <section className="relative pt-32 pb-20 px-4 text-center">
                <div className="max-w-4xl mx-auto animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold tracking-wider uppercase"
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                        <Star size={12} />
                        AI-Powered Campus Platform
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                        Smart Campus
                        <span className="block" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 50%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            Lost & Found
                        </span>
                    </h1>
                    <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Reconnecting students and staff with their belongings through AI-assisted claim verification, fraud detection, and transparent tracking.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/lost-items" className="btn-glass-primary btn-glass-lg">
                            🔍 View Lost Items
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="/found-items" className="btn-glass-cyan btn-glass-lg">
                            📦 View Found Items
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="/register" className="btn-glass btn-glass-lg">
                            Get Started Free
                        </Link>
                    </div>
                </div>

                {/* Stats row */}
                <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-4">
                    {[
                        { label: 'Lost Reports', value: stats.totalLost, color: '#fca5a5' },
                        { label: 'Found Items', value: stats.totalFound, color: '#6ee7b7' },
                        { label: 'Reunited', value: stats.resolved, color: '#a5b4fc' },
                    ].map((s) => (
                        <div key={s.label} className="glass-card p-5 text-center">
                            <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-white/50 text-xs uppercase tracking-wider">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Why Smart Campus?</h2>
                        <p className="text-white/50">Built beyond a basic CRUD system</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="glass-card-hover p-6 space-y-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                                    <Icon size={20} style={{ color }} />
                                </div>
                                <h3 className="text-white font-semibold text-sm">{title}</h3>
                                <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick actions */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card p-8 md:p-12 text-center"
                        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(6,182,212,0.08) 100%)' }}>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Lost or found something?</h2>
                        <p className="text-white/60 mb-8">Report it in minutes. Our AI will help match items automatically.</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/lost-items/new" className="btn-glass-danger btn-glass-lg">
                                😰 I Lost Something
                            </Link>
                            <Link href="/found-items/new" className="btn-glass-success btn-glass-lg">
                                😊 I Found Something
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent lost items */}
            {recentLost.length > 0 && (
                <section className="py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Recently Lost</h2>
                            <Link href="/lost-items" className="btn-glass text-xs px-4 py-2">View All →</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recentLost.map(item => <ItemCard key={item._id} item={item} type="lost" />)}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/5 text-center text-white/30 text-xs">
                <p>Smart Campus Lost & Found System © 2024 · AI-Assisted Platform · University of Technology</p>
            </footer>
        </div>
    )
}

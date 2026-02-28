'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ItemCard from '@/components/ui/ItemCard'
import { Search, Shield, Brain, Users, TrendingUp, Star } from 'lucide-react'

export default function HomePage() {
    const [stats, setStats] = useState({ totalLost: 5200, totalFound: 3800, resolved: 95 }) // Using placeholder for visual exactly as requested by Stitch "5200+ Lost", "3800+ Found", "95% Reunited"
    const [recentLost, setRecentLost] = useState([])

    useEffect(() => {
        fetch('/api/lost-items?page=1').then(r => r.json()).then(d => {
            setRecentLost(d.items?.slice(0, 3) || [])
            // Keep stats as requested by design, or update from DB here if preferred. Let's keep the premium feel of the design.
        }).catch(() => { })
    }, [])

    return (
        <div style={{ backgroundColor: '#0B0F19', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <Navbar />

            {/* Ambient Glowing Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #1A1A64 0%, transparent 70%)' }} />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #F06414 0%, transparent 70%)' }} />
            <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full opacity-10 blur-[150px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 lg:pt-48 lg:pb-32 flex items-center min-h-[80vh] z-10">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="text-left animate-slide-up">
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
                                Smart Campus
                                <span className="block mt-2 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #F5F6FA 0%, #a1a1aa 100%)' }}>
                                    Lost & Found
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl max-w-xl mb-12 leading-relaxed" style={{ color: '#F5F6FA', opacity: 0.8 }}>
                                Reconnecting students and staff with their belongings through AI-assisted claim verification, luxury UX, and transparent tracking.
                            </p>

                            {/* Liquid Glass Call-to-Action (CTA) */}
                            <div className="flex flex-col sm:flex-row gap-6 mt-8">
                                {/* Left Button: Report a LOST Item (Primary Blue) */}
                                <Link href="/lost-items/new"
                                    className="relative group overflow-hidden rounded-2xl px-8 py-5 flex items-center justify-center gap-4 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
                                    style={{
                                        background: 'rgba(26, 26, 100, 0.4)', // Primary Blue #1A1A64
                                        backdropFilter: 'blur(24px)',
                                        WebkitBackdropFilter: 'blur(24px)',
                                        border: '1px solid rgba(26, 26, 100, 0.8)',
                                        boxShadow: '0 12px 40px rgba(26, 26, 100, 0.4), inset 0 0 20px rgba(26, 26, 100, 0.2)'
                                    }}>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                        style={{ background: 'linear-gradient(135deg, rgba(26, 26, 100, 0.6) 0%, transparent 100%)' }} />
                                    <Search size={24} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] relative z-10" />
                                    <span className="text-white font-bold text-lg tracking-wide relative z-10 drop-shadow-md">Report Lost Item</span>
                                </Link>

                                {/* Right Button: Report a FOUND Item (Accent Orange) */}
                                <Link href="/found-items/new"
                                    className="relative group overflow-hidden rounded-2xl px-8 py-5 flex items-center justify-center gap-4 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
                                    style={{
                                        background: 'rgba(240, 100, 20, 0.2)', // Accent Orange #F06414
                                        backdropFilter: 'blur(24px)',
                                        WebkitBackdropFilter: 'blur(24px)',
                                        border: '1px solid rgba(240, 100, 20, 0.6)',
                                        boxShadow: '0 12px 40px rgba(240, 100, 20, 0.3), inset 0 0 20px rgba(240, 100, 20, 0.15)'
                                    }}>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                        style={{ background: 'linear-gradient(135deg, rgba(240, 100, 20, 0.4) 0%, transparent 100%)' }} />
                                    <Shield size={24} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] relative z-10" />
                                    <span className="text-white font-bold text-lg tracking-wide relative z-10 drop-shadow-md">Report Found Item</span>
                                </Link>
                            </div>
                        </div>

                        {/* Right side: Image Presentation */}
                        <div className="relative animate-slide-up lg:block hidden" style={{ animationDelay: '0.2s' }}>
                            <div className="absolute inset-0 rounded-[3rem] blur-[60px] opacity-40 animate-pulse pointer-events-none" style={{ background: 'linear-gradient(to top right, #1A1A64, #F06414)' }}></div>
                            <div className="relative rounded-[2rem] p-4 border border-white/10 shadow-2xl" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)' }}>
                                <img src="/hero_signs.jpg" alt="Ghost Signs_ Lost & Found" className="w-full h-auto rounded-[1.5rem] object-cover transform transition-transform duration-700 hover:scale-[1.02]" style={{ minHeight: '350px' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="absolute bottom-[-4rem] left-0 right-0 z-20 px-4 hidden md:block">
                    <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
                        {[
                            { label: 'Lost Reports', value: '5,200+' },
                            { label: 'Found Items', value: '3,800+' },
                            { label: 'Reunited', value: '95%' },
                        ].map((s) => (
                            <div key={s.label} className="p-8 text-center rounded-2xl transform transition hover:-translate-y-2 duration-300"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(30px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                }}>
                                <div className="text-4xl font-black mb-2 drop-shadow-lg" style={{ color: '#D4AF37' }}>{s.value}</div>
                                <div className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: '#F5F6FA' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mobile Stats (Visible only on small screens) */}
            <section className="pt-8 pb-12 px-4 md:hidden relative z-10">
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { label: 'Lost Reports', value: '5,200+' },
                        { label: 'Found Items', value: '3,800+' },
                        { label: 'Reunited', value: '95%' },
                    ].map((s) => (
                        <div key={s.label} className="p-6 text-center rounded-2xl"
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(30px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}>
                            <div className="text-3xl font-black mb-1" style={{ color: '#D4AF37' }}>{s.value}</div>
                            <div className="text-xs uppercase tracking-wider" style={{ color: '#F5F6FA' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features / Why Smart Campus */}
            <section className="py-24 px-4 relative z-10 mt-12">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Why Smart Campus?</h2>
                        <p style={{ color: '#F5F6FA', opacity: 0.7 }}>Premium tracking built on advanced AI architecture.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Brain, title: 'AI Matching Engine', desc: 'TF-IDF cosine similarity scores claims with up to 95% accuracy' },
                            { icon: Shield, title: 'Fraud Detection', desc: 'Risk scoring and 3-strike warning system prevents fake claims' },
                            { icon: TrendingUp, title: 'Claim Lifecycle', desc: '7-stage tracking from submission to pickup completion' },
                            { icon: Users, title: 'Role-Based Access', desc: 'Separate admin dashboard with full governance control' },
                        ].map(({ icon: Icon, title, desc }, idx) => (
                            <div key={title} className="p-8 rounded-2xl space-y-4 group transition-all duration-300 hover:bg-white/5"
                                style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                    style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                                    <Icon size={24} color="#D4AF37" />
                                </div>
                                <h3 className="text-white font-semibold text-lg">{title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: '#F5F6FA', opacity: 0.6 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent lost items */}
            {recentLost.length > 0 && (
                <section className="py-16 px-4 relative z-10" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-black text-white">Recently Lost</h2>
                            <Link href="/lost-items" className="text-sm font-semibold tracking-wide hover:underline" style={{ color: '#F06414' }}>
                                View All Items &rarr;
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recentLost.map(item => (
                                <div key={item._id} style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}>
                                    <ItemCard item={item} type="lost" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-10 px-4 text-center mt-12 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="font-medium tracking-wide text-sm" style={{ color: '#F5F6FA', opacity: 0.5 }}>
                    Smart Campus Lost & Found System © 2026 · AI-Assisted Luxury Platform
                </p>
            </footer>
        </div>
    )
}

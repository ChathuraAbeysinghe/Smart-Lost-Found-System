'use client';
import { Bell, CheckCircle2, Sparkles, AlertCircle, AlertTriangle, ShieldAlert, XCircle, Unlock, MailQuestion, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function getUpdateIcon(type) {
    const map = {
        ai_match: { icon: Sparkles, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.2)' },
        claim_update: { icon: CheckCircle2, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' },
        claim_approved: { icon: CheckCircle2, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', border: 'rgba(74, 222, 128, 0.3)' },
        claim_rejected: { icon: XCircle, color: '#f87171', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)' },
        claim_info_requested: { icon: MailQuestion, color: '#fb923c', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.25)' },
        warning: { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
        restriction: { icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' },
        appeal_approved: { icon: CheckCircle2, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', border: 'rgba(74, 222, 128, 0.3)' },
        appeal_rejected: { icon: XCircle, color: '#f87171', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)' },
        unrestricted: { icon: Unlock, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.08)', border: 'rgba(74, 222, 128, 0.25)' },
        system: { icon: Info, color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)' },
    };
    return map[type] || { icon: AlertCircle, color: '#F06414', bg: 'rgba(240, 100, 20, 0.1)', border: 'rgba(240, 100, 20, 0.4)' };
}

export default function UpdatesPanel({ updates = [] }) {
    const unreadCount = updates.filter(u => !u.read).length;

    return (
        <div className="flex flex-col gap-6">
            {/* Updates Card — Mini Summary */}
            <div className="rounded-3xl p-6 shadow-xl border relative overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(30px)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                    <h3 className="text-xl font-black flex items-center gap-3 tracking-wide text-white">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                            <Bell size={16} style={{ color: '#D4AF37' }} />
                        </div>
                        Updates
                    </h3>
                    {unreadCount > 0 && (
                        <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full"
                            style={{ background: 'rgba(240, 100, 20, 0.1)', color: '#F06414', border: '1px solid rgba(240, 100, 20, 0.3)' }}>
                            {unreadCount} New
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    {updates.length > 0 ? (
                        updates.slice(0, 4).map((update) => {
                            const { icon: Icon, color, bg, border } = getUpdateIcon(update.type);
                            const foundId = update.foundItemId?._id || update.foundItemId;
                            const isNavigable = !!foundId;

                            const content = (
                                <>
                                    <div className="mt-0.5 shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 border"
                                        style={{ background: bg, borderColor: border, color, boxShadow: `0 0 12px ${bg}` }}>
                                        <Icon size={15} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`font-bold text-xs tracking-wide ${update.read ? 'text-white/60' : 'text-white'}`}>
                                                {update.title}
                                                {update.matchScore > 0 && (
                                                    <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded"
                                                        style={{
                                                            color: update.matchScore >= 70 ? '#4ade80' : update.matchScore >= 50 ? '#D4AF37' : '#F06414',
                                                            background: update.matchScore >= 70 ? 'rgba(74,222,128,0.1)' : update.matchScore >= 50 ? 'rgba(212,175,55,0.1)' : 'rgba(240,100,20,0.1)',
                                                        }}>
                                                        {update.matchScore}%
                                                    </span>
                                                )}
                                            </h4>
                                            <span className="text-[9px] font-bold tracking-wider uppercase shrink-0" style={{ color: 'rgba(245, 246, 250, 0.3)' }}>
                                                {timeAgo(update.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] mt-0.5 leading-relaxed font-medium line-clamp-2" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                                            {update.message}
                                        </p>
                                    </div>
                                    {!update.read && (
                                        <div className="shrink-0 w-2 h-2 rounded-full mt-2"
                                            style={{ background: '#F06414', boxShadow: '0 0 8px rgba(240, 100, 20, 0.5)' }} />
                                    )}
                                </>
                            );

                            return isNavigable ? (
                                <Link key={update._id} href={`/found-items/${foundId}`}
                                    className="flex gap-3 group cursor-pointer p-2.5 -mx-2.5 rounded-xl hover:bg-white/5 transition-colors">
                                    {content}
                                </Link>
                            ) : (
                                <div key={update._id}
                                    className="flex gap-3 group p-2.5 -mx-2.5 rounded-xl hover:bg-white/5 transition-colors">
                                    {content}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-6 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center border"
                                style={{ background: 'rgba(212, 175, 55, 0.05)', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                                <Sparkles size={20} color="#D4AF37" className="animate-pulse" />
                            </div>
                            <h4 className="text-xs font-bold text-white mb-1">No updates yet</h4>
                            <p className="text-[10px] font-medium" style={{ color: 'rgba(245, 246, 250, 0.4)' }}>
                                AI is monitoring for potential matches.
                            </p>
                        </div>
                    )}
                </div>

                {/* View All → link */}
                <div className="mt-5 pt-4 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.05)' }}>
                    <Link href="/notifications"
                        className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest py-2.5 rounded-xl transition-all hover:bg-white/5 group"
                        style={{ color: 'rgba(245,246,250,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        View All Notifications
                        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Need Help Card */}
            <div className="rounded-3xl p-6 border relative overflow-hidden"
                style={{ background: 'rgba(26, 26, 100, 0.2)', borderColor: 'rgba(26, 26, 100, 0.6)', backdropFilter: 'blur(20px)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F06414]/10 blur-3xl rounded-full" />
                <h3 className="font-black text-xl mb-3 tracking-wide text-white relative z-10">Security Help</h3>
                <p className="text-sm font-medium mb-6 leading-relaxed relative z-10" style={{ color: 'rgba(245, 246, 250, 0.7)' }}>
                    Visit the main security office or contact support for advanced claim inquiries.
                </p>
                <button className="w-full relative group overflow-hidden border rounded-xl py-3 text-sm font-bold uppercase tracking-wider text-white z-10 transition-shadow hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Open Support Desk
                </button>
            </div>
        </div>
    );
}

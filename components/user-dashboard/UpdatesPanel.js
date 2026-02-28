import { Bell, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';

export default function UpdatesPanel({ updates = [] }) {
    return (
        <div className="flex flex-col gap-6">
            {/* Updates Card */}
            <div className="rounded-3xl p-6 shadow-xl border relative overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(30px)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                    <h3 className="text-xl font-black flex items-center gap-3 tracking-wide text-white">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                            <Bell size={16} style={{ color: '#D4AF37' }} />
                        </div>
                        Updates
                    </h3>
                    <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(240, 100, 20, 0.1)', color: '#F06414', border: '1px solid rgba(240, 100, 20, 0.3)' }}>
                        3 New
                    </span>
                </div>

                <div className="space-y-6">
                    {/* Item Found Update */}
                    <div className="flex gap-4 group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-white/5 transition-colors">
                        <div className="mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(26,26,100,0.5)] border"
                            style={{ background: 'rgba(26, 26, 100, 0.2)', borderColor: 'rgba(26, 26, 100, 0.5)', color: '#4ade80' }}>
                            <CheckCircle2 size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-sm tracking-wide text-white">Item Found!</h4>
                                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'rgba(245, 246, 250, 0.4)' }}>10m ago</span>
                            </div>
                            <p className="text-xs mt-1 leading-relaxed font-medium" style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                                A strong AI match was found for your "MacBook Pro".
                            </p>
                        </div>
                    </div>

                    {/* New Message Update */}
                    <div className="flex gap-4 group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-white/5 transition-colors">
                        <div className="mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(26,26,100,0.5)] border"
                            style={{ background: 'rgba(26, 26, 100, 0.2)', borderColor: 'rgba(26, 26, 100, 0.5)', color: '#60a5fa' }}>
                            <MessageCircle size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-sm tracking-wide text-white">New Comment</h4>
                                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'rgba(245, 246, 250, 0.4)' }}>1h ago</span>
                            </div>
                            <p className="text-xs mt-1 leading-relaxed font-medium" style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                                Security Desk: "Please confirm the serial code..."
                            </p>
                        </div>
                    </div>

                    {/* Claim Expiring Update */}
                    <div className="flex gap-4 group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-white/5 transition-colors">
                        <div className="mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(240,100,20,0.3)] border"
                            style={{ background: 'rgba(240, 100, 20, 0.1)', borderColor: 'rgba(240, 100, 20, 0.4)', color: '#F06414' }}>
                            <AlertCircle size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-sm tracking-wide text-white">Claim Expiring</h4>
                                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'rgba(245, 246, 250, 0.4)' }}>5h ago</span>
                            </div>
                            <p className="text-xs mt-1 leading-relaxed font-medium" style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                                Please pick up your ID card by tomorrow 5 PM.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center pt-5 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.05)' }}>
                    <button className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-white" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                        Mark all as read
                    </button>
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

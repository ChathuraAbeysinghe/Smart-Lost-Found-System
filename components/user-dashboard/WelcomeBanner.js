import { ShieldCheck } from 'lucide-react';

export default function WelcomeBanner({ userName, activeClaims, historyCount, studentId }) {
    return (
        <div className="rounded-[24px] p-8 md:p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-stretch justify-between gap-8 transform transition-transform duration-500 hover:scale-[1.01]"
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
            {/* Ambient Background Glows */}
            <div className="absolute top-[-50%] left-[-10%] w-[80%] h-[150%] rounded-full opacity-20 blur-[80px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, #1A1A64 0%, transparent 70%)' }} />

            {/* Left Content Area */}
            <div className="z-10 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-white text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md uppercase tracking-widest"
                        style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', color: '#D4AF37' }}>
                        Student
                    </span>
                    {studentId && (
                        <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                            <ShieldCheck size={16} color="#4ade80" /> Verified ID: {studentId}
                        </span>
                    )}
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white drop-shadow-md">
                    Welcome back, {userName}!
                </h1>

                <p className="max-w-xl text-base md:text-lg leading-relaxed" style={{ color: 'rgba(245, 246, 250, 0.7)' }}>
                    You have <strong className="text-white px-2 py-0.5 rounded-md mx-1" style={{ background: 'rgba(240, 100, 20, 0.3)', border: '1px solid rgba(240, 100, 20, 0.5)' }}>{activeClaims} active claim{activeClaims !== 1 ? 's' : ''}</strong> being processed. AI is heavily monitoring for new potential matches.
                </p>
            </div>

            {/* Right Metrics Area */}
            <div className="z-10 flex items-center gap-5 shrink-0">
                <div className="rounded-2xl w-28 h-28 flex flex-col items-center justify-center transition-transform hover:-translate-y-2 cursor-default"
                    style={{ background: 'rgba(26, 26, 100, 0.3)', backdropFilter: 'blur(20px)', border: '1px solid rgba(26, 26, 100, 0.6)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                    <span className="font-black text-4xl mb-1 text-white">{activeClaims}</span>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>Active</span>
                </div>
                <div className="rounded-2xl w-28 h-28 flex flex-col items-center justify-center transition-transform hover:-translate-y-2 cursor-default"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    <span className="font-black text-4xl mb-1 text-white">{historyCount}</span>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>History</span>
                </div>
            </div>
        </div>
    );
}

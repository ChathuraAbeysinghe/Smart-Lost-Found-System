import { Clock, Search, UserCheck, CheckCircle2, Package } from 'lucide-react';

const STEPS = [
    { id: 'submitted', label: 'Submitted', icon: Clock },
    { id: 'ai_matched', label: 'AI Matched', icon: Search },
    { id: 'admin_review', label: 'Admin Review', icon: UserCheck },
    { id: 'approved', label: 'Approved', icon: CheckCircle2 },
    { id: 'pickup', label: 'Pickup', icon: Package }
];

export default function StatusStepper({ currentStatus, claimId, itemName, lastSeen, statusDates = {} }) {
    const getActiveIndex = () => {
        const statuses = STEPS.map(s => s.id);
        const index = statuses.indexOf(currentStatus);
        return index !== -1 ? index : 0;
    };

    const activeIndex = getActiveIndex();

    return (
        <div className="rounded-[20px] p-6 shadow-lg border relative overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-xl font-bold mb-1 tracking-wide" style={{ color: '#F5F6FA' }}>Active Claim Status</h2>
                    <p className="font-semibold text-lg" style={{ color: '#F06414' }}>{itemName}</p>
                    <p className="text-sm mt-1" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>Last seen at {lastSeen}</p>
                </div>
                <div className="text-xs font-bold tracking-[0.1em] px-3 py-1 rounded bg-white/5 border border-white/10 uppercase" style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                    Claim #{claimId}
                </div>
            </div>

            {/* Stepper Container */}
            <div className="mt-8 relative mb-2">
                <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index < activeIndex;
                        const isActive = index === activeIndex;
                        const isPending = index > activeIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center flex-1 relative group">
                                {/* Connecting Line (Desktop) */}
                                {index !== STEPS.length - 1 && (
                                    <div className={`hidden md:block absolute top-[24px] left-[50%] w-full h-[2px] z-[-1] transition-colors duration-500 ${isCompleted ? 'bg-[#F06414]' : 'bg-white/10'}`} />
                                )}

                                {/* Connecting Line (Mobile) */}
                                {index !== STEPS.length - 1 && (
                                    <div className={`md:hidden absolute top-[48px] left-[24px] w-[2px] h-full z-[-1] transition-colors duration-500 ${isCompleted ? 'bg-[#F06414]' : 'bg-white/10'}`} />
                                )}

                                {/* Icon Circle */}
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative ${isCompleted
                                            ? 'border-[#F06414] text-[#F06414]'
                                            : isActive
                                                ? 'border-[#F06414] text-white bg-[#F06414] shadow-[0_0_20px_rgba(240,100,20,0.6)]'
                                                : 'border-white/20 text-white/30 bg-white/5'
                                        }`}
                                    style={isCompleted ? { background: 'rgba(240, 100, 20, 0.1)', backdropFilter: 'blur(10px)' } : {}}
                                >
                                    <Icon size={20} strokeWidth={isActive || isCompleted ? 2.5 : 2} className={isActive ? 'drop-shadow-md' : ''} />
                                </div>

                                {/* Labels */}
                                <div className="mt-4 text-center">
                                    <p className={`text-sm font-bold tracking-wide transition-colors duration-300 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : isPending ? 'text-white/30' : 'text-[#F5F6FA]'}`}>
                                        {step.label}
                                    </p>

                                    <p className="text-[11px] mt-1 font-medium tracking-wider uppercase min-h-[16px]" style={{ color: 'rgba(245, 246, 250, 0.4)' }}>
                                        {statusDates[step.id] ? statusDates[step.id] : (isPending ? 'Pending' : '')}
                                    </p>
                                    {isActive && (
                                        <p className="text-[10px] font-black uppercase mt-1 tracking-widest animate-pulse" style={{ color: '#F06414' }}>
                                            In Progress
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

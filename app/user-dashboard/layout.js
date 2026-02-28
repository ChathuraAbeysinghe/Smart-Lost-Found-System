import SidebarNav from '@/components/user-dashboard/SidebarNav'

export const metadata = {
    title: 'Dashboard - Smart Campus Lost & Found',
    description: 'Premium user dashboard for Smart Campus Lost & Found',
}

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#0B0F19', color: '#F5F6FA', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Glowing Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #1A1A64 0%, transparent 70%)', zIndex: 0 }} />
            <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-15 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #F06414 0%, transparent 70%)', zIndex: 0 }} />

            {/* Sidebar Navigation */}
            <SidebarNav />

            {/* Main Content Workspace */}
            <main className="flex-1 flex flex-col md:ml-64 w-full min-h-screen relative z-10">
                {/* Mobile Header (visible only on small screens) */}
                <div className="md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-40"
                    style={{ background: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(20px)', borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="font-bold text-lg text-white">Smart Campus</span>
                    <button className="p-2 text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    </button>
                </div>

                {children}
            </main>
        </div>
    )
}

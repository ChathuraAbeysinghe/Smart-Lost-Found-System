'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({ name: '', email: '', campusId: '', password: '', department: '', studentId: '', phone: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Registration failed')
            router.push('/user-dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
    const labelClass = "text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1 block"

    return (
        <div className="bg-[#F4F5F7] min-h-screen flex items-center justify-center px-4 py-12 font-sans">
            <div className="w-full max-w-lg animate-slide-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 bg-white border-2 border-[#1C2A59] shadow-sm">
                        🎓
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#1C2A59]">Create Account</h1>
                    <p className="text-[#3E4A56] font-medium text-sm mt-1">Join Smart Campus Lost & Found</p>
                </div>

                <div className="bg-white p-8 rounded border border-gray-200 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                                <input className={inputClass} placeholder="John Doe" value={form.name} onChange={change('name')} required />
                            </div>
                            <div>
                                <label className={labelClass}>Campus ID <span className="text-red-500">*</span></label>
                                <input className={inputClass} placeholder="IT23844292" value={form.campusId} onChange={change('campusId')} required />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                            <input type="email" className={inputClass} placeholder="you@uni.edu" value={form.email} onChange={change('email')} required />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Department</label>
                                <input className={inputClass} placeholder="e.g. Computer Science" value={form.department} onChange={change('department')} />
                            </div>
                            <div>
                                <label className={labelClass}>Student/Staff ID</label>
                                <input className={inputClass} placeholder="e.g. 2021IT0123" value={form.studentId} onChange={change('studentId')} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Phone (optional)</label>
                            <input className={inputClass} placeholder="+94 7X XXX XXXX" value={form.phone} onChange={change('phone')} />
                        </div>

                        <div>
                            <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} className={inputClass} placeholder="Min 6 characters"
                                    value={form.password} onChange={change('password')} minLength={6} required />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C2A59] transition-colors">
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded border bg-red-50 border-red-200 text-red-600 text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 py-3 rounded text-sm font-extrabold uppercase tracking-wide transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            style={{ backgroundColor: '#1C2A59', color: '#FFFFFF' }}>
                            <UserPlus size={18} />
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-[#3E4A56] font-medium text-sm mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#008489] hover:underline font-bold">Sign in</Link>
                    </p>
                    <p className="text-center mt-3">
                        <Link href="/" className="text-gray-400 hover:text-[#1C2A59] text-xs font-bold transition-colors">← Back to Home</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

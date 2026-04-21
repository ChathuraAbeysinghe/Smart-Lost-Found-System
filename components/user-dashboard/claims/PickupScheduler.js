'use client';
import { useState } from 'react';
import {
    CalendarCheck, Clock, MapPin, Loader2, AlertTriangle,
    CheckCircle2, Package, ChevronRight
} from 'lucide-react';

const TIME_SLOTS = [
    '09:00 AM – 10:00 AM',
    '10:00 AM – 11:00 AM',
    '11:00 AM – 12:00 PM',
    '01:00 PM – 02:00 PM',
    '02:00 PM – 03:00 PM',
    '03:00 PM – 04:00 PM',
];

export default function PickupScheduler({ claim, onScheduled }) {
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTimeSlot, setPickupTimeSlot] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const [confirmingComplete, setConfirmingComplete] = useState(false);

    // Only show for approved or pickup_scheduled statuses
    if (!claim || !['approved', 'pickup_scheduled'].includes(claim.status)) {
        return null;
    }

    const today = new Date().toISOString().split('T')[0];

    // ── Schedule Pickup ──
    const handleSchedule = async () => {
        if (!pickupDate || !pickupTimeSlot) {
            setErr('Please select both a date and a time slot.');
            return;
        }
        setLoading(true);
        setErr('');
        try {
            const res = await fetch(`/api/claims/${claim._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'schedule_pickup', pickupDate, pickupTimeSlot }),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to schedule pickup');
            onScheduled(data.claim);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Confirm Pickup Complete ──
    const handleComplete = async () => {
        setLoading(true);
        setErr('');
        try {
            const res = await fetch(`/api/claims/${claim._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete_pickup' }),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to confirm pickup');
            onScheduled(data.claim);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
            setConfirmingComplete(false);
        }
    };

    const input = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F4F5F7] text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 transition-all';
    const label = 'text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5';

    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS: APPROVED → Show scheduling form
    // ═══════════════════════════════════════════════════════════════════════════
    if (claim.status === 'approved') {
        return (
            <div className="p-5 rounded-[20px] border bg-white space-y-5 shadow-sm"
                style={{ borderColor: '#99F6E4', animation: 'fadeSlideIn 0.25s ease-out' }}>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)' }}>
                            <CalendarCheck size={15} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-[#1C2A59]">Schedule Pickup</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                Your claim was approved! Choose when to collect your item.
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: '#CCFBF1', color: '#0F766E', border: '1px solid #99F6E4' }}>
                        Approved
                    </span>
                </div>

                {/* Pickup Location Info */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F0FDFA] border border-[#99F6E4]">
                    <MapPin size={14} className="text-[#0F766E] shrink-0" />
                    <p className="text-xs font-semibold text-[#0F766E]">
                        Pickup at: <span className="font-medium text-[#3E4A56]">{claim.pickupPreference || 'Campus Lost & Found Office'}</span>
                    </p>
                </div>

                {/* Date & Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={label}><CalendarCheck size={10} /> Pickup Date <span className="text-red-400">*</span></label>
                        <input type="date" className={input} min={today}
                            value={pickupDate} onChange={e => setPickupDate(e.target.value)} />
                    </div>
                    <div>
                        <label className={label}><Clock size={10} /> Time Slot <span className="text-red-400">*</span></label>
                        <select className={input} value={pickupTimeSlot} onChange={e => setPickupTimeSlot(e.target.value)}>
                            <option value="">Select a slot</option>
                            {TIME_SLOTS.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Error */}
                {err && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle size={13} /> {err}
                    </div>
                )}

                {/* Submit */}
                <button onClick={handleSchedule} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #0F766E, #14B8A6)' }}>
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <CalendarCheck size={15} />}
                    {loading ? 'Scheduling...' : 'Confirm Pickup Schedule'}
                    {!loading && <ChevronRight size={14} />}
                </button>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS: PICKUP_SCHEDULED → Show scheduled info + confirm button
    // ═══════════════════════════════════════════════════════════════════════════
    if (claim.status === 'pickup_scheduled') {
        const scheduledDate = claim.pickupScheduledAt
            ? new Date(claim.pickupScheduledAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            : '—';

        return (
            <div className="p-5 rounded-[20px] border bg-white space-y-4 shadow-sm"
                style={{ borderColor: '#99F6E4', animation: 'fadeSlideIn 0.25s ease-out' }}>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)' }}>
                            <Package size={15} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-[#1C2A59]">Pickup Scheduled</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                Your pickup is confirmed. Please collect your item at the scheduled time.
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: '#CCFBF1', color: '#0F766E', border: '1px solid #99F6E4' }}>
                        Scheduled
                    </span>
                </div>

                {/* Pickup Details Card */}
                <div className="p-4 rounded-2xl border border-[#99F6E4] bg-[#F0FDFA] space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#CCFBF1] flex items-center justify-center">
                            <CalendarCheck size={16} className="text-[#0F766E]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</p>
                            <p className="text-sm font-bold text-[#1C2A59]">{scheduledDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#CCFBF1] flex items-center justify-center">
                            <Clock size={16} className="text-[#0F766E]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Time Slot</p>
                            <p className="text-sm font-bold text-[#1C2A59]">{claim.pickupTimeSlot || '—'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#CCFBF1] flex items-center justify-center">
                            <MapPin size={16} className="text-[#0F766E]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Location</p>
                            <p className="text-sm font-bold text-[#1C2A59]">{claim.pickupPreference || 'Campus Lost & Found Office'}</p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {err && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle size={13} /> {err}
                    </div>
                )}

                {/* Confirm Completion */}
                {!confirmingComplete ? (
                    <button onClick={() => setConfirmingComplete(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #1C2A59, #2d4080)' }}>
                        <CheckCircle2 size={15} />
                        I've Picked Up My Item
                    </button>
                ) : (
                    <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50 space-y-3"
                        style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
                        <p className="text-sm font-bold text-[#1C2A59]">
                            Confirm you've received the item?
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                            This action cannot be undone. The claim will be marked as <strong className="text-[#1C2A59]">Completed</strong>.
                        </p>
                        <div className="flex items-center gap-3">
                            <button onClick={handleComplete} disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-md disabled:opacity-60"
                                style={{ background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                {loading ? 'Confirming...' : 'Yes, Confirm'}
                            </button>
                            <button onClick={() => setConfirmingComplete(false)} disabled={loading}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#3E4A56] bg-white border border-gray-200 hover:bg-gray-50 transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
}

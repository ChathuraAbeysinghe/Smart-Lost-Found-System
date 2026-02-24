'use client'

export default function StatusBadge({ status }) {
    const map = {
        // Lost item statuses
        pending: { label: 'Pending', bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
        matched: { label: 'Matched', bg: 'rgba(6,182,212,0.15)', color: '#67e8f9', border: 'rgba(6,182,212,0.3)' },
        resolved: { label: 'Resolved', bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
        archived: { label: 'Archived', bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
        // Found item
        unclaimed: { label: 'Unclaimed', bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
        under_review: { label: 'Under Review', bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
        claimed: { label: 'Claimed', bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
        // Claims
        ai_matched: { label: 'AI Matched', bg: 'rgba(6,182,212,0.15)', color: '#67e8f9', border: 'rgba(6,182,212,0.3)' },
        admin_review: { label: 'Admin Review', bg: 'rgba(167,139,250,0.15)', color: '#c4b5fd', border: 'rgba(167,139,250,0.3)' },
        approved: { label: 'Approved', bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
        rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
        withdrawn: { label: 'Withdrawn', bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
        completed: { label: 'Completed', bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
        // User
        active: { label: 'Active', bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
        restricted: { label: 'Restricted', bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
    }

    const s = map[status] || { label: status, bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' }

    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
            {s.label}
        </span>
    )
}

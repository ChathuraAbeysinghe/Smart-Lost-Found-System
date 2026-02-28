'use client';
import { useState, useEffect } from 'react';

/**
 * Custom hook encapsulating data-fetching logic for the User Dashboard.
 * Fetches lost items and claims for the authenticated user.
 * @param {object|null} user - The authenticated user object from AuthContext.
 * @returns {{ myLost: Array, myClaims: Array, loading: boolean }}
 */
export default function useDashboardData(user) {
    const [myLost, setMyLost] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        Promise.all([
            fetch('/api/lost-items', { credentials: 'include' }).then(r => r.json()),
            fetch('/api/claims', { credentials: 'include' }).then(r => r.json()),
        ]).then(([lost, claims]) => {
            setMyLost((lost.items || []).filter(i => i.postedBy === user.id));
            setMyClaims(claims.claims || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [user]);

    return { myLost, myClaims, loading };
}

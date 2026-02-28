import StatusStepper from '@/components/user-dashboard/StatusStepper';

/**
 * Wrapper component for the Active Claim Status section.
 * Handles conditional rendering and prop preparation for StatusStepper.
 * @param {{ latestClaim: object|null }} props
 */
export default function ActiveClaimSection({ latestClaim }) {
    if (!latestClaim) return null;

    const claimStatus = latestClaim.status || 'submitted';

    return (
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatusStepper
                currentStatus={claimStatus}
                claimId={latestClaim._id?.substring(0, 8)}
                itemName={latestClaim.lostItemId?.title || 'Unknown Item'}
                lastSeen={latestClaim.lostItemId?.location || 'Unknown Location'}
                statusDates={{
                    submitted: new Date(latestClaim.createdAt).toLocaleDateString()
                }}
            />
        </section>
    );
}

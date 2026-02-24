import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminName: { type: String, default: 'System' },
    action: { type: String, required: true }, // e.g. 'APPROVE_CLAIM', 'WARN_USER', 'RESTRICT_USER'
    targetType: { type: String, required: true }, // 'ClaimRequest' | 'User' | 'LostItem' | 'FoundItem'
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
}, { timestamps: true })

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
export default AuditLog

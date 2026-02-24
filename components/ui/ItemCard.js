'use client'
import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { MapPin, Calendar, Tag, Eye, Package } from 'lucide-react'

export default function ItemCard({ item, type = 'lost' }) {
    const href = `/${type === 'lost' ? 'lost-items' : 'found-items'}/${item._id}`
    const dateLabel = type === 'lost' ? 'Date Lost' : 'Date Found'
    const dateVal = type === 'lost' ? item.dateLost : item.dateFound
    const locationVal = type === 'lost' ? item.possibleLocation : item.locationFound
    const imageUrl = type === 'lost' ? item.imageUrl : item.photoUrl

    return (
        <Link href={href}>
            <div className="glass-card-hover rounded-2xl overflow-hidden group cursor-pointer h-full flex flex-col">
                {/* Image */}
                <div className="relative h-44 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.1) 100%)' }}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <Package size={40} className="text-white/20" />
                            <span className="text-white/30 text-xs">{item.category}</span>
                        </div>
                    )}
                    <div className="absolute top-3 right-3">
                        <StatusBadge status={item.status} />
                    </div>
                    <div className="absolute top-3 left-3">
                        <span className="badge text-xs"
                            style={{
                                background: type === 'lost' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                                color: type === 'lost' ? '#fca5a5' : '#6ee7b7',
                                border: `1px solid ${type === 'lost' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
                            }}>
                            {type === 'lost' ? '🔍 Lost' : '📦 Found'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                        <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                        <p className="text-white/50 text-xs mt-1 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 text-xs text-white/50">
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate">{locationVal || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                            <Calendar size={11} className="shrink-0" />
                            <span>{dateVal ? new Date(dateVal).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                        </div>
                        {item.category && (
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <Tag size={11} className="shrink-0" />
                                <span>{item.category}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-white/30 text-xs flex items-center gap-1">
                            <Eye size={10} /> {item.views || 0}
                        </span>
                        <span className="text-indigo-400 text-xs font-medium group-hover:text-indigo-300 transition-colors">
                            View Details →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

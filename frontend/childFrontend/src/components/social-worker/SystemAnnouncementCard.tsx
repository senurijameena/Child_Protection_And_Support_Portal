import { Card, Badge } from 'react-bootstrap'
import type { AnnouncementDTO } from '../../types/dashboard'

const getTypeBadgeVariant = (type: string) => {
    switch (type) {
        case 'MAINTENANCE': return 'warning'
        case 'FEATURE': return 'info'
        case 'WORKSHOP': return 'primary'
        case 'GENERAL': return 'secondary'
        default: return 'secondary'
    }
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'MAINTENANCE': return '🔧'
        case 'FEATURE': return '✨'
        case 'WORKSHOP': return '🎓'
        case 'GENERAL': return '📢'
        default: return '📢'
    }
}

export function SystemAnnouncementCard({ announcements }: { announcements: AnnouncementDTO[] }) {
    if (!announcements || announcements.length === 0) return null

    return (
        <Card className="sw-card border-0 mb-4 shadow-sm announcement-card-animation">
            <Card.Header className="bg-white border-0 pt-4 pb-2 d-flex align-items-center gap-2">
                <span style={{ fontSize: '1.5rem' }}>📢</span>
                <h5 className="mb-0 fw-700">System Announcements</h5>
            </Card.Header>
            <Card.Body className="pt-0">
                <div className="d-flex flex-column gap-3">
                    {announcements.map((ann) => (
                        <div
                            key={ann.id}
                            className="p-3 rounded-3 border border-light bg-opacity-25 transition-all hover-lift"
                            style={{ backgroundColor: 'var(--sw-bg-light, #f8f9fa)' }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontSize: '1.2rem' }}>{ann.icon || getTypeIcon(ann.type)}</span>
                                    <h6 className="mb-0 fw-bold text-dark">{ann.title}</h6>
                                </div>
                                <Badge bg={getTypeBadgeVariant(ann.type)} className="fw-normal">
                                    {ann.type}
                                </Badge>
                            </div>
                            <p className="mb-2 small text-secondary" style={{ lineHeight: '1.5' }}>
                                {ann.message}
                            </p>
                            <div className="d-flex justify-content-end">
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : ''}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    )
}

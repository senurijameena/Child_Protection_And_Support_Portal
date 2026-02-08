import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Badge, Spinner } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import { getOffersByWorker } from '../../services/socialWorkerApi'
import type { ServiceOfferDTO } from '../../types/dashboard'
import { HELP_TYPE_LABELS } from '../../types/dashboard'

const OFFER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export function SocialWorkerPackagesPage() {
  const { user } = useAuth()
  const userId = user?.userId ?? ''
  const [offers, setOffers] = useState<ServiceOfferDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    getOffersByWorker(userId)
      .then(setOffers)
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: '#2d6a4f' }} />
      </div>
    )
  }

  const pending = offers.filter((o) => o.status === 'PENDING')
  const accepted = offers.filter((o) => o.status === 'ACCEPTED')
  const rejected = offers.filter((o) => o.status === 'REJECTED')
  const completed = offers.filter((o) => o.status === 'COMPLETED')

  const statCards = [
    { title: 'Pending', value: pending.length, color: '#f59e0b' },
    { title: 'Accepted', value: accepted.length, color: '#2d6a4f' },
    { title: 'Rejected', value: rejected.length, color: '#6b7280' },
    { title: 'Completed', value: completed.length, color: '#10b981' },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Service Packages</h1>
        <p className="text-muted mb-0">
          Create and offer service packages to users. Track acceptance and rejection status.
        </p>
      </div>

      <Row className="g-3 mb-4">
        {statCards.map((card) => (
          <Col key={card.title} xs={6} md={3}>
            <Card className="border-0 shadow-sm rounded-3 sw-stat-card">
              <Card.Body className="text-center">
                <div className="fw-bold fs-3" style={{ color: card.color }}>{card.value}</div>
                <div className="text-muted small">{card.title}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3">
          <h5 className="mb-0">Your Service Offers</h5>
        </Card.Header>
        <Card.Body>
          {offers.length === 0 ? (
            <div className="p-5 text-muted text-center">
              No service offers yet. Create offers from the request details page when working on assigned requests.
            </div>
          ) : (
            <div className="row g-3">
              {offers.map((o) => (
                <Col key={o.id} xs={12} md={6} lg={4}>
                  <Card className="border-0 shadow-sm h-100 sw-stat-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge
                          bg={
                            o.status === 'PENDING'
                              ? 'warning'
                              : o.status === 'ACCEPTED'
                                ? 'success'
                                : o.status === 'REJECTED'
                                  ? 'secondary'
                                  : 'info'
                          }
                        >
                          {OFFER_STATUS_LABELS[o.status || 'PENDING']}
                        </Badge>
                        <span className="small text-muted">
                          {o.offerDate ? new Date(o.offerDate).toLocaleDateString() : '-'}
                        </span>
                      </div>
                      <div className="small text-muted mb-1">
                        {HELP_TYPE_LABELS[(o.serviceType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}
                      </div>
                      <p className="small mb-2">{o.serviceDetails?.slice(0, 80)}{(o.serviceDetails?.length || 0) > 80 ? '...' : ''}</p>
                      {o.helpRequestId && (
                        <Link
                          to={`/social-worker/requests/${o.helpRequestId}`}
                          className="small text-decoration-none"
                          style={{ color: '#2d6a4f' }}
                        >
                          View Request →
                        </Link>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

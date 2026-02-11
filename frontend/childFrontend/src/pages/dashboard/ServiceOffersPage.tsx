import { useEffect, useState } from 'react'
import { Card, Spinner, Button, Form, Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getMyRequests, acceptAppliedPackage, rejectAppliedPackage } from '../../services/dashboardApi'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import type { HelpRequestDTO, ServicePackageDTO, AppliedPackageStatus } from '../../types/dashboard'

/** Applied package from a help request, used for display as an "offer" */
type AppliedPackageOffer = {
  requestId: string
  requestTrackingId?: string
  pkg: ServicePackageDTO
  status: AppliedPackageStatus
  appliedAt?: string
  helpType?: string
}

function mapRequestsToOffers(requests: HelpRequestDTO[]): AppliedPackageOffer[] {
  return requests
    .filter((r) => r.appliedPackage != null)
    .map((r) => ({
      requestId: r.id,
      requestTrackingId: r.trackingId,
      pkg: r.appliedPackage!,
      status: (r.appliedPackageStatus ?? 'PENDING') as AppliedPackageStatus,
      appliedAt: r.appliedPackageAppliedAt,
      helpType: r.helpType,
    }))
}

export function ServiceOffersPage() {
  const { user } = useAuth()
  const [offers, setOffers] = useState<AppliedPackageOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null)
  const [rejectMessage, setRejectMessage] = useState('')
  const [rejectError, setRejectError] = useState<string | null>(null)

  const load = () => {
    if (!user?.userId) return
    getMyRequests()
      .then((requests) => setOffers(mapRequestsToOffers(requests)))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [user?.userId])

  const handleAccept = async (requestId: string) => {
    setResponding(requestId)
    try {
      await acceptAppliedPackage(requestId)
      setRejectRequestId(null)
      setRejectMessage('')
      load()
    } catch {
      // ignore
    } finally {
      setResponding(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setResponding(requestId)
    setRejectError(null)
    try {
      await rejectAppliedPackage(requestId, rejectMessage || undefined)
      setRejectRequestId(null)
      setRejectMessage('')
      load()
    } catch (err) {
      setRejectError(err instanceof Error ? err.message : 'Failed to reject. Please try again.')
    } finally {
      setResponding(null)
    }
  }

  const pending = offers.filter((o) => o.status === 'PENDING')
  const others = offers.filter((o) => o.status !== 'PENDING')

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="h4 fw-bold mb-4">Service Offers</h2>
      {pending.length > 0 && (
        <div className="mb-4">
          <h5 className="text-primary mb-3">Pending</h5>
          <div className="row g-3">
            {pending.map((o) => (
              <div key={o.requestId} className="col-md-6">
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body>
                    <p className="mb-1">
                      <strong>Package:</strong> {o.pkg.title}
                    </p>
                    <p className="mb-1">
                      <strong>Type:</strong>{' '}
                      {HELP_TYPE_LABELS[(o.helpType as keyof typeof HELP_TYPE_LABELS) || o.pkg.requestType] ?? o.pkg.requestType ?? 'Other'}
                    </p>
                    <p className="mb-1">
                      <strong>Offered:</strong>{' '}
                      {o.appliedAt ? new Date(o.appliedAt).toLocaleString() : '-'}
                    </p>
                    {o.pkg.description && (
                      <p className="mb-2 text-muted small">{o.pkg.description}</p>
                    )}
                    {o.pkg.items?.length > 0 && (
                      <p className="mb-2 small text-muted">
                        Services: {o.pkg.items.join(', ')}
                      </p>
                    )}
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="success"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => handleAccept(o.requestId)}
                        disabled={!!responding}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => setRejectRequestId(o.requestId)}
                      >
                        Reject
                      </Button>
                      <Link
                        to={`/dashboard/requests/${o.requestId}`}
                        className="btn btn-outline-primary btn-sm rounded-pill"
                      >
                        View request
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <div>
          <h5 className="text-secondary mb-3">Past Offers</h5>
          <div className="row g-3">
            {others.map((o) => (
              <div key={o.requestId} className="col-md-6">
                <Card className="border-0 shadow-sm rounded-4 h-100 border">
                  <Card.Body>
                    <p className="mb-1">
                      <strong>Package:</strong> {o.pkg.title}
                    </p>
                    <p className="mb-1">
                      <strong>Type:</strong>{' '}
                      {HELP_TYPE_LABELS[(o.helpType as keyof typeof HELP_TYPE_LABELS) || o.pkg.requestType] ?? o.pkg.requestType ?? 'Other'}
                    </p>
                    <p className="mb-1">
                      <strong>Status:</strong> <span className="badge bg-secondary">{o.status}</span>
                    </p>
                    <p className="mb-2 text-muted small">{o.pkg.description || '-'}</p>
                    <Link
                      to={`/dashboard/requests/${o.requestId}`}
                      className="btn btn-outline-primary btn-sm rounded-pill"
                    >
                      View request
                    </Link>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
      {offers.length === 0 && (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="text-center text-muted py-5">
            No service offers yet. Offers will appear here when a social worker proposes a package for one of your help requests.
          </Card.Body>
        </Card>
      )}

      <Modal show={!!rejectRequestId} onHide={() => { setRejectRequestId(null); setRejectError(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rejectError && <div className="alert alert-danger small mb-2">{rejectError}</div>}
          <Form.Label>Optional message (why you need modifications)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={rejectMessage}
            onChange={(e) => setRejectMessage(e.target.value)}
            placeholder="Describe what changes you need..."
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRejectRequestId(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => rejectRequestId && handleReject(rejectRequestId)}
            disabled={!!responding}
          >
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

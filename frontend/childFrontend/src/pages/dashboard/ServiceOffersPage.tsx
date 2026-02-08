import { useEffect, useState } from 'react'
import { Card, Spinner, Button, Form, Modal } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import { getOffersForUser, respondToOffer } from '../../services/dashboardApi'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import type { ServiceOfferDTO } from '../../types/dashboard'

export function ServiceOffersPage() {
  const { user } = useAuth()
  const [offers, setOffers] = useState<ServiceOfferDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)
  const [modalOffer, setModalOffer] = useState<ServiceOfferDTO | null>(null)
  const [rejectMessage, setRejectMessage] = useState('')

  const load = () => {
    if (!user?.userId) return
    getOffersForUser(user.userId)
      .then(setOffers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [user?.userId])

  const handleRespond = async (offerId: string, accepted: boolean) => {
    setResponding(offerId)
    try {
      await respondToOffer(offerId, accepted, rejectMessage || undefined)
      setModalOffer(null)
      setRejectMessage('')
      load()
    } catch {
      // ignore
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
              <div key={o.id} className="col-md-6">
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body>
                    <p className="mb-1">
                      <strong>Type:</strong>{' '}
                      {HELP_TYPE_LABELS[(o.serviceType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}
                    </p>
                    <p className="mb-1">
                      <strong>Offered:</strong>{' '}
                      {o.offerDate ? new Date(o.offerDate).toLocaleString() : '-'}
                    </p>
                    <p className="mb-3 text-muted">{o.serviceDetails || '-'}</p>
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => handleRespond(o.id, true)}
                        disabled={!!responding}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => setModalOffer(o)}
                      >
                        Reject
                      </Button>
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
              <div key={o.id} className="col-md-6">
                <Card className="border-0 shadow-sm rounded-4 h-100 border">
                  <Card.Body>
                    <p className="mb-1">
                      <strong>Type:</strong>{' '}
                      {HELP_TYPE_LABELS[(o.serviceType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}
                    </p>
                    <p className="mb-1">
                      <strong>Status:</strong> <span className="badge bg-secondary">{o.status}</span>
                    </p>
                    <p className="mb-0 text-muted">{o.serviceDetails || '-'}</p>
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
            No service offers yet. Offers will appear here when a social worker proposes a package.
          </Card.Body>
        </Card>
      )}

      <Modal show={!!modalOffer} onHide={() => setModalOffer(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
          <Button variant="secondary" onClick={() => setModalOffer(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => modalOffer && handleRespond(modalOffer.id, false)}
            disabled={!!responding}
          >
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

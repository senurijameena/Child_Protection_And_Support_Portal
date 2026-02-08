import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Badge, Spinner, Button, Modal, Form } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import {
  getTransfersByUser,
  getAvailableSocialWorkers,
  requestHelpRequestTransfer,
  cancelTransfer,
} from '../../services/socialWorkerApi'
import type { TransferRequestDTO } from '../../services/socialWorkerApi'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export function SocialWorkerTransfersPage() {
  const { user } = useAuth()
  const userId = user?.userId ?? ''
  const [transfers, setTransfers] = useState<TransferRequestDTO[]>([])
  const [workers, setWorkers] = useState<Array<{ id: string; userId: string; fullName: string }>>([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestId, setRequestId] = useState('')
  const [targetWorkerId, setTargetWorkerId] = useState('')
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      getTransfersByUser(userId),
      getAvailableSocialWorkers(),
    ])
      .then(([t, w]) => {
        setTransfers(Array.isArray(t) ? t : [])
        setWorkers(Array.isArray(w) ? w : [])
      })
      .catch(() => setTransfers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [userId])

  const handleRequestTransfer = async () => {
    if (!requestId.trim() || !targetWorkerId || !reason.trim()) {
      alert('Request ID, target worker, and reason are required')
      return
    }
    setActionLoading(true)
    try {
      await requestHelpRequestTransfer({
        helpRequestId: requestId.trim(),
        requestedAssigneeId: targetWorkerId,
        reason: reason.trim(),
      })
      setShowRequestModal(false)
      setRequestId('')
      setTargetWorkerId('')
      setReason('')
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to request transfer')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async (transferId: string) => {
    setActionLoading(true)
    try {
      await cancelTransfer(transferId)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to cancel')
    } finally {
      setActionLoading(false)
    }
  }

  const pending = transfers.filter((t) => t.status === 'PENDING')
  const approved = transfers.filter((t) => t.status === 'APPROVED')
  const rejected = transfers.filter((t) => t.status === 'REJECTED')

  const helpRequestTransfers = transfers.filter((t) => t.entityType === 'HELP_REQUEST')

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: '#2d6a4f' }} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Transfer Requests</h1>
          <p className="text-muted mb-0">
            Request transfer of a case to another social worker, or view status of pending transfers.
          </p>
        </div>
        <Button className="sw-btn-primary" onClick={() => { setShowRequestModal(true); setRequestId(''); setTargetWorkerId(''); setReason(''); }}>
          Request Transfer
        </Button>
      </div>

      <div className="d-flex gap-2 flex-wrap mb-4">
        <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#f59e0b' }}>
          Pending: {pending.length}
        </span>
        <span className="badge rounded-pill px-3 py-2 bg-success">Approved: {approved.length}</span>
        <span className="badge rounded-pill px-3 py-2 bg-secondary">Rejected: {rejected.length}</span>
      </div>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3">
          <h5 className="mb-0">My Transfer Requests</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {helpRequestTransfers.length === 0 ? (
            <div className="p-5 text-muted text-center">No transfer requests yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {helpRequestTransfers.map((t) => (
                    <tr key={t.id}>
                      <td>
                        {t.entityId && (
                          <Link to={`/social-worker/requests/${t.entityId}`} className="text-decoration-none" style={{ color: '#2d6a4f' }}>
                            {t.entityId.slice(0, 8)}
                          </Link>
                        )}
                      </td>
                      <td>
                        <Badge
                          bg={
                            t.status === 'PENDING' ? 'warning' :
                            t.status === 'APPROVED' ? 'success' : 'secondary'
                          }
                        >
                          {STATUS_LABELS[t.status || 'PENDING']}
                        </Badge>
                      </td>
                      <td className="small">{t.reason?.slice(0, 60)}{(t.reason?.length || 0) > 60 ? '...' : ''}</td>
                      <td className="text-muted small">
                        {t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        {t.status === 'PENDING' && (
                          <Button size="sm" variant="outline-danger" onClick={() => handleCancel(t.id)} disabled={actionLoading}>
                            Cancel
                          </Button>
                        )}
                        {t.entityId && t.status !== 'PENDING' && (
                          <Link to={`/social-worker/requests/${t.entityId}`} className="btn btn-sm btn-outline-secondary">
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            A mandatory reason will be sent to the admin. The request will be reassigned to another social worker upon approval.
          </p>
          <Form.Group className="mb-2">
            <Form.Label>Help Request ID</Form.Label>
            <Form.Control
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="Paste the request ID from the request details page"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Transfer To</Form.Label>
            <Form.Select value={targetWorkerId} onChange={(e) => setTargetWorkerId(e.target.value)}>
              <option value="">Select social worker...</option>
              {workers.filter((w) => w.userId !== userId).map((w) => (
                <option key={w.id} value={w.userId}>{w.fullName}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Reason (required)</Form.Label>
            <Form.Control as="textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this transfer is needed..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRequestModal(false)}>Cancel</Button>
          <Button
            className="sw-btn-primary"
            onClick={handleRequestTransfer}
            disabled={!requestId.trim() || !targetWorkerId || !reason.trim() || actionLoading}
          >
            {actionLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Card, Table, Badge, Button, Modal, Spinner } from 'react-bootstrap'
import {
  getPendingTransfers,
  approveTransfer,
  rejectTransfer,
} from '../../services/adminApi'
import type { TransferRequestDTO } from '../../types/admin'

export function TransferRequestManagementPage() {
  const [transfers, setTransfers] = useState<TransferRequestDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequestDTO | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadTransfers = () => {
    setLoading(true)
    getPendingTransfers()
      .then(setTransfers)
      .catch(() => setTransfers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTransfers()
  }, [])

  const handleApprove = async (transferId: string) => {
    setActionLoading(true)
    try {
      await approveTransfer(transferId)
      loadTransfers()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to approve')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedTransfer) return
    setActionLoading(true)
    try {
      await rejectTransfer(selectedTransfer.id, rejectReason || 'No reason provided')
      loadTransfers()
      setShowRejectModal(false)
      setSelectedTransfer(null)
      setRejectReason('')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to reject')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Transfer Requests</h1>
        <p className="text-muted mb-0">
          Approve or reject transfer requests from police and social workers
        </p>
      </div>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>Entity</th>
                <th>Type</th>
                <th>Current Assignee</th>
                <th>Requested To</th>
                <th>Reason</th>
                <th>Requested At</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No pending transfer requests
                  </td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <code className="small">{t.entityId?.slice(0, 12)}</code>
                    </td>
                    <td>
                      <Badge bg="info">{t.entityType}</Badge>
                    </td>
                    <td>{t.fromUserId?.slice(0, 8) || '-'}</td>
                    <td>{t.toUserId?.slice(0, 8) || '-'}</td>
                    <td className="text-muted" style={{ maxWidth: 200 }}>
                      {t.reason?.slice(0, 50) || '-'}
                      {t.reason && t.reason.length > 50 ? '...' : ''}
                    </td>
                    <td className="text-muted small">
                      {t.requestedAt
                        ? new Date(t.requestedAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleApprove(t.id)}
                        disabled={actionLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setSelectedTransfer(t)
                          setShowRejectModal(true)
                          setRejectReason('')
                        }}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransfer && (
            <div className="mb-3">
              <p className="text-muted small mb-2">
                Entity: {selectedTransfer.entityId} ({selectedTransfer.entityType})
              </p>
              <label className="form-label">Reason for rejection</label>
              <textarea
                className="form-control"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason..."
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={actionLoading}
          >
            {actionLoading ? 'Rejecting...' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

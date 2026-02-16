import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  acceptIncomingTransfer,
  cancelTransfer,
  getAssignedRequests,
  getAvailableSocialWorkers,
  getHelpRequest,
  getTransfersByUser,
  rejectIncomingTransfer,
  requestHelpRequestTransfer,
  type TransferRequestDTO,
} from '../../services/socialWorkerApi'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import type { HelpType } from '../../types/dashboard'
import './SocialWorkerDashboard.css'

type PageTab = 'pending' | 'active' | 'completed'
type PendingDirection = 'INCOMING' | 'OUTGOING'
type RejectReason = 'Workload high' | 'Not my district' | 'Not my specialization' | 'Other'

type TransferWithDirection = TransferRequestDTO & {
  direction: PendingDirection
}

type HelpPreview = {
  caseType?: string
  riskLevel?: string
  district?: string
  shortDescription?: string
  attachedNotes?: string
}

const REJECT_REASONS: RejectReason[] = ['Workload high', 'Not my district', 'Not my specialization', 'Other']

export function SocialWorkerTransfersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<PageTab>('pending')
  const [transfers, setTransfers] = useState<TransferRequestDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [availableSW, setAvailableSW] = useState<
    Array<{ userId: string; fullName: string; availabilityStatus?: string; specializations?: string[]; serviceArea?: string }>
  >([])
  const [assignedRequests, setAssignedRequests] = useState<
    { id: string; trackingId?: string; status?: string; helpType?: string; priority?: string }[]
  >([])
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [selectedSwUserId, setSelectedSwUserId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [transferSubmitting, setTransferSubmitting] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [selectedTransfer, setSelectedTransfer] = useState<TransferWithDirection | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectTransfer, setRejectTransfer] = useState<TransferWithDirection | null>(null)
  const [rejectReason, setRejectReason] = useState<RejectReason>('Workload high')
  const [otherRejectReason, setOtherRejectReason] = useState('')
  const [helpPreviewCache, setHelpPreviewCache] = useState<Record<string, HelpPreview>>({})
  const [trackingIdByRequestId, setTrackingIdByRequestId] = useState<Record<string, string>>({})

  const userId = user?.userId || ''

  /** Format help request ID for display: prefer HELP-0001 style, never show raw long UUID. */
  const formatHelpRequestDisplay = (id: string | undefined): string => {
    if (!id) return '—'
    if (/^HELP-\d+$/i.test(id)) return id
    if (id.length >= 32 && id.includes('-')) return `HELP-${id.slice(-4).toUpperCase()}`
    if (id.length > 12) return `HELP-${id.slice(-4).toUpperCase()}`
    return id
  }

  const swNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    availableSW.forEach((sw) => {
      if (sw.userId) {
        map[sw.userId] = sw.fullName || sw.userId
      }
    })
    return map
  }, [availableSW])

  const formatDate = (date?: string) => {
    if (!date) return '-'
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatRequestedDate = (date?: string) => {
    if (!date) return '-'
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return '-'
    const now = new Date()
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    return isToday ? 'Today' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  const loadBaseData = async (uid: string) => {
    setLoading(true)
    try {
      const [transferList, swList, assignedList] = await Promise.all([
        getTransfersByUser(uid),
        getAvailableSocialWorkers(),
        getAssignedRequests(uid),
      ])
      setTransfers(Array.isArray(transferList) ? transferList : [])
      setAvailableSW(Array.isArray(swList) ? swList : [])
      setAssignedRequests(Array.isArray(assignedList) ? assignedList : [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transfer data')
      setTransfers([])
      setAvailableSW([])
      setAssignedRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!userId) return
    loadBaseData(userId)
  }, [userId])

  const pendingTransfers = useMemo(
    () =>
      transfers
        .filter((t) => (t.status || '').toUpperCase() === 'PENDING')
        .map((t) => ({
          ...t,
          direction: (t.toUserId === userId ? 'INCOMING' : 'OUTGOING') as PendingDirection,
        })),
    [transfers, userId]
  )

  const incomingTransfers = useMemo(
    () => pendingTransfers.filter((t) => t.direction === 'INCOMING'),
    [pendingTransfers]
  )

  const outgoingTransfers = useMemo(
    () => pendingTransfers.filter((t) => t.direction === 'OUTGOING'),
    [pendingTransfers]
  )

  const activeTransfers = useMemo(
    () => transfers.filter((t) => ['ACTIVE', 'APPROVED'].includes((t.status || '').toUpperCase())),
    [transfers]
  )

  const completedTransfers = useMemo(
    () => transfers.filter((t) => ['REJECTED', 'CANCELLED'].includes((t.status || '').toUpperCase())),
    [transfers]
  )

  const assignedRequestTrackingMap = useMemo(() => {
    const m: Record<string, string> = {}
    assignedRequests.forEach((r) => {
      m[r.id] = r.trackingId || r.id
    })
    return m
  }, [assignedRequests])

  const getTransferLabel = (transfer: TransferRequestDTO): string => {
    const requestId = transfer.entityId || transfer.id
    const fromAssigned = assignedRequestTrackingMap[requestId]
    const fromCache = trackingIdByRequestId[requestId]
    const trackingId = fromAssigned || fromCache
    if (trackingId) return trackingId
    return formatHelpRequestDisplay(requestId)
  }

  useEffect(() => {
    if (!transfers.length) return
    const entityIds = [...new Set(transfers.map((t) => t.entityId).filter(Boolean) as string[])]
    const toFetch = entityIds.filter((eid) => !assignedRequestTrackingMap[eid])
    if (toFetch.length === 0) return
    let cancelled = false
    Promise.all(
      toFetch.map((eid) =>
        getHelpRequest(eid).then((req) => ({ eid, trackingId: req.trackingId || req.id }))
      )
    )
      .then((results) => {
        if (cancelled) return
        setTrackingIdByRequestId((prev) => {
          const next = { ...prev }
          results.forEach(({ eid, trackingId }) => {
            next[eid] = trackingId
          })
          return next
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [transfers, assignedRequestTrackingMap])

  const getPreview = async (transfer: TransferRequestDTO): Promise<HelpPreview> => {
    const key = transfer.entityId || ''
    if (!key) return {}
    if (helpPreviewCache[key]) return helpPreviewCache[key]

    try {
      const req = await getHelpRequest(key)
      const preview: HelpPreview = {
        caseType: req.helpType || '-',
        riskLevel: req.priority || '-',
        district: req.location || '-',
        shortDescription: req.description || '-',
        attachedNotes: req.requestNotes || '-',
      }
      setHelpPreviewCache((prev) => ({ ...prev, [key]: preview }))
      return preview
    } catch {
      return {}
    }
  }

  const openPreview = async (transfer: TransferWithDirection) => {
    await getPreview(transfer)
    setSelectedTransfer(transfer)
    setShowPreviewModal(true)
  }

  const doAccept = async (transfer: TransferWithDirection) => {
    setActionLoadingId(transfer.id)
    setError(null)
    try {
      await acceptIncomingTransfer(transfer.id)
      if (userId) await loadBaseData(userId)
      if (selectedTransfer?.id === transfer.id) setShowPreviewModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept transfer')
    } finally {
      setActionLoadingId(null)
    }
  }

  const openReject = (transfer: TransferWithDirection) => {
    setRejectTransfer(transfer)
    setRejectReason('Workload high')
    setOtherRejectReason('')
    setShowRejectModal(true)
  }

  const submitReject = async () => {
    if (!rejectTransfer) return
    const reason = rejectReason === 'Other' ? otherRejectReason.trim() : rejectReason
    if (!reason) return
    setActionLoadingId(rejectTransfer.id)
    setError(null)
    try {
      await rejectIncomingTransfer(rejectTransfer.id, reason)
      if (userId) await loadBaseData(userId)
      setShowRejectModal(false)
      if (selectedTransfer?.id === rejectTransfer.id) setShowPreviewModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject transfer')
    } finally {
      setActionLoadingId(null)
    }
  }

  const doCancel = async (transfer: TransferWithDirection) => {
    setActionLoadingId(transfer.id)
    setError(null)
    try {
      await cancelTransfer(transfer.id)
      if (userId) await loadBaseData(userId)
      if (selectedTransfer?.id === transfer.id) setShowPreviewModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel transfer')
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredAssignedRequests = useMemo(
    () => assignedRequests.filter((req) => (req.status || '').toUpperCase() !== 'COMPLETED'),
    [assignedRequests]
  )

  const availableAndRelevantSW = useMemo(
    () => availableSW.filter((sw) => (sw.availabilityStatus || '').toUpperCase() !== 'UNAVAILABLE'),
    [availableSW]
  )

  const resetCreateForm = () => {
    setSelectedRequestId('')
    setSelectedSwUserId('')
    setTransferReason('')
    setTransferError(null)
  }

  const handleSubmitTransfer = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (!selectedRequestId || !selectedSwUserId || !transferReason.trim()) {
      setTransferError('Please select a request, social worker, and provide a reason.')
      return
    }
    setTransferSubmitting(true)
    setTransferError(null)
    try {
      await requestHelpRequestTransfer({
        helpRequestId: selectedRequestId,
        requestedAssigneeId: selectedSwUserId,
        reason: transferReason.trim(),
      })
      if (userId) await loadBaseData(userId)
      setShowCreateModal(false)
      resetCreateForm()
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : 'Failed to submit transfer request')
    } finally {
      setTransferSubmitting(false)
    }
  }

  const pendingPreview = selectedTransfer?.entityId ? helpPreviewCache[selectedTransfer.entityId] : undefined

  return (
    <Container fluid className="py-4 sw-dashboard">
      {/* Header */}
      <Row className="mb-4">
        <Col xs={12}>
          <div 
            className="p-4 rounded-3 shadow-sm position-relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: 'white'
            }}
          >
            {/* Decorative pattern */}
            <div 
              style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 position-relative">
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>🔄</span>
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1">Transfer Requests</h1>
                  <p className="mb-0" style={{ opacity: 0.95, fontSize: '0.95rem' }}>
                    Manage incoming and outgoing transfer requests
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="btn-light d-flex align-items-center gap-2"
                style={{
                  fontWeight: '600',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>➕</span> Create Transfer
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col xs={12}>
            <div 
              className="p-3 rounded-3"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '2px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <strong>⚠️ Error:</strong> {error}
            </div>
          </Col>
        </Row>
      )}

      <Row>
        <Col xs={12}>
          <div 
            className="p-3 rounded-3 shadow-sm mb-3"
            style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
          >
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn text-decoration-none px-4 py-2 rounded-pill fw-600 d-flex align-items-center gap-2`}
                onClick={() => setActiveTab('pending')}
                style={{
                  background: activeTab === 'pending' 
                    ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' 
                    : 'rgba(255, 255, 255, 0.6)',
                  color: activeTab === 'pending' ? 'white' : '#2563eb',
                  border: `2px solid ${activeTab === 'pending' ? '#2563eb' : 'rgba(59, 130, 246, 0.2)'}`,
                  boxShadow: activeTab === 'pending' ? '0 4px 6px rgba(59, 130, 246, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>⏳</span> Pending
                {incomingTransfers.length > 0 && (
                  <Badge
                    pill
                    className="ms-1"
                    style={{ 
                      backgroundColor: activeTab === 'pending' ? 'rgba(255, 255, 255, 0.3)' : '#2563eb',
                      fontSize: '0.65rem',
                      padding: '0.25rem 0.5rem'
                    }}
                  >
                    {incomingTransfers.length}
                  </Badge>
                )}
              </button>
              <button
                type="button"
                className={`btn text-decoration-none px-4 py-2 rounded-pill fw-600 d-flex align-items-center gap-2`}
                onClick={() => setActiveTab('active')}
                style={{
                  background: activeTab === 'active' 
                    ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' 
                    : 'rgba(255, 255, 255, 0.6)',
                  color: activeTab === 'active' ? 'white' : '#2563eb',
                  border: `2px solid ${activeTab === 'active' ? '#2563eb' : 'rgba(59, 130, 246, 0.2)'}`,
                  boxShadow: activeTab === 'active' ? '0 4px 6px rgba(59, 130, 246, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>✅</span> Active
              </button>
              <button
                type="button"
                className={`btn text-decoration-none px-4 py-2 rounded-pill fw-600 d-flex align-items-center gap-2`}
                onClick={() => setActiveTab('completed')}
                style={{
                  background: activeTab === 'completed' 
                    ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' 
                    : 'rgba(255, 255, 255, 0.6)',
                  color: activeTab === 'completed' ? 'white' : '#2563eb',
                  border: `2px solid ${activeTab === 'completed' ? '#2563eb' : 'rgba(59, 130, 246, 0.2)'}`,
                  boxShadow: activeTab === 'completed' ? '0 4px 6px rgba(59, 130, 246, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>📋</span> Completed
              </button>
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">

              <div className="p-4">
                {loading ? (
                  <div 
                    className="text-center py-5 rounded-3"
                    style={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '2px solid rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    <Spinner animation="border" style={{ color: '#2563eb' }} />
                    <p className="mt-3 mb-0 fw-semibold" style={{ color: '#2563eb' }}>Loading transfer data...</p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'pending' && (
                      <>
                        <div 
                          className="p-3 rounded-3 mb-4"
                          style={{ 
                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            border: '2px solid rgba(59, 130, 246, 0.2)'
                          }}
                        >
                          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: '#2563eb' }}>
                            <span style={{ fontSize: '1.5rem' }}>📥</span> Incoming Requests
                          </h5>
                        </div>
                        {incomingTransfers.length === 0 ? (
                          <div 
                            className="p-4 text-center rounded-3 mb-4"
                            style={{ 
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              border: '2px dashed rgba(59, 130, 246, 0.3)'
                            }}
                          >
                            <span style={{ fontSize: '3rem' }}>📭</span>
                            <p className="mt-3 mb-0 fw-semibold" style={{ color: '#2563eb' }}>
                              No incoming transfer requests
                            </p>
                          </div>
                        ) : (
                          <div className="table-responsive mb-4">
                            <Table hover className="align-middle">
                              <thead>
                                <tr 
                                  style={{ 
                                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                    color: 'white'
                                  }}
                                >
                                  <th className="fw-600 small py-3" style={{ color: 'white' }}>📋 Request ID</th>
                                  <th className="fw-600 small py-3" style={{ color: 'white' }}>👤 From SW</th>
                                  <th className="fw-600 small py-3" style={{ color: 'white' }}>💬 Reason</th>
                                  <th className="fw-600 small py-3" style={{ color: 'white' }}>⚡ Priority</th>
                                  <th className="fw-600 small py-3" style={{ color: 'white' }}>📅 Date</th>
                                  <th className="fw-600 small py-3 text-end" style={{ color: 'white' }}>⚙️ Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {incomingTransfers.map((t, index) => (
                                  <tr 
                                    key={t.id}
                                    style={{ 
                                      backgroundColor: index % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'white',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                                      e.currentTarget.style.transform = 'scale(1.01)';
                                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'white';
                                      e.currentTarget.style.transform = 'scale(1)';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  >
                                    <td className="py-3">
                                      <span className="fw-bold" style={{ color: '#2563eb' }}>
                                        {getTransferLabel(t)}
                                      </span>
                                    </td>
                                    <td className="py-3">
                                      <span className="fw-semibold small" style={{ color: '#2563eb' }}>
                                        {swNameMap[t.fromUserId || ''] || t.fromUserId || '-'}
                                      </span>
                                    </td>
                                    <td className="py-3">
                                      <span className="small" style={{ color: '#2563eb' }}>
                                        {t.reason || '-'}
                                      </span>
                                    </td>
                                    <td className="py-3">
                                      <Badge 
                                        className="rounded-pill"
                                        style={{
                                          backgroundColor: '#2563eb',
                                          fontSize: '0.75rem',
                                          padding: '0.4rem 0.8rem'
                                        }}
                                      >
                                        {helpPreviewCache[t.entityId || '']?.riskLevel || '-'}
                                      </Badge>
                                    </td>
                                    <td className="py-3">
                                      <span className="small fw-semibold" style={{ color: '#2563eb' }}>
                                        {formatRequestedDate(t.requestedAt)}
                                      </span>
                                    </td>
                                    <td className="py-3 text-end">
                                      <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                                        <Button
                                          size="sm"
                                          onClick={() => openPreview(t)}
                                          style={{
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            color: '#2563eb',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            fontWeight: '600',
                                            fontSize: '0.8rem'
                                          }}
                                        >
                                          👁️ View
                                        </Button>
                                        <Button
                                          size="sm"
                                          disabled={actionLoadingId === t.id}
                                          onClick={() => doAccept(t)}
                                          style={{
                                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                            color: 'white',
                                            border: 'none',
                                            fontWeight: '600',
                                            fontSize: '0.8rem'
                                          }}
                                        >
                                          ✅ Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          disabled={actionLoadingId === t.id}
                                          onClick={() => openReject(t)}
                                          style={{
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            color: '#2563eb',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            fontWeight: '600',
                                            fontSize: '0.8rem'
                                          }}
                                        >
                                          ❌ Reject
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}

                        <div 
                          className="p-3 rounded-3 mb-4"
                          style={{ 
                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            border: '2px solid rgba(59, 130, 246, 0.2)'
                          }}
                        >
                          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: '#2563eb' }}>
                            <span style={{ fontSize: '1.5rem' }}>📤</span> Outgoing Requests
                          </h5>
                        </div>
                        {outgoingTransfers.length === 0 ? (
                          <div 
                            className="p-4 text-center rounded-3"
                            style={{ 
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              border: '2px dashed rgba(59, 130, 246, 0.3)'
                            }}
                          >
                            <span style={{ fontSize: '3rem' }}>📭</span>
                            <p className="mt-3 mb-0 fw-semibold" style={{ color: '#2563eb' }}>
                              No outgoing transfer requests
                            </p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <Table hover className="align-middle mb-0">
                              <thead>
                                <tr 
                                  style={{ 
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
                                    color: 'white'
                                  }}
                                >
                                  <th className="fw-600 small py-3" style={{ color: 'white' }}>📋 Request ID</th>
                                  <th className="fw-600 small py-3" style={{ color: 'white' }}>👤 To SW</th>
                                  <th className="fw-600 small py-3" style={{ color: 'white' }}>💬 Reason</th>
                                  <th className="fw-600 small py-3" style={{ color: 'white' }}>✓ Status</th>
                                  <th className="fw-600 small py-3" style={{ color: 'white' }}>📅 Date</th>
                                  <th className="fw-600 small py-3 text-end" style={{ color: 'white' }}>⚙️ Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {outgoingTransfers.map((t) => (
                                  <tr key={t.id}>
                                    <td>{getTransferLabel(t)}</td>
                                    <td>{swNameMap[t.toUserId || ''] || t.toUserId || '-'}</td>
                                    <td>{t.reason || '-'}</td>
                                    <td>
                                      <Badge bg="warning" text="dark">
                                        Waiting Admin
                                      </Badge>
                                    </td>
                                    <td>{formatRequestedDate(t.requestedAt)}</td>
                                    <td className="text-end">
                                      <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                                        <Button
                                          size="sm"
                                          variant="outline-primary"
                                          onClick={() => openPreview(t)}
                                        >
                                          View
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline-secondary"
                                          disabled={actionLoadingId === t.id}
                                          onClick={() => doCancel(t)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'active' && (
                      <>
                        <div className="alert alert-info border-0 mb-4 small">
                          <strong>Already accepted.</strong> These transfer requests are active. You can now:
                          <ul className="mb-0 mt-2 ps-3">
                            <li>Message Public User (if not anonymous)</li>
                            <li>Apply Service Packages</li>
                            <li>Assign Resources</li>
                            <li>Add Follow-ups</li>
                            <li>Collaborate with other SWs</li>
                            <li>Upload Documents</li>
                            <li>Case timeline updated live</li>
                          </ul>
                        </div>
                        <div className="table-responsive">
                          <Table hover className="align-middle mb-0">
                            <thead className="bg-light">
                              <tr>
                                <th>Request ID</th>
                                <th>From SW</th>
                                <th>To SW</th>
                                <th>Status</th>
                                <th>Requested Date</th>
                                <th className="text-end">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeTransfers.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="text-center text-muted py-4">
                                    No active transfers.
                                  </td>
                                </tr>
                              ) : (
                                activeTransfers.map((t) => (
                                  <tr key={t.id}>
                                    <td>{getTransferLabel(t)}</td>
                                    <td>{swNameMap[t.fromUserId || ''] || t.fromUserId || '-'}</td>
                                    <td>{swNameMap[t.toUserId || ''] || t.toUserId || '-'}</td>
                                    <td>
                                      <Badge bg="primary">{(t.status || 'ACTIVE').toUpperCase()}</Badge>
                                    </td>
                                    <td>{formatDate(t.requestedAt)}</td>
                                    <td className="text-end">
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => t.entityId && navigate(`/social-worker/requests/${t.entityId}`)}
                                        disabled={!t.entityId}
                                      >
                                        View
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </>
                    )}

                    {activeTab === 'completed' && (
                      <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th>Request ID</th>
                              <th>From SW</th>
                              <th>To SW</th>
                              <th>Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {completedTransfers.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center text-muted py-4">
                                  No completed transfers.
                                </td>
                              </tr>
                            ) : (
                              completedTransfers.map((t) => (
                                <tr key={t.id}>
                                  <td>{getTransferLabel(t)}</td>
                                  <td>{swNameMap[t.fromUserId || ''] || t.fromUserId || '-'}</td>
                                  <td>{swNameMap[t.toUserId || ''] || t.toUserId || '-'}</td>
                                  <td>
                                    <Badge bg={(t.status || '').toUpperCase() === 'REJECTED' ? 'danger' : 'secondary'}>
                                      {(t.status || '-').toUpperCase()}
                                    </Badge>
                                  </td>
                                  <td>{formatDate(t.requestedAt)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); resetCreateForm() }} centered size="lg">
        <Form onSubmit={handleSubmitTransfer}>
          <Modal.Header closeButton>
            <Modal.Title>Create Transfer Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Label className="fw-600 d-flex align-items-center gap-2">
                  <span className="rounded px-2 py-1 small text-white" style={{ backgroundColor: 'var(--bs-primary)' }}>1</span>
                  Select Assigned Request
                </Form.Label>
                {filteredAssignedRequests.length === 0 ? (
                  <p className="text-muted small mb-0">No assignable requests. Complete or transfer existing ones first.</p>
                ) : (
                  <div className="rounded border border-primary border-2 overflow-hidden" style={{ maxHeight: 220 }}>
                    <div className="table-responsive" style={{ maxHeight: 220, overflowY: 'auto' }}>
                      <Table hover size="sm" className="align-middle mb-0 table-request-transfer">
                        <thead className="table-primary sticky-top">
                          <tr>
                            <th>Request ID</th>
                            <th>Category</th>
                            <th className="text-end">Select</th>
                          </tr>
                        </thead>
                      <tbody>
                        {filteredAssignedRequests.map((req) => {
                          const isSelected = selectedRequestId === req.id
                          const requestIdDisplay = req.trackingId ? req.trackingId : formatHelpRequestDisplay(req.id)
                          const categoryLabel = req.helpType ? (HELP_TYPE_LABELS[req.helpType as HelpType] ?? req.helpType) : 'Other'
                          return (
                            <tr
                              key={req.id}
                              className={isSelected ? 'table-primary' : undefined}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedRequestId(isSelected ? '' : req.id)}
                            >
                              <td className="fw-600">{requestIdDisplay}</td>
                              <td>{categoryLabel}</td>
                              <td className="text-end">
                                <Button
                                  size="sm"
                                  variant={isSelected ? 'primary' : 'outline-primary'}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedRequestId(isSelected ? '' : req.id)
                                  }}
                                >
                                  {isSelected ? 'Selected' : 'Select'}
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      </Table>
                    </div>
                  </div>
                )}
              </Col>
              <Col xs={12}>
                <Form.Label className="fw-600 d-flex align-items-center gap-2">
                  <span className="rounded px-2 py-1 small text-white bg-success">2</span>
                  Transfer To
                </Form.Label>
                {availableAndRelevantSW.length === 0 ? (
                  <p className="text-muted small mb-0">No available social workers to transfer to.</p>
                ) : (
                  <div className="rounded border border-success border-2 overflow-hidden" style={{ maxHeight: 220 }}>
                    <div className="table-responsive" style={{ maxHeight: 220, overflowY: 'auto' }}>
                      <Table hover size="sm" className="align-middle mb-0 table-sw-transfer">
                        <thead className="table-success sticky-top">
                          <tr>
                            <th>Name</th>
                            <th>Availability</th>
                            <th>Specialization</th>
                            <th className="text-end">Select</th>
                          </tr>
                        </thead>
                      <tbody>
                        {availableAndRelevantSW.map((sw) => {
                          const isSelected = selectedSwUserId === sw.userId
                          const avail = (sw.availabilityStatus || '').toUpperCase()
                          const availabilityLabel =
                            avail === 'ACTIVE' || avail === 'AVAILABLE' ? 'Available' :
                            avail === 'BUSY' || avail === 'LIMITED' ? 'Busy' :
                            avail === 'ON_LEAVE' || avail === 'UNAVAILABLE' ? 'On Leave' : avail || '—'
                          const specs = sw.specializations?.length
                            ? sw.specializations.join(', ')
                            : '—'
                          return (
                            <tr
                              key={sw.userId}
                              className={isSelected ? 'table-primary' : undefined}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedSwUserId(isSelected ? '' : sw.userId)}
                            >
                              <td className="fw-600">{sw.fullName || sw.userId}</td>
                              <td>{availabilityLabel}</td>
                              <td className="small">{specs}</td>
                              <td className="text-end">
                                <Button
                                  size="sm"
                                  variant={isSelected ? 'primary' : 'outline-primary'}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedSwUserId(isSelected ? '' : sw.userId)
                                  }}
                                >
                                  {isSelected ? 'Selected' : 'Select'}
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
            <Form.Group className="mt-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="Explain why this transfer is needed..."
              />
            </Form.Group>
            {transferError && <div className="alert alert-danger mt-3 mb-0">{transferError}</div>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => { setShowCreateModal(false); resetCreateForm() }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={transferSubmitting}>
              {transferSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Transfer Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransfer && (
            <>
              <div className="mb-3">
                <div className="small text-muted">Request ID</div>
                <div className="fw-semibold">{getTransferLabel(selectedTransfer)}</div>
              </div>
              <Row className="g-3 mb-2">
                <Col md={6}>
                  <div className="small text-muted">Case type</div>
                  <div>{pendingPreview?.caseType || '-'}</div>
                </Col>
                <Col md={6}>
                  <div className="small text-muted">Risk level</div>
                  <div>{pendingPreview?.riskLevel || '-'}</div>
                </Col>
                <Col md={6}>
                  <div className="small text-muted">District</div>
                  <div>{pendingPreview?.district || '-'}</div>
                </Col>
                <Col md={6}>
                  <div className="small text-muted">Requested Date</div>
                  <div>{formatDate(selectedTransfer.requestedAt)}</div>
                </Col>
                <Col xs={12}>
                  <div className="small text-muted">Short description</div>
                  <div>{pendingPreview?.shortDescription || '-'}</div>
                </Col>
                <Col xs={12}>
                  <div className="small text-muted">Attached notes</div>
                  <div>{pendingPreview?.attachedNotes || '-'}</div>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
          {selectedTransfer?.direction === 'INCOMING' && (
            <>
              <Button
                variant="outline-danger"
                onClick={() => {
                  setShowPreviewModal(false)
                  openReject(selectedTransfer)
                }}
              >
                Reject
              </Button>
              <Button
                variant="success"
                disabled={actionLoadingId === selectedTransfer.id}
                onClick={() => doAccept(selectedTransfer)}
              >
                Accept
              </Button>
            </>
          )}
          {selectedTransfer?.direction === 'OUTGOING' && (
            <Button
              variant="outline-secondary"
              disabled={actionLoadingId === selectedTransfer.id}
              onClick={() => doCancel(selectedTransfer)}
            >
              Cancel
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Select reason</Form.Label>
            <Form.Select value={rejectReason} onChange={(e) => setRejectReason(e.target.value as RejectReason)}>
              {REJECT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {rejectReason === 'Other' && (
            <Form.Group>
              <Form.Label>Other reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={otherRejectReason}
                onChange={(e) => setOtherRejectReason(e.target.value)}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={submitReject}
            disabled={rejectReason === 'Other' && !otherRejectReason.trim()}
          >
            Submit Rejection
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

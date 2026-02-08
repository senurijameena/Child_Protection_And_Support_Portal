import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Card,
  Badge,
  Spinner,
  ListGroup,
  Button,
  Form,
  Modal,
  Tab,
  Tabs,
} from 'react-bootstrap'
import {
  getCase,
  getCaseTimeline,
  updateCaseStatus,
  addCaseNote,
  uploadCaseEvidence,
  requestCaseTransfer,
  acceptCase,
} from '../../services/policeApi'
import { getAllPoliceStations } from '../../services/policeApi'
import type { CaseDTO } from '../../types/dashboard'
import { CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '../../types/dashboard'

const STATUS_FLOW = [
  { value: 'ASSIGNED', label: 'Received' },
  { value: 'INVESTIGATING', label: 'Investigation Started' },
  { value: 'RESOLVED', label: 'Action Taken' },
  { value: 'CLOSED', label: 'Closed' },
]

export function PoliceCaseDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const [c, setC] = useState<CaseDTO | null>(null)
  const [timeline, setTimeline] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [noteSubmitting, setNoteSubmitting] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferStationId, setTransferStationId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [stations, setStations] = useState<Array<{ id: string; stationName?: string; district?: string }>>([])
  const [uploading, setUploading] = useState(false)
  const [showClosureModal, setShowClosureModal] = useState(false)
  const [closureSummary, setClosureSummary] = useState('')

  const loadData = () => {
    if (!caseId) return
    Promise.all([
      getCase(caseId),
      getCaseTimeline(caseId).catch(() => []),
    ])
      .then(([caseData, tl]) => {
        setC(caseData)
        setTimeline(Array.isArray(tl) ? tl : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [caseId])

  useEffect(() => {
    getAllPoliceStations().then(setStations).catch(() => [])
  }, [])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!c || !newNote.trim()) return
    setNoteSubmitting(true)
    try {
      await addCaseNote(caseId!, newNote.trim(), c.caseNotes)
      setNewNote('')
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add note')
    } finally {
      setNoteSubmitting(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!caseId) return
    try {
      await updateCaseStatus(caseId, status)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const handleAccept = async () => {
    if (!caseId) return
    try {
      await acceptCase(caseId)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to accept')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !caseId) return
    setUploading(true)
    try {
      await uploadCaseEvidence(caseId, file)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload')
    } finally {
      setUploading(false)
    }
  }

  const handleTransfer = async () => {
    if (!caseId || !transferStationId || !transferReason.trim()) return
    setTransferLoading(true)
    try {
      await requestCaseTransfer(caseId, transferStationId, transferReason.trim())
      setShowTransferModal(false)
      setTransferStationId('')
      setTransferReason('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to request transfer')
    } finally {
      setTransferLoading(false)
    }
  }

  const handleSubmitClosure = async () => {
    if (!caseId || !c || !closureSummary.trim()) return
    try {
      await addCaseNote(caseId, `[CLOSURE REPORT] ${closureSummary}`, c.caseNotes)
      await updateCaseStatus(caseId, 'RESOLVED')
      setShowClosureModal(false)
      setClosureSummary('')
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit')
    }
  }

  if (loading || !c) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  const caseNotes = c.caseNotes
  const canAccept = !c.assignedOfficerId && (c.status === 'ASSIGNED' || c.status === 'UNDER_REVIEW')
  const isMyCase = c.assignedOfficerId

  return (
    <div className="animate-fade-in-up">
      <div className="mb-3">
        <Link to="/police/cases" className="text-primary text-decoration-none">
          ← Back to Cases
        </Link>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">
            Case {c.trackingId || c.id}
            <Badge bg="light" text="dark" className="ms-2">
              {CASE_STATUS_LABELS[(c.status as keyof typeof CASE_STATUS_LABELS) || 'REPORTED']}
            </Badge>
            {c.emergency && <Badge bg="danger" className="ms-2">Emergency</Badge>}
          </h2>
          <p className="text-muted mb-0">{CASE_TYPE_LABELS[(c.caseType as keyof typeof CASE_TYPE_LABELS) || 'OTHER']}</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {canAccept && (
            <Button variant="success" onClick={handleAccept}>
              Accept Case
            </Button>
          )}
          {isMyCase && (
            <>
              <Button variant="outline-primary" onClick={() => setShowTransferModal(true)}>
                Request Transfer
              </Button>
              {(c.status === 'INVESTIGATING' || c.status === 'ASSIGNED') && (
                <Button variant="outline-warning" onClick={() => setShowClosureModal(true)}>
                  Submit Closure Report
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <Tabs defaultActiveKey="details" className="mb-3">
            <Tab eventKey="details" title="Details">
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-0 pt-3">
                  <h5 className="mb-0">Case Information</h5>
                </Card.Header>
                <Card.Body>
                  <p><strong>Reporter:</strong> {c.anonymous ? <Badge bg="secondary">Anonymous</Badge> : 'Reporter'}</p>
                  <p><strong>Location:</strong> {c.location || '-'}</p>
                  <p><strong>Submitted:</strong> {c.reportDate ? new Date(c.reportDate).toLocaleString() : '-'}</p>
                  <p><strong>Description:</strong></p>
                  <p className="text-muted">{c.caseDescription || '-'}</p>
                  {c.evidenceUrls && c.evidenceUrls.length > 0 && (
                    <div>
                      <strong>Evidence:</strong>
                      <ul className="mb-0">
                        {c.evidenceUrls.map((url, i) => (
                          <li key={i}>
                            <a href={url} target="_blank" rel="noopener noreferrer">{url.split('/').pop()}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="notes" title="Investigation Notes">
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-0 pt-3">
                  <h5 className="mb-0">Add Note</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleAddNote}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Observations, actions taken..."
                        required
                      />
                    </Form.Group>
                    <Button type="submit" variant="primary" disabled={noteSubmitting || !newNote.trim()}>
                      {noteSubmitting ? 'Adding...' : 'Add Note'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
              {caseNotes && (
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="bg-white border-0 pt-3">
                    <h5 className="mb-0">Case Notes</h5>
                  </Card.Header>
                  <Card.Body>
                    <pre className="mb-0 bg-light p-3 rounded small" style={{ whiteSpace: 'pre-wrap' }}>
                      {caseNotes}
                    </pre>
                  </Card.Body>
                </Card>
              )}
            </Tab>

            <Tab eventKey="documents" title="Documents">
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-0 pt-3">
                  <h5 className="mb-0">Upload Document</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Control
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </Form.Group>
                  {c.evidenceUrls && c.evidenceUrls.length > 0 && (
                    <div className="mt-3">
                      <strong>Documents:</strong>
                      <ul className="mb-0">
                        {c.evidenceUrls.map((url, i) => (
                          <li key={i}>
                            <a href={url} target="_blank" rel="noopener noreferrer">{url.split('/').pop()}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </div>

        <div className="col-lg-4">
          <Card className="border-0 shadow-sm rounded-3 mb-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Status</h5>
            </Card.Header>
            <Card.Body>
              <Form.Select
                value={c.status || ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={!isMyCase}
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Form.Select>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Timeline</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {timeline.length === 0 ? (
                <div className="p-4 text-muted text-center small">No timeline events</div>
              ) : (
                <ListGroup variant="flush">
                  {timeline.map((item, i) => {
                    const it = item as { id?: string; description?: string; eventTime?: string; performedByName?: string }
                    return (
                      <ListGroup.Item key={it.id || i} className="border-0 border-start border-2 border-primary ps-3">
                        <small className="text-muted">
                          {it.eventTime ? new Date(it.eventTime).toLocaleString() : '-'}
                          {it.performedByName && ` · ${it.performedByName}`}
                        </small>
                        <p className="mb-0 small">{it.description || '-'}</p>
                      </ListGroup.Item>
                    )
                  })}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Case Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Transfer requires admin approval. Provide jurisdiction or workload reason.
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Target Station</Form.Label>
            <Form.Select
              value={transferStationId}
              onChange={(e) => setTransferStationId(e.target.value)}
            >
              <option value="">Select...</option>
              {stations.filter((s) => s.id !== c?.assignedStationId).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.stationName} - {s.district}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Reason (required)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="Jurisdiction, workload, expertise..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTransferModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleTransfer} disabled={transferLoading || !transferStationId || !transferReason.trim()}>
            {transferLoading ? 'Submitting...' : 'Request Transfer'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showClosureModal} onHide={() => setShowClosureModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Closure Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Investigation Summary</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={closureSummary}
              onChange={(e) => setClosureSummary(e.target.value)}
              placeholder="Final investigation summary..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClosureModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSubmitClosure} disabled={!closureSummary.trim()}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

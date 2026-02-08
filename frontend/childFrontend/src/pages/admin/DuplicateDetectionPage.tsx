import { useEffect, useState } from 'react'
import { Card, Table, Badge, Spinner, Form, Row, Col, Button } from 'react-bootstrap'
import {
  getAllCasesWithDetails,
  getAllHelpRequests,
  findDuplicateCases,
  findDuplicateHelpRequests,
} from '../../services/adminApi'
import type { CaseDTO, HelpRequestDTO } from '../../types/dashboard'
import type { DuplicateDetectionDTO } from '../../types/admin'

export function DuplicateDetectionPage() {
  const [cases, setCases] = useState<CaseDTO[]>([])
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [duplicates, setDuplicates] = useState<DuplicateDetectionDTO[]>([])
  const [dupLoading, setDupLoading] = useState(false)
  const [entityType, setEntityType] = useState<'case' | 'request'>('case')

  useEffect(() => {
    Promise.all([getAllCasesWithDetails(), getAllHelpRequests()])
      .then(([c, r]) => {
        setCases(c)
        setRequests(r)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const runDuplicateCheck = () => {
    if (entityType === 'case' && selectedCaseId) {
      setDupLoading(true)
      findDuplicateCases(selectedCaseId)
        .then(setDuplicates)
        .catch(() => setDuplicates([]))
        .finally(() => setDupLoading(false))
    } else if (entityType === 'request' && selectedRequestId) {
      setDupLoading(true)
      findDuplicateHelpRequests(selectedRequestId)
        .then(setDuplicates)
        .catch(() => setDuplicates([]))
        .finally(() => setDupLoading(false))
    } else {
      setDuplicates([])
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
        <h1 className="h3 fw-bold text-dark mb-1">Duplicate Detection</h1>
        <p className="text-muted mb-0">
          AI-assisted detection of similar cases and help requests. Merge duplicates after review.
        </p>
      </div>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Header className="bg-white border-0 pt-3">
          <h5 className="mb-0">Check for Duplicates</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Entity Type</Form.Label>
                <Form.Select
                  value={entityType}
                  onChange={(e) => {
                    setEntityType(e.target.value as 'case' | 'request')
                    setDuplicates([])
                  }}
                >
                  <option value="case">Case</option>
                  <option value="request">Help Request</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  {entityType === 'case' ? 'Select Case' : 'Select Help Request'}
                </Form.Label>
                <Form.Select
                  value={entityType === 'case' ? selectedCaseId : selectedRequestId}
                  onChange={(e) => {
                    if (entityType === 'case') {
                      setSelectedCaseId(e.target.value)
                    } else {
                      setSelectedRequestId(e.target.value)
                    }
                    setDuplicates([])
                  }}
                >
                  <option value="">Choose...</option>
                  {entityType === 'case'
                    ? cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.trackingId || c.id?.slice(0, 8)} - {c.caseType || 'N/A'}
                        </option>
                      ))
                    : requests.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.trackingId || r.id?.slice(0, 8)} - {r.helpType || 'N/A'}
                        </option>
                      ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="primary"
                onClick={runDuplicateCheck}
                disabled={
                  dupLoading ||
                  (entityType === 'case' && !selectedCaseId) ||
                  (entityType === 'request' && !selectedRequestId)
                }
              >
                {dupLoading ? 'Checking...' : 'Check Duplicates'}
              </Button>
            </Col>
          </Row>
          <div className="alert alert-info mt-3 py-2 small mb-0">
            AI compares location, approximate age, gender, identification marks, and dates to find similar submissions.
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3">
          <h5 className="mb-0">Potential Duplicates</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {duplicates.length === 0 && !dupLoading ? (
            <div className="p-5 text-center text-muted">
              Select an entity and click &quot;Check Duplicates&quot; to see AI-suggested matches.
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Similarity</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {duplicates.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <code className="small">{d.trackingId || d.id?.slice(0, 8)}</code>
                    </td>
                    <td>{d.type || '-'}</td>
                    <td className="text-muted" style={{ maxWidth: 200 }}>
                      {d.description?.slice(0, 60) || '-'}
                      {d.description && d.description.length > 60 ? '...' : ''}
                    </td>
                    <td>{d.location || '-'}</td>
                    <td>
                      <Badge
                        bg={
                          d.similarityScore >= 0.8
                            ? 'danger'
                            : d.similarityScore >= 0.5
                              ? 'warning'
                              : 'secondary'
                        }
                      >
                        {(d.similarityScore * 100).toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="small text-muted">
                      {d.similarityReason?.slice(0, 50) || '-'}
                    </td>
                    <td className="text-muted small">
                      {d.date ? new Date(d.date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <div className="alert alert-warning mt-4 py-3 small">
        <strong>Merge functionality:</strong> Admin can merge duplicate cases/requests after reviewing. Combined evidence and notes are preserved. This requires backend merge API implementation.
      </div>
    </div>
  )
}

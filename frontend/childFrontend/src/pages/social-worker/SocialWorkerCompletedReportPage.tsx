import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import {
  downloadCompletedHelpRequestReportPdf,
  getCompletedHelpRequestReport,
  saveCompletedHelpRequestReportDraft,
  sendCompletedHelpRequestReportToAdmin,
} from '../../services/socialWorkerApi'
import type { CompletedHelpRequestReportDTO } from '../../types/dashboard'

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')

export function SocialWorkerCompletedReportPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<CompletedHelpRequestReportDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [initialAssessmentSummary, setInitialAssessmentSummary] = useState('')
  const [adjustments, setAdjustments] = useState('')
  const [followUpObservations, setFollowUpObservations] = useState('')
  const [objectiveAchieved, setObjectiveAchieved] = useState('Partial')
  const [improvementLevel, setImprovementLevel] = useState('Medium')
  const [childSafetyStatus, setChildSafetyStatus] = useState('Stable')
  const [familyStabilityStatus, setFamilyStabilityStatus] = useState('Improving')
  const [educationContinuityStatus, setEducationContinuityStatus] = useState('Not Applicable')
  const [challengesText, setChallengesText] = useState('')
  const [recommendationsText, setRecommendationsText] = useState('')
  const [attachmentsText, setAttachmentsText] = useState('')
  const [finalDeclarationText, setFinalDeclarationText] = useState('')

  useEffect(() => {
    if (!requestId) return
    setLoading(true)
    getCompletedHelpRequestReport(requestId)
      .then((data) => {
        setReport(data)
        setInitialAssessmentSummary(data.initialRequestDetails.initialAssessmentSummary ?? '')
        setAdjustments(data.servicePackageDetails.adjustments ?? '')
        setFollowUpObservations(data.followUpMonitoringSummary.observations ?? '')
        setObjectiveAchieved(data.outcomeAssessment.objectiveAchieved ?? 'Partial')
        setImprovementLevel(data.outcomeAssessment.improvementLevel ?? 'Medium')
        setChildSafetyStatus(data.outcomeAssessment.childSafetyStatus ?? 'Stable')
        setFamilyStabilityStatus(data.outcomeAssessment.familyStabilityStatus ?? 'Improving')
        setEducationContinuityStatus(data.outcomeAssessment.educationContinuityStatus ?? 'Not Applicable')
        setChallengesText((data.challengesFaced ?? []).join('\n'))
        setRecommendationsText((data.recommendations ?? []).join('\n'))
        setAttachmentsText((data.attachments ?? []).join('\n'))
        setFinalDeclarationText(data.finalDeclaration.statement ?? '')
        setError(null)
      })
      .catch((err) => {
        setError((err as Error).message ?? 'Failed to load report')
      })
      .finally(() => setLoading(false))
  }, [requestId])

  const parseLines = (value: string) =>
    value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

  const handleSaveDraft = async () => {
    if (!requestId) return
    setSaving(true)
    setMessage(null)
    try {
      const updated = await saveCompletedHelpRequestReportDraft(requestId, {
        initialAssessmentSummary,
        adjustments,
        followUpObservations,
        objectiveAchieved,
        improvementLevel,
        childSafetyStatus,
        familyStabilityStatus,
        educationContinuityStatus,
        challenges: parseLines(challengesText),
        recommendations: parseLines(recommendationsText),
        attachments: parseLines(attachmentsText),
        finalDeclarationText,
      })
      setReport(updated)
      setMessage('Draft saved.')
    } catch (err) {
      setError((err as Error).message ?? 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const handleSendToAdmin = async () => {
    if (!requestId) return
    setSending(true)
    setMessage(null)
    try {
      const updated = await sendCompletedHelpRequestReportToAdmin(requestId)
      setReport(updated)
      setMessage('Report sent to admin successfully.')
    } catch (err) {
      setError((err as Error).message ?? 'Failed to send report')
    } finally {
      setSending(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!requestId) return
    try {
      const blob = await downloadCompletedHelpRequestReportPdf(requestId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `completed-help-request-report-${requestId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError((err as Error).message ?? 'Failed to download PDF')
    }
  }

  if (loading) {
    return <Container fluid className="py-4">Loading report...</Container>
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <div className="alert alert-danger">{error}</div>
      </Container>
    )
  }

  if (!report) {
    return (
      <Container fluid className="py-4">
        <div className="alert alert-warning">Report data unavailable</div>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4 sw-dashboard">
      <Row className="mb-3">
        <Col xs={12} className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <Button variant="link" className="p-0 text-decoration-none mb-2" onClick={() => navigate(-1)}>
              Back
            </Button>
            <h2 className="h4 fw-700 mb-1">{report.reportHeader.reportTitle}</h2>
            <div className="text-muted small">Report ID: {report.reportHeader.reportId}</div>
          </div>
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <Badge bg="secondary">{report.workflowStatus}</Badge>
            <Button size="sm" variant="outline-secondary" onClick={handleDownloadPdf}>
              Generate PDF
            </Button>
            <Button size="sm" variant="primary" onClick={handleSendToAdmin} disabled={sending}>
              {sending ? 'Sending...' : 'Send to Admin'}
            </Button>
          </div>
        </Col>
      </Row>

      {message && <div className="alert alert-success py-2">{message}</div>}
      {report.adminReviewNote && <div className="alert alert-info py-2">Admin Note: {report.adminReviewNote}</div>}

      <Row className="g-3">
        <Col xs={12} lg={6}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white fw-700">Report Header</Card.Header>
            <Card.Body className="small">
              <div><strong>Organization:</strong> {report.reportHeader.organizationName}</div>
              <div><strong>System:</strong> {report.reportHeader.systemName}</div>
              <div><strong>Generated Date:</strong> {fmt(report.reportHeader.generatedDate)}</div>
              <div><strong>Generated By:</strong> {report.reportHeader.generatedBy} ({report.reportHeader.generatedById})</div>
              <div><strong>Help ID:</strong> {report.reportHeader.helpId}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white fw-700">Help Summary</Card.Header>
            <Card.Body className="small">
              <div><strong>Request Type:</strong> {report.helpSummary.requestType}</div>
              <div><strong>Priority:</strong> {report.helpSummary.priorityLevel}</div>
              <div><strong>Date Submitted:</strong> {fmt(report.helpSummary.dateSubmitted)}</div>
              <div><strong>Date Assigned:</strong> {fmt(report.helpSummary.dateAssignedToSW)}</div>
              <div><strong>Date Service Started:</strong> {fmt(report.helpSummary.dateServiceStarted)}</div>
              <div><strong>Date Completed:</strong> {fmt(report.helpSummary.dateCompleted)}</div>
              <div><strong>Total Duration:</strong> {report.helpSummary.totalDurationDays} day(s)</div>
              <div><strong>Status:</strong> {report.helpSummary.status}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mt-1">
        <Col xs={12} lg={6}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white fw-700">Public User Information</Card.Header>
            <Card.Body className="small">
              <div><strong>Name:</strong> {report.publicUserInfo.name}</div>
              <div><strong>Contact:</strong> {report.publicUserInfo.contactNumber}</div>
              <div><strong>Location:</strong> {report.publicUserInfo.districtOrLocation}</div>
              <div><strong>Vulnerability:</strong> {report.publicUserInfo.vulnerabilityCategory}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white fw-700">Initial Request Details</Card.Header>
            <Card.Body className="small">
              <div className="mb-2"><strong>Problem Description:</strong> {report.initialRequestDetails.problemDescription}</div>
              <div><strong>Supporting Documents:</strong></div>
              <ul className="mb-0">
                {report.initialRequestDetails.supportingDocuments.length === 0 && <li>None</li>}
                {report.initialRequestDetails.supportingDocuments.map((doc) => <li key={doc}>{doc}</li>)}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mt-1">
        <Col xs={12}>
          <Card className="sw-card border-0">
            <Card.Header className="bg-white fw-700">Social Worker Inputs</Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Initial Assessment Summary</Form.Label>
                    <Form.Control as="textarea" rows={3} value={initialAssessmentSummary} onChange={(e) => setInitialAssessmentSummary(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Package Adjustments</Form.Label>
                    <Form.Control as="textarea" rows={3} value={adjustments} onChange={(e) => setAdjustments(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Follow-up Observations</Form.Label>
                    <Form.Control as="textarea" rows={3} value={followUpObservations} onChange={(e) => setFollowUpObservations(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Objective Achieved</Form.Label>
                    <Form.Select value={objectiveAchieved} onChange={(e) => setObjectiveAchieved(e.target.value)}>
                      <option value="Yes">Yes</option>
                      <option value="Partial">Partial</option>
                      <option value="No">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Improvement Level</Form.Label>
                    <Form.Select value={improvementLevel} onChange={(e) => setImprovementLevel(e.target.value)}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Child Safety Status</Form.Label>
                    <Form.Control value={childSafetyStatus} onChange={(e) => setChildSafetyStatus(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Family Stability Status</Form.Label>
                    <Form.Control value={familyStabilityStatus} onChange={(e) => setFamilyStabilityStatus(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Education Continuity Status</Form.Label>
                    <Form.Control value={educationContinuityStatus} onChange={(e) => setEducationContinuityStatus(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Challenges (one per line)</Form.Label>
                    <Form.Control as="textarea" rows={4} value={challengesText} onChange={(e) => setChallengesText(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Recommendations (one per line)</Form.Label>
                    <Form.Control as="textarea" rows={4} value={recommendationsText} onChange={(e) => setRecommendationsText(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Attachments (one per line)</Form.Label>
                    <Form.Control as="textarea" rows={4} value={attachmentsText} onChange={(e) => setAttachmentsText(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Final Declaration</Form.Label>
                    <Form.Control as="textarea" rows={2} value={finalDeclarationText} onChange={(e) => setFinalDeclarationText(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-3 d-flex justify-content-end">
                <Button onClick={handleSaveDraft} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

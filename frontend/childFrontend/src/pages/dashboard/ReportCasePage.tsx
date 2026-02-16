import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Card } from 'react-bootstrap'
import { reportCase } from '../../services/dashboardApi'
import { uploadRegistrationDocument } from '../../services/authApi'
import { CASE_TYPE_LABELS } from '../../types/dashboard'
import type { CaseType } from '../../types/dashboard'

const CASE_TYPES: CaseType[] = ['MISSING_CHILD', 'CHILD_ABUSE', 'CHILD_LABOR', 'CHILD_TRAFFICKING', 'OTHER']

function toISOString(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().slice(0, 19)
  return new Date(dateStr).toISOString().slice(0, 19)
}

export function ReportCasePage() {
  const navigate = useNavigate()
  const [anonymous, setAnonymous] = useState(false)
  const [caseType, setCaseType] = useState<CaseType>('OTHER')
  const [caseDescription, setCaseDescription] = useState('')
  const [approximateAge, setApproximateAge] = useState('')
  const [gender, setGender] = useState('')
  const [location, setLocation] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [physicalIdentificationMarks, setPhysicalIdentificationMarks] = useState('')
  const [lastSeenDressDetails, setLastSeenDressDetails] = useState('')
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [photographUrl, setPhotographUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadRegistrationDocument(file)
      setEvidenceUrls((prev) => [...prev, url])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handlePhotographUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadRegistrationDocument(file)
      setPhotographUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!caseDescription.trim()) {
      setError('Case description is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await reportCase({
        anonymous,
        caseType,
        caseDescription: caseDescription.trim(),
        approximateAge: approximateAge.trim() || undefined,
        gender: gender.trim() || undefined,
        location: location.trim() || undefined,
        incidentDate: toISOString(incidentDate),
        physicalIdentificationMarks: physicalIdentificationMarks.trim() || undefined,
        lastSeenDressDetails: lastSeenDressDetails.trim() || undefined,
        photographUrl: photographUrl || undefined,
        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
      })
      if (res.success) {
        navigate(res.caseId ? `/dashboard/cases/${res.caseId}` : '/dashboard/my-cases')
      } else {
        setError(res.message || 'Failed to report case')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report case')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="h4 fw-bold mb-4">Report Child Protection Case</h2>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4 p-md-5">
          <Form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="anonymous"
                label="Submit anonymously (hide identity from police and social workers)"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Case Type *</Form.Label>
              <Form.Select value={caseType} onChange={(e) => setCaseType(e.target.value as CaseType)} required>
                {CASE_TYPES.map((t) => (
                  <option key={t} value={t}>{CASE_TYPE_LABELS[t]}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Case Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                placeholder="Describe the incident in detail..."
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Approximate age (optional)</Form.Label>
              <Form.Control
                type="text"
                value={approximateAge}
                onChange={(e) => setApproximateAge(e.target.value)}
                placeholder="e.g. 5–7 years, under 10"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Gender (optional)</Form.Label>
              <Form.Select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="NOT_SPECIFIED">Not Specified</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location (optional)</Form.Label>
              <Form.Control
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where did this occur?"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Incident Date (optional)</Form.Label>
              <Form.Control
                type="datetime-local"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Physical Identification Marks (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={physicalIdentificationMarks}
                onChange={(e) => setPhysicalIdentificationMarks(e.target.value)}
                placeholder="Describe any scars, marks, tattoos, birthmarks, or other identifying features..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Seen Dress Details (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={lastSeenDressDetails}
                onChange={(e) => setLastSeenDressDetails(e.target.value)}
                placeholder="Describe the clothing the child was wearing when last seen..."
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Photograph (optional)</Form.Label>
              <Form.Control
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                onChange={handlePhotographUpload}
                disabled={uploading}
              />
              {uploading && <small className="text-muted">Uploading...</small>}
              {photographUrl && (
                <div className="mt-2">
                  <small className="text-success">✓ Photo uploaded</small>
                  <div>
                    <img src={photographUrl} alt="Child photograph" style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '8px' }} />
                  </div>
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Additional Evidence (images, documents, videos)</Form.Label>
              <Form.Control type="file" accept=".pdf,.jpg,.jpeg,.png,.mp4" onChange={handleFileUpload} disabled={uploading} />
              {uploading && <small className="text-muted">Uploading...</small>}
              {evidenceUrls.length > 0 && (
                <div className="mt-2">
                  {evidenceUrls.map((url, i) => (
                    <span key={i} className="badge bg-light text-dark me-1">{url.split('/').pop()}</span>
                  ))}
                </div>
              )}
            </Form.Group>
            <Button type="submit" variant="primary" className="rounded-pill px-4" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

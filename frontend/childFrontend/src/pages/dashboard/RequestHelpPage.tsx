import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Card } from 'react-bootstrap'
import { createHelpRequest } from '../../services/dashboardApi'
import { uploadRegistrationDocument } from '../../services/authApi'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import type { HelpType } from '../../types/dashboard'

const HELP_TYPES: HelpType[] = ['FOOD_ASSISTANCE', 'EDUCATION_SUPPORT', 'MEDICAL_HELP', 'SHELTER', 'CLOTHING', 'COUNSELING', 'OTHER']

export function RequestHelpPage() {
  const navigate = useNavigate()
  const [anonymous, setAnonymous] = useState(false)
  const [helpType, setHelpType] = useState<HelpType>('OTHER')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [documentUrls, setDocumentUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadRegistrationDocument(file)
      setDocumentUrls((prev) => [...prev, url])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!description.trim()) {
      setError('Description is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await createHelpRequest({
        anonymous,
        helpType,
        description: description.trim(),
        location: location.trim() || undefined,
        documentUrls: documentUrls.length > 0 ? documentUrls : undefined,
      })
      if (res.success) {
        navigate(res.requestId ? `/dashboard/requests/${res.requestId}` : '/dashboard/my-requests')
      } else {
        setError(res.message || 'Failed to create request')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="h4 fw-bold mb-4">Request Help</h2>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4 p-md-5">
          <Form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="anonymous"
                label="Submit anonymously"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Help Type *</Form.Label>
              <Form.Select value={helpType} onChange={(e) => setHelpType(e.target.value as HelpType)} required>
                {HELP_TYPES.map((t) => (
                  <option key={t} value={t}>{HELP_TYPE_LABELS[t]}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what kind of help you need..."
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location (optional)</Form.Label>
              <Form.Control
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your location or area"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Supporting Documents</Form.Label>
              <Form.Control type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} disabled={uploading} />
              {uploading && <small className="text-muted">Uploading...</small>}
              {documentUrls.length > 0 && (
                <div className="mt-2">
                  {documentUrls.map((url, i) => (
                    <span key={i} className="badge bg-light text-dark me-1">{url.split('/').pop()}</span>
                  ))}
                </div>
              )}
            </Form.Group>
            <Button type="submit" variant="primary" className="rounded-pill px-4" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

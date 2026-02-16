import { useEffect, useMemo, useState } from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { getPublicFeedback } from '../services/feedbackApi'
import type { FeedbackResponseDTO } from '../types/admin'

const fallbackTestimonials = [
  {
    quote:
      'This portal made it easy for us to connect with support when we needed it most. The response was fast and caring.',
    author: 'Sarah M.',
    role: 'Parent / Caregiver',
    rating: 5,
  },
  {
    quote:
      'As a social worker, the streamlined case management and follow-up tools have significantly improved our efficiency.',
    author: 'David K.',
    role: 'Social Worker',
    rating: 5,
  },
  {
    quote:
      'Clear communication between police and social services helps us protect children faster. This portal bridges that gap.',
    author: 'Officer James L.',
    role: 'Police Station',
    rating: 5,
  },
]

function roleLabelFromFeedback(item: FeedbackResponseDTO): string {
  const source = `${item.type || ''} ${item.category || ''}`.toUpperCase()
  if (source.includes('SOCIAL')) return 'Social Worker'
  if (source.includes('POLICE')) return 'Police Station'
  if (source.includes('HELP_REQUEST')) return 'Support Request'
  if (source.includes('SYSTEM')) return 'Portal User'
  return 'Community Member'
}

function shortName(name?: string): string {
  if (!name || !name.trim()) return 'Anonymous User'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1].charAt(0)}.`
}

export function TestimonialsSection() {
  const [feedback, setFeedback] = useState<FeedbackResponseDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicFeedback()
      .then((rows) => setFeedback(Array.isArray(rows) ? rows : []))
      .catch(() => setFeedback([]))
      .finally(() => setLoading(false))
  }, [])

  const testimonials = useMemo(() => {
    const mapped = feedback
      .filter((f) => !!(f.message || f.description))
      .slice(0, 3)
      .map((f) => ({
        quote: (f.message || f.description || '').trim(),
        author: shortName(f.userName || (f.anonymous ? 'Anonymous User' : undefined)),
        role: roleLabelFromFeedback(f),
        rating: Math.max(1, Math.min(5, Number(f.rating || 5))),
      }))
    return mapped.length > 0 ? mapped : fallbackTestimonials
  }, [feedback])

  const averageRating = useMemo(() => {
    const ratings = feedback
      .map((f) => Number(f.rating))
      .filter((r) => Number.isFinite(r) && r > 0)
    if (ratings.length === 0) return 5
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length
  }, [feedback])

  return (
    <section className="py-5 my-5 bg-light landing-testimonials-section">
      <Container>
        <div className="text-center mb-5">
          <div className="landing-section-pill mb-2 d-inline-block">Community Voices</div>
          <h2 className="display-5 fw-bold text-dark mb-3">Success Stories & Trust</h2>
          <p className="lead text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            Real feedback from people using the portal every day
          </p>
          <div className="landing-feedback-meta mt-3">
            <span className="landing-feedback-pill">
              ⭐ {loading ? '...' : averageRating.toFixed(1)} / 5 average rating
            </span>
            <span className="landing-feedback-pill">
              {loading ? 'Loading...' : `${feedback.length || testimonials.length} public feedback entries`}
            </span>
          </div>
        </div>
        <Row className="g-4">
          {testimonials.map((t, idx) => (
            <Col key={idx} xs={12} md={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-4 bg-white landing-testimonial-card">
                <div className="mb-2">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-warning fs-5">★</span>
                  ))}
                </div>
                <Card.Text className="text-secondary mb-3 fst-italic">"{t.quote}"</Card.Text>
                <div className="d-flex align-items-center gap-2">
                  <div className="landing-avatar-badge">{t.author.charAt(0)}</div>
                  <div>
                  <strong className="text-dark">{t.author}</strong>
                  <small className="d-block text-muted">{t.role}</small>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

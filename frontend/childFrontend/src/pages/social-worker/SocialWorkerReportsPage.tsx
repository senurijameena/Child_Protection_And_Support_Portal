import { useEffect, useMemo, useState } from 'react'
import { Card, Container, Row, Col, Badge, Form } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import {
  getAssignedRequests,
  getMyFollowUps,
  type FollowUpDTO,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO, HelpType } from '../../types/dashboard'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import './SocialWorkerDashboard.css'

type DateRange = 'WEEK' | 'MONTH' | 'ALL'

const formatDate = (iso?: string) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString()
}

const getHelpTypeKey = (t?: HelpType) => t ?? 'OTHER'

export function SocialWorkerReportsPage() {
  const { user } = useAuth()

  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dateRange, setDateRange] = useState<DateRange>('MONTH')
  const [typeFilter, setTypeFilter] = useState<'ALL' | HelpType>('ALL')

  useEffect(() => {
    if (!user?.userId) {
      setLoading(false)
      return
    }

    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        const [assigned, myFollowUps] = await Promise.all([
          getAssignedRequests(user.userId),
          getMyFollowUps(),
        ])
        if (!isMounted) return
        setRequests(assigned)
        setFollowUps(myFollowUps)
        setError(null)
      } catch (err) {
        console.error('Failed to load analytics data', err)
        if (isMounted) {
          setError((err as Error).message ?? 'Failed to load analytics')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [user?.userId])

  const dateCutoff = useMemo(() => {
    if (dateRange === 'ALL') return null
    const now = new Date()
    const d = new Date(now)
    if (dateRange === 'WEEK') {
      d.setDate(now.getDate() - 7)
    } else if (dateRange === 'MONTH') {
      d.setMonth(now.getMonth() - 1)
    }
    return d
  }, [dateRange])

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (dateCutoff && r.requestDate) {
        const d = new Date(r.requestDate)
        if (!Number.isNaN(d.getTime()) && d < dateCutoff) {
          return false
        }
      }
      if (typeFilter !== 'ALL') {
        if (r.helpType !== typeFilter) return false
      }
      return true
    })
  }, [requests, dateCutoff, typeFilter])

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((f) => {
      if (dateCutoff && f.scheduledDate) {
        const d = new Date(f.scheduledDate)
        if (!Number.isNaN(d.getTime()) && d < dateCutoff) {
          return false
        }
      }
      return true
    })
  }, [followUps, dateCutoff])

  const now = new Date()

  const workload = useMemo(() => {
    const totalAssigned = filteredRequests.length
    const completed = filteredRequests.filter((r) => r.status === 'COMPLETED').length
    const pending = filteredRequests.filter(
      (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && r.status !== 'REJECTED'
    ).length

    const overdueRequestIds = new Set<string>()
    filteredFollowUps.forEach((fu) => {
      if (!fu.helpRequestId || !fu.scheduledDate) return
      const d = new Date(fu.scheduledDate)
      const isCompleted = fu.status === 'COMPLETED' || fu.status === 'DONE'
      if (!Number.isNaN(d.getTime()) && d < now && !isCompleted) {
        overdueRequestIds.add(fu.helpRequestId)
      }
    })
    const overdue = filteredRequests.filter((r) => overdueRequestIds.has(r.id)).length

    return { totalAssigned, completed, pending, overdue }
  }, [filteredRequests, filteredFollowUps, now])

  const serviceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredRequests.forEach((r) => {
      const key = getHelpTypeKey(r.helpType)
      counts[key] = (counts[key] ?? 0) + 1
    })
    return counts
  }, [filteredRequests])

  const totalServiceCount = Object.values(serviceTypeCounts).reduce(
    (sum, n) => sum + n,
    0
  )

  const followUpStats = useMemo(() => {
    let completed = 0
    let overdue = 0
    let upcoming = 0

    filteredFollowUps.forEach((fu) => {
      const status = fu.status
      const d = fu.scheduledDate ? new Date(fu.scheduledDate) : null
      const isCompleted = status === 'COMPLETED' || status === 'DONE'
      if (isCompleted) {
        completed += 1
      } else if (d && !Number.isNaN(d.getTime())) {
        if (d < now) overdue += 1
        else upcoming += 1
      }
    })

    return { completed, overdue, upcoming }
  }, [filteredFollowUps, now])

  // Simple mock feedback data – ready to replace from backend later
  const feedbackByType: { type: HelpType; avgRating: number; count: number }[] = [
    { type: 'FOOD_ASSISTANCE', avgRating: 4.5, count: 24 },
    { type: 'EDUCATION_SUPPORT', avgRating: 4.2, count: 18 },
    { type: 'MEDICAL_HELP', avgRating: 4.8, count: 12 },
    { type: 'COUNSELING', avgRating: 4.6, count: 30 },
  ]

  const isLoading = loading && !requests.length && !followUps.length

  return (
    <Container fluid className="py-4 sw-dashboard">
      {error && (
        <Row className="mb-3">
          <Col xs={12}>
            <div className="alert alert-danger small mb-0">{error}</div>
          </Col>
        </Row>
      )}

      {/* Header + filters */}
      <Row className="mb-4">
        <Col xs={12} className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h1 className="h3 fw-700 mb-1">Analytics & Insights</h1>
            <p className="text-muted mb-0">
              Data-driven overview of your workload, services, and outcomes.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Form.Select
              size="sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
            >
              <option value="WEEK">Last 7 days</option>
              <option value="MONTH">Last 30 days</option>
              <option value="ALL">All time</option>
            </Form.Select>
            <Form.Select
              size="sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | HelpType)}
            >
              <option value="ALL">All request types</option>
              {Object.entries(HELP_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Form.Select>
          </div>
        </Col>
      </Row>

      {/* Top KPI cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="sw-stat-card border-0 h-100">
            <Card.Body>
              <p className="text-muted small fw-600 mb-1">Total assigned</p>
              <h3 className="mb-0 fw-700" style={{ color: 'var(--sw-primary-blue)' }}>
                {workload.totalAssigned}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="sw-stat-card border-0 h-100">
            <Card.Body>
              <p className="text-muted small fw-600 mb-1">Completed</p>
              <h3 className="mb-0 fw-700" style={{ color: '#10b981' }}>
                {workload.completed}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="sw-stat-card border-0 h-100">
            <Card.Body>
              <p className="text-muted small fw-600 mb-1">Pending</p>
              <h3 className="mb-0 fw-700" style={{ color: '#f59e0b' }}>
                {workload.pending}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="sw-stat-card border-0 h-100">
            <Card.Body>
              <p className="text-muted small fw-600 mb-1">Overdue</p>
              <h3 className="mb-0 fw-700" style={{ color: '#ef4444' }}>
                {workload.overdue}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Middle row: service type + resource utilization (mock) */}
      <Row className="g-4 mb-4">
        {/* Service Types Distribution */}
        <Col xs={12} lg={6}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Service type distribution</h5>
            </Card.Header>
            <Card.Body>
              {totalServiceCount === 0 ? (
                <div className="text-muted small">
                  No requests in this period. Adjust filters to see distribution.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {Object.entries(serviceTypeCounts).map(([key, count]) => {
                    const percentage = Math.round((count / totalServiceCount) * 100)
                    const label = HELP_TYPE_LABELS[key as HelpType] ?? 'Other'
                    return (
                      <div key={key}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span>{label}</span>
                          <span>
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="progress sw-progress-bar" style={{ height: 8 }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Resource utilization (placeholder using static sample) */}
        <Col xs={12} lg={6}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Resource utilization</h5>
            </Card.Header>
            <Card.Body>
              <div className="small text-muted mb-2">
                Sample data – wire to real resource assignments in future.
              </div>
              <div className="d-flex flex-column gap-2 small">
                {[
                  { name: 'Colombo Children’s Hospital', assignments: 14, availability: 'Available' },
                  { name: 'Safe Haven Shelter', assignments: 9, availability: 'Busy' },
                  { name: 'Hope For Kids Foundation', assignments: 7, availability: 'Available' },
                  { name: 'Legal Aid Center', assignments: 3, availability: 'Full' },
                ].map((res) => (
                  <div key={res.name}>
                    <div className="d-flex justify-content-between mb-1">
                      <span>{res.name}</span>
                      <span>{res.assignments}</span>
                    </div>
                    <div className="progress sw-progress-bar" style={{ height: 8 }}>
                      <div
                        className="progress-bar"
                        style={{ width: `${Math.min(res.assignments * 5, 100)}%` }}
                      />
                    </div>
                    <div className="d-flex justify-content-between mt-1 text-muted">
                      <span>Assignments</span>
                      <span>
                        <Badge
                          bg={
                            res.availability === 'Available'
                              ? 'success'
                              : res.availability === 'Busy'
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {res.availability}
                        </Badge>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom row: follow-ups and service package & feedback overview */}
      <Row className="g-4 mb-4">
        {/* Follow-up analytics */}
        <Col xs={12} lg={6}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Follow-up schedule</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-3 mb-3">
                <div>
                  <div className="small text-muted">Completed</div>
                  <h4 className="mb-0 fw-700" style={{ color: '#10b981' }}>
                    {followUpStats.completed}
                  </h4>
                </div>
                <div>
                  <div className="small text-muted">Upcoming</div>
                  <h4 className="mb-0 fw-700" style={{ color: 'var(--sw-primary-blue)' }}>
                    {followUpStats.upcoming}
                  </h4>
                </div>
                <div>
                  <div className="small text-muted">Overdue</div>
                  <h4 className="mb-0 fw-700" style={{ color: '#ef4444' }}>
                    {followUpStats.overdue}
                  </h4>
                </div>
              </div>
              <div className="small text-muted mb-2">
                Upcoming & overdue follow-ups (sample timeline from filtered data).
              </div>
              <ul className="mb-0 small ps-3" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {filteredFollowUps
                  .filter((fu) => fu.scheduledDate)
                  .sort((a, b) => {
                    const aTime = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0
                    const bTime = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0
                    return aTime - bTime
                  })
                  .slice(0, 10)
                  .map((fu) => {
                    const d = formatDate(fu.scheduledDate)
                    const isCompleted = fu.status === 'COMPLETED' || fu.status === 'DONE'
                    const variant = isCompleted
                      ? 'success'
                      : fu.scheduledDate && new Date(fu.scheduledDate) < now
                        ? 'danger'
                        : 'primary'
                    return (
                      <li key={fu.id} className="mb-1 d-flex justify-content-between">
                        <span>
                          {fu.type || 'Follow-up'} {fu.childName ? `• ${fu.childName}` : ''}
                        </span>
                        <span>
                          <Badge bg={variant}>{d || 'Not scheduled'}</Badge>
                        </span>
                      </li>
                    )
                  })}
                {filteredFollowUps.length === 0 && (
                  <li className="text-muted">No follow-ups in this period.</li>
                )}
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Service package & feedback overview */}
        <Col xs={12} lg={6}>
          <Card className="sw-card border-0 h-100 mb-3">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Service package status</h5>
            </Card.Header>
            <Card.Body>
              <div className="small text-muted mb-2">
                Placeholder metrics – connect to real service package API.
              </div>
              <div className="d-flex flex-column gap-2">
                {[
                  { label: 'Pending approval', value: 4, color: '#f59e0b' },
                  { label: 'In progress', value: 9, color: '#3b82f6' },
                  { label: 'Completed', value: 12, color: '#10b981' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="progress sw-progress-bar" style={{ height: 8 }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(item.value * 5, 100)}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Feedback & satisfaction</h5>
            </Card.Header>
            <Card.Body>
              <div className="small text-muted mb-2">
                Average star ratings per service type (sample data).
              </div>
              <div className="d-flex flex-column gap-2 small">
                {feedbackByType.map((fb) => {
                  const fullStars = Math.round(fb.avgRating)
                  return (
                    <div key={fb.type} className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-500">{HELP_TYPE_LABELS[fb.type]}</div>
                        <div className="text-muted">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span key={idx}>
                              {idx < fullStars ? '★' : '☆'}
                            </span>
                          ))}{' '}
                          ({fb.avgRating.toFixed(1)} · {fb.count} feedbacks)
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isLoading && (
        <Row>
          <Col xs={12}>
            <div className="text-center text-muted small">Loading analytics…</div>
          </Col>
        </Row>
      )}
    </Container>
  )
}

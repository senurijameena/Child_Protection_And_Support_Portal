import { useEffect, useState } from 'react'
import { Card, Container, Row, Col, ListGroup, Badge } from 'react-bootstrap'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { getMyFollowUps, type FollowUpDTO } from '../../services/socialWorkerApi'
import './SocialWorkerDashboard.css'

const locales = {
  'en-US': enUS,
}
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

import { useSearchParams } from 'react-router-dom'

// Helper to check if a follow-up is overdue
type CalendarEvent = { start: Date; end: Date; title: string; resource?: FollowUpDTO }

export function SocialWorkerFollowUpsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestFilter = searchParams.get('request')

  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await getMyFollowUps()
        if (!isMounted) return
        setFollowUps(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        console.error('Failed to load follow-ups', err)
        if (isMounted) setError((err as Error).message ?? 'Failed to load follow-ups')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredFollowUps = requestFilter ? followUps.filter((f) => f.helpRequestId === requestFilter) : followUps

  const events: CalendarEvent[] = filteredFollowUps
    .filter((f) => f.scheduledDate)
    .map((f) => {
      const start = new Date(f.scheduledDate ?? '')
      const end = addHours(start, 1)
      const title = f.type ? `${f.type} • ${f.childName ?? ''}`.trim() : f.notes ?? 'Follow-up'
      return { start, end, title, resource: f }
    })

  const FollowUpEvent = ({ event }: { event: CalendarEvent }) => {
    const sd = event.resource?.scheduledDate
    const timeText = sd ? new Date(sd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
    return (
      <div className="rbc-event-custom">
        {timeText && <div className="rbc-event-time small text-muted">{timeText}</div>}
        <div className="rbc-event-title small fw-600" title={event.title}>{event.title}</div>
      </div>
    )
  }

  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  return (
    <Container fluid className="py-4 sw-dashboard">
      {/* Header */}
      <Row className="mb-4">
        <Col xs={12}>
          <div
            className="p-4 rounded-3 shadow-sm position-relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
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
                  <span style={{ fontSize: '2rem' }}>⏰</span>
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1">Follow-ups</h1>
                  <p className="mb-0" style={{ opacity: 0.95, fontSize: '0.95rem' }}>
                    Calendar view for scheduled follow-ups and quick list of upcoming items
                  </p>
                </div>
              </div>
              {requestFilter && (
                <button
                  type="button"
                  className="btn btn-light d-flex align-items-center gap-2"
                  onClick={() => setSearchParams({})}
                  style={{
                    fontWeight: '600',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🔍</span> Show All
                </button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card
            className="border-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
          >
            <Card.Header
              className="bg-transparent border-0 pb-2 pt-3"
              style={{ borderBottom: '2px solid rgba(59, 130, 246, 0.2)' }}
            >
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: '#1e40af' }}>
                <span style={{ fontSize: '1.5rem' }}>📅</span>
                Calendar View
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <style>{`
                .rbc-event-custom{white-space:normal;padding:3px 6px;border-radius:4px}
                .rbc-event-custom .rbc-event-time{font-size:0.7rem;opacity:0.85}
                .rbc-event-custom .rbc-event-title{line-height:1.05} 
                .rbc-toolbar button{pointer-events:auto}
                .rbc-toolbar {
                  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
                  padding: 12px;
                  border-radius: 8px;
                  margin-bottom: 16px;
                }
                .rbc-toolbar button {
                  background: rgba(59, 130, 246, 0.1);
                  border: 2px solid rgba(59, 130, 246, 0.3);
                  color: #1e40af;
                  font-weight: 600;
                  border-radius: 6px;
                  padding: 6px 12px;
                }
                .rbc-toolbar button:hover, .rbc-toolbar button.rbc-active {
                  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                  color: white;
                  border-color: #3b82f6;
                }
                .rbc-month-view {
                  border: 2px solid rgba(59, 130, 246, 0.2);
                  border-radius: 8px;
                  overflow: hidden;
                }
                .rbc-header {
                  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                  color: white;
                  font-weight: 600;
                  padding: 12px 8px;
                  border: none !important;
                }
                .rbc-today {
                  background-color: rgba(59, 130, 246, 0.1) !important;
                }
                .rbc-event {
                  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                  border: none;
                }
                .rbc-date-cell {
                  padding: 8px;
                }
                .rbc-day-bg + .rbc-day-bg {
                  border-left: 1px solid rgba(59, 130, 246, 0.1);
                }
                .rbc-month-row + .rbc-month-row {
                  border-top: 1px solid rgba(59, 130, 246, 0.1);
                }
              `}</style>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 520 }}
                defaultView="month"
                views={["month"]}
                date={currentDate}
                onNavigate={(date: Date) => setCurrentDate(date)}
                popup
                components={{ event: FollowUpEvent, timeGutter: () => null }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card
            className="border-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
          >
            <Card.Header
              className="bg-transparent border-0 pb-2 pt-3"
              style={{ borderBottom: '2px solid rgba(59, 130, 246, 0.2)' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: '#1e40af' }}>
                  <span style={{ fontSize: '1.5rem' }}>📋</span>
                  Upcoming Follow-ups
                </h5>
                <Badge
                  pill
                  style={{
                    backgroundColor: '#3b82f6',
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.8rem'
                  }}
                >
                  {filteredFollowUps.length}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0" style={{ maxHeight: '580px', overflowY: 'auto' }}>
              {loading && followUps.length === 0 ? (
                <div
                  className="p-4 text-center"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '2px solid rgba(59, 130, 246, 0.2)',
                    margin: '1rem',
                    borderRadius: '8px'
                  }}
                >
                  <div className="spinner-border" style={{ color: '#3b82f6' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 mb-0 fw-semibold" style={{ color: '#1e40af' }}>Loading follow-ups...</p>
                </div>
              ) : followUps.length === 0 ? (
                <div
                  className="p-4 text-center"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '2px dashed rgba(59, 130, 246, 0.3)',
                    margin: '1rem',
                    borderRadius: '8px'
                  }}
                >
                  <span style={{ fontSize: '3rem' }}>📭</span>
                  <p className="mt-3 mb-1 fw-semibold" style={{ color: '#1e40af' }}>No follow-ups scheduled</p>
                  <p className="mb-0 small" style={{ color: '#3b82f6' }}>Schedule follow-ups from request details</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {followUps
                    .filter((f) => f.scheduledDate)
                    .sort((a, b) => (a.scheduledDate && b.scheduledDate ? new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime() : 0))
                    .map((fu, index) => {
                      const isOverdue = fu.scheduledDate && new Date(fu.scheduledDate) < new Date() && fu.status !== 'COMPLETED'
                      const statusColors = {
                        COMPLETED: { bg: '#10b981', text: 'white', icon: '✅' },
                        SCHEDULED: { bg: '#3b82f6', text: 'white', icon: '📅' },
                        PENDING: { bg: '#f59e0b', text: 'white', icon: '⏳' }
                      }
                      const status = fu.status ?? 'SCHEDULED'
                      const colorConfig = statusColors[status as keyof typeof statusColors] || statusColors.SCHEDULED

                      return (
                        <ListGroup.Item
                          key={fu.id}
                          className="border-0"
                          style={{
                            backgroundColor: index % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'white',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'white';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div className="py-3 px-4">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="flex-grow-1">
                                <h6 className="fw-bold mb-1" style={{ color: '#1e40af' }}>
                                  {fu.childName ?? fu.type ?? 'Follow-up'}
                                </h6>
                                {fu.type && fu.childName && (
                                  <div className="small mb-1" style={{ color: '#3b82f6' }}>
                                    📌 {fu.type}
                                  </div>
                                )}
                              </div>
                              <Badge
                                className="rounded-pill ms-2"
                                style={{
                                  backgroundColor: isOverdue ? '#ef4444' : colorConfig.bg,
                                  color: colorConfig.text,
                                  fontSize: '0.7rem',
                                  padding: '0.3rem 0.7rem'
                                }}
                              >
                                {isOverdue ? '🚨 Overdue' : `${colorConfig.icon} ${status}`}
                              </Badge>
                            </div>

                            <div
                              className="p-2 rounded-3 d-flex align-items-center gap-2"
                              style={{
                                backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                              }}
                            >
                              <span style={{ fontSize: '1rem' }}>🕒</span>
                              <small className="fw-semibold" style={{ color: isOverdue ? '#dc2626' : '#1e40af' }}>
                                {fu.scheduledDate ? new Date(fu.scheduledDate).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'Not scheduled'}
                              </small>
                            </div>

                            {fu.notes && (
                              <div
                                className="mt-2 p-2 rounded-3 small"
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                  border: '1px solid rgba(59, 130, 246, 0.2)',
                                  color: '#4b5563'
                                }}
                              >
                                💬 {fu.notes}
                              </div>
                            )}
                          </div>
                        </ListGroup.Item>
                      )
                    })}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <div
          className="p-3 rounded-3 mt-4"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            border: '2px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}
    </Container>
  )
}

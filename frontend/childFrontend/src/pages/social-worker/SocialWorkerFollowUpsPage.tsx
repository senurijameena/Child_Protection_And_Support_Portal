import { useEffect, useState } from 'react'
import { Card, Container, Row, Col, ListGroup, Badge } from 'react-bootstrap'
import { Calendar, type Event as RbcEvent, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { getMyFollowUps, type FollowUpDTO } from '../../services/socialWorkerApi'

const locales = {
  'en-US': enUS,
}
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

import { useSearchParams } from 'react-router-dom'

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

  const events: RbcEvent[] = filteredFollowUps
    .filter((f) => f.scheduledDate)
    .map((f) => {
      const start = new Date(f.scheduledDate ?? '')
      const end = addHours(start, 1)
      const title = f.type ? `${f.type} • ${f.childName ?? ''}`.trim() : f.notes ?? 'Follow-up'
      return { start, end, title, resource: f } as RbcEvent
    })

  const FollowUpEvent = ({ event }: { event: RbcEvent & { resource?: FollowUpDTO } }) => {
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
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h3 fw-700 mb-1">Follow-ups ⏰</h1>
        <p className="text-muted">Calendar view for scheduled follow-ups and quick list of upcoming items.</p>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card className="sw-card border-0">
            <Card.Body>
              <style>{`.rbc-event-custom{white-space:normal;padding:3px 6px;border-radius:4px}.rbc-event-custom .rbc-event-time{font-size:0.7rem;opacity:0.85}.rbc-event-custom .rbc-event-title{line-height:1.05} .rbc-toolbar button{pointer-events:auto}`}</style>
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
          <Card className="sw-card border-0">
            <Card.Body className="p-0">
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-700">Upcoming Follow-ups</h5>
                <div>
                  <small className="text-muted me-2">{filteredFollowUps.length} shown</small>
                  {requestFilter && (
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSearchParams({})}>
                      Show all
                    </button>
                  )}
                </div>
              </div>
              <ListGroup variant="flush">
                {loading && followUps.length === 0 ? (
                  <ListGroup.Item className="py-3">Loading...</ListGroup.Item>
                ) : followUps.length === 0 ? (
                  <ListGroup.Item className="py-3">No follow-ups scheduled.</ListGroup.Item>
                ) : (
                  followUps
                    .filter((f) => f.scheduledDate)
                    .sort((a, b) => (a.scheduledDate && b.scheduledDate ? new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime() : 0))
                    .map((fu) => (
                      <ListGroup.Item key={fu.id} className="py-3 px-4 d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="fw-700 mb-1">{fu.childName ?? fu.type ?? 'Follow-up'}</h6>
                          <small className="text-muted">{fu.scheduledDate ? new Date(fu.scheduledDate).toLocaleString() : 'Not scheduled'}</small>
                        </div>
                        <Badge bg={fu.status === 'COMPLETED' ? 'success' : fu.status === 'SCHEDULED' ? 'primary' : 'warning'}>
                          {fu.status ?? 'Scheduled'}
                        </Badge>
                      </ListGroup.Item>
                    ))
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && <div className="alert alert-danger small mt-3">{error}</div>}
    </Container>
  )
}

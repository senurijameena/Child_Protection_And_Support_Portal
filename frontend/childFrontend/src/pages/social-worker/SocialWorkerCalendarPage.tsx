import { useEffect, useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { Card, Spinner, Button, Modal, Form } from 'react-bootstrap'
import { getMyFollowUps, createFollowUp, getAssignedRequests } from '../../services/socialWorkerApi'
import { useAuth } from '../../hooks/useAuth'
import type { FollowUpDTO } from '../../services/socialWorkerApi'

const FOLLOW_UP_TYPES = ['Home Visit', 'Phone Call', 'Counseling Session', 'Office Visit', 'Follow-up']

export function SocialWorkerCalendarPage() {
  const { user } = useAuth()
  const userId = user?.userId ?? ''
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [requests, setRequests] = useState<{ id: string; trackingId?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newFollowUp, setNewFollowUp] = useState({
    type: 'Home Visit',
    childName: '',
    helpRequestId: '',
    notes: '',
    priority: 'MEDIUM',
  })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    Promise.all([getMyFollowUps(), getAssignedRequests(userId)])
      .then(([fu, reqs]) => {
        setFollowUps(fu)
        setRequests(reqs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = monthStart.getDay()
  const paddedDays = [...Array(startPad).fill(null), ...days]

  const getEventsForDay = (d: Date) =>
    followUps.filter(
      (f) =>
        f.scheduledDate &&
        isSameDay(new Date(f.scheduledDate), d)
    )

  const handleDayClick = (d: Date) => {
    setSelectedDate(d)
    setNewFollowUp((prev) => ({ ...prev, helpRequestId: '' }))
    setShowAddModal(true)
  }

  const handleAddFollowUp = async () => {
    if (!userId || !selectedDate) return
    setActionLoading(true)
    try {
      await createFollowUp({
        socialWorkerId: userId,
        helpRequestId: newFollowUp.helpRequestId || undefined,
        type: newFollowUp.type,
        childName: newFollowUp.childName || undefined,
        notes: newFollowUp.notes || undefined,
        priority: newFollowUp.priority,
        status: 'SCHEDULED',
        scheduledDate: selectedDate.toISOString(),
      })
      const fu = await getMyFollowUps()
      setFollowUps(fu)
      setShowAddModal(false)
      setSelectedDate(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to schedule')
    } finally {
      setActionLoading(false)
    }
  }

  const upcomingAlerts = followUps.filter(
    (f) =>
      f.scheduledDate &&
      new Date(f.scheduledDate) >= new Date() &&
      (f.status === 'UPCOMING' || f.status === 'SCHEDULED' || f.status === 'URGENT')
  ).length

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: '#2d6a4f' }} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Session Calendar</h1>
          <p className="text-muted mb-0">
            Schedule visits, counseling sessions, and follow-ups. Click a day to add an event.
          </p>
        </div>
        {upcomingAlerts > 0 && (
          <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#2d6a4f' }}>
            {upcomingAlerts} upcoming session{upcomingAlerts > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button variant="outline-secondary" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              ← Prev
            </Button>
            <h5 className="mb-0">{format(currentMonth, 'MMMM yyyy')}</h5>
            <Button variant="outline-secondary" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              Next →
            </Button>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 4 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="small text-muted text-center" style={{ width: 'calc(14.28% - 4px)', minWidth: 60 }}>
                {d}
              </div>
            ))}
            {paddedDays.map((d, i) => (
              <div
                key={i}
                className="rounded border p-2"
                style={{
                  width: 'calc(14.28% - 4px)',
                  minWidth: 60,
                  minHeight: 80,
                  cursor: d ? 'pointer' : 'default',
                  backgroundColor: d && isSameMonth(d, currentMonth) ? '#fff' : '#f8f9fa',
                  borderColor: d && isSameDay(d, new Date()) ? '#2d6a4f' : '#dee2e6',
                }}
                onClick={() => d && handleDayClick(d)}
              >
                {d && (
                  <>
                    <div className="small fw-bold">{format(d, 'd')}</div>
                    <div className="small">
                      {getEventsForDay(d).slice(0, 2).map((f) => (
                        <div key={f.id} className="text-truncate" style={{ fontSize: 10, color: '#2d6a4f' }}>
                          {f.type || 'Session'}
                        </div>
                      ))}
                      {getEventsForDay(d).length > 2 && (
                        <div className="small text-muted">+{getEventsForDay(d).length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Session / Follow-up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            {selectedDate && `Date: ${format(selectedDate, 'PPP')}`}
          </p>
          <Form.Group className="mb-2">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={newFollowUp.type}
              onChange={(e) => setNewFollowUp({ ...newFollowUp, type: e.target.value })}
            >
              {FOLLOW_UP_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Linked Request (optional)</Form.Label>
            <Form.Select
              value={newFollowUp.helpRequestId}
              onChange={(e) => setNewFollowUp({ ...newFollowUp, helpRequestId: e.target.value })}
            >
              <option value="">None</option>
              {requests.map((req) => (
                <option key={req.id} value={req.id}>{req.trackingId || req.id}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Child / Context Name (optional)</Form.Label>
            <Form.Control
              value={newFollowUp.childName}
              onChange={(e) => setNewFollowUp({ ...newFollowUp, childName: e.target.value })}
              placeholder="e.g. Child name or family"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={newFollowUp.notes}
              onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Priority</Form.Label>
            <Form.Select
              value={newFollowUp.priority}
              onChange={(e) => setNewFollowUp({ ...newFollowUp, priority: e.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button className="sw-btn-primary" onClick={handleAddFollowUp} disabled={actionLoading}>
            {actionLoading ? 'Scheduling...' : 'Schedule'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

import { useMemo } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Row, Col, Spinner, Table } from 'react-bootstrap'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import {
  getAssignedRequests,
  getMyFollowUps,
  getOffersByWorker,
  getNotifications,
  getActiveAnnouncements,
  updateFollowUp,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO, AnnouncementDTO } from '../../types/dashboard'
import type { FollowUpDTO } from '../../services/socialWorkerApi'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import { SystemAnnouncementCard } from '../../components/social-worker/SystemAnnouncementCard'

// Chart colors
const CHART_COLORS = {
  ASSIGNED: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
  REJECTED: '#ef4444',
  CANCELLED: '#6b7280',
  UNDER_REVIEW: '#8b5cf6',
  REQUESTED: '#94a3b8',
}

const PIE_COLORS = {
  COUNSELING: '#2d6a4f',
  FOOD_ASSISTANCE: '#40916c',
  EDUCATION_SUPPORT: '#52b788',
  MEDICAL_HELP: '#74c69d',
  SHELTER: '#95d5b2',
  CLOTHING: '#b7e4c7',
  LEGAL_PROTECTION: '#0f766e',
  LIVELIHOOD_EMPLOYMENT: '#0369a1',
  DISABILITY_SUPPORT: '#4b5563',
  EMERGENCY_DISASTER: '#b91c1c',
  OTHER: '#d8f3dc',
}

function normalizeSocialWorkerLink(actionUrl?: string): string | undefined {
  if (!actionUrl) return undefined
  try {
    const parsed = new URL(actionUrl, window.location.origin)
    if (parsed.origin !== window.location.origin) return '/social-worker/notifications'
    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`
    return normalized.startsWith('/social-worker/') || normalized === '/social-worker'
      ? normalized
      : '/social-worker/notifications'
  } catch {
    return '/social-worker/notifications'
  }
}

export function SocialWorkerDashboard() {
  const { user } = useAuth()
  const userId = user?.userId ?? ''
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [notifications, setNotifications] = useState<{ id: string; title?: string; message?: string; read: boolean; actionUrl?: string }[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date())
  const [scheduleActionLoading, setScheduleActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    let cancelled = false
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setError('Request timed out. Check your connection and try again.')
        setLoading(false)
      }
    }, 15000)
    Promise.all([
      getAssignedRequests(userId),
      getMyFollowUps(),
      getOffersByWorker(userId),
      getNotifications().catch(() => []),
      getActiveAnnouncements().catch(() => []),
    ])
      .then(([reqs, follow, offers, notifs, ann]) => {
        if (cancelled) return
        setRequests(Array.isArray(reqs) ? reqs : [])
        setFollowUps(Array.isArray(follow) ? follow : [])
        setNotifications(Array.isArray(notifs) ? notifs : [])
        setAnnouncements(Array.isArray(ann) ? ann : [])
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) {
          window.clearTimeout(timeout)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [userId])

  // Overdue: follow-ups past scheduled date and not completed
  const overdueRows = useMemo(() => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const msPerDay = 24 * 60 * 60 * 1000
    const rows: { helpRequestId: string; requestId: string; type: string; overdueReason: string; daysLate: number; followUpId: string }[] = []
    followUps.forEach((fu) => {
      if (!fu.helpRequestId || !fu.scheduledDate) return
      const scheduled = new Date(fu.scheduledDate)
      if (Number.isNaN(scheduled.getTime())) return
      scheduled.setHours(0, 0, 0, 0) // compare calendar days in local time
      const isCompleted = fu.status === 'COMPLETED' || fu.status === 'DONE'
      if (isCompleted || scheduled >= todayStart) return
      const request = requests.find((r) => r.id === fu.helpRequestId)
      const requestId = request?.trackingId || fu.helpRequestId?.slice(0, 8) || '-'
      const typeLabel = request?.helpType ? (HELP_TYPE_LABELS[request.helpType] ?? request.helpType) : 'Request'
      const daysLate = Math.max(0, Math.floor((todayStart.getTime() - scheduled.getTime()) / msPerDay))
      const overdueReason = fu.type || 'Follow-up'
      rows.push({
        helpRequestId: fu.helpRequestId,
        requestId,
        type: typeLabel,
        overdueReason,
        daysLate,
        followUpId: fu.id,
      })
    })
    return rows.sort((a, b) => b.daysLate - a.daysLate)
  }, [followUps, requests])

  function toDateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // Tasks for selected day (from follow-ups on that date)
  const scheduleTasksForSelectedDay = useMemo(() => {
    const key = toDateKey(selectedScheduleDate)
    return followUps
      .filter((fu) => {
        if (!fu.scheduledDate) return false
        const sd = new Date(fu.scheduledDate)
        if (Number.isNaN(sd.getTime())) return false
        return toDateKey(sd) === key
      })
      .sort((a, b) => {
        const ta = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0
        const tb = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0
        return ta - tb
      })
  }, [followUps, selectedScheduleDate])

  // Dates that have tasks (for calendar highlight) in visible month
  const datesWithTasks = useMemo(() => {
    const set = new Set<string>()
    const y = calendarMonth.getFullYear()
    const m = calendarMonth.getMonth()
    followUps.forEach((fu) => {
      if (!fu.scheduledDate) return
      const d = new Date(fu.scheduledDate)
      if (Number.isNaN(d.getTime())) return
      if (d.getFullYear() === y && d.getMonth() === m) set.add(toDateKey(d))
    })
    return set
  }, [followUps, calendarMonth])

  const handleMarkComplete = async (followUpId: string) => {
    setScheduleActionLoading(followUpId)
    try {
      const updated = await updateFollowUp(followUpId, { status: 'COMPLETED' })
      setFollowUps((prev) => prev.map((f) => (f.id === followUpId ? updated : f)))
    } catch {
      setError('Failed to mark task complete.')
    } finally {
      setScheduleActionLoading(null)
    }
  }

  // Latest 4 requests for Recent Activities (must be before early returns to keep hook order)
  const recentActivities = useMemo(() => {
    return [...requests]
      .sort((a, b) => {
        const da = a.requestDate || ''
        const db = b.requestDate || ''
        return new Date(db).getTime() - new Date(da).getTime()
      })
      .slice(0, 4)
  }, [requests])

  const statusLabel = (s?: string) => {
    if (!s) return '—'
    const map: Record<string, string> = {
      ASSIGNED: 'Assigned',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      REJECTED: 'Rejected',
      CANCELLED: 'Cancelled',
      UNDER_REVIEW: 'Under Review',
      REQUESTED: 'Requested',
    }
    return map[s] || s.replace(/_/g, ' ')
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: '#2d6a4f' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    )
  }

  // Analytics metrics
  const totalAssigned = requests.length
  const pendingAcceptance = requests.filter((r) => r.status === 'ASSIGNED').length
  const activeRequests = requests.filter((r) => r.status === 'IN_PROGRESS').length
  const completedRequests = requests.filter((r) => r.status === 'COMPLETED').length
  const rejectedRequests = requests.filter((r) => r.status === 'REJECTED').length
  const completionRate = totalAssigned > 0 ? Math.round((completedRequests / totalAssigned) * 100) : 0

  // Status distribution for bar chart
  const statusData = [
    { status: 'Assigned', count: requests.filter((r) => r.status === 'ASSIGNED').length, color: CHART_COLORS.ASSIGNED },
    { status: 'In Progress', count: requests.filter((r) => r.status === 'IN_PROGRESS').length, color: CHART_COLORS.IN_PROGRESS },
    { status: 'Completed', count: requests.filter((r) => r.status === 'COMPLETED').length, color: CHART_COLORS.COMPLETED },
    { status: 'Closed/Rejected', count: requests.filter((r) => r.status === 'REJECTED' || r.status === 'CANCELLED').length, color: CHART_COLORS.REJECTED },
  ]

  // Line chart: requests by month
  const requestsByMonth = requests.reduce<Record<string, number>>((acc, r) => {
    const d = r.requestDate ? new Date(r.requestDate) : new Date()
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const lineData = Object.entries(requestsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month: month.replace('-', '/'), count }))

  // Helper for empty data visualization
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-light shadow-sm rounded">
          <p className="mb-0 small fw-bold">{label}</p>
          <p className="mb-0 small" style={{ color: payload[0].color }}>
            {`${payload[0].name}: ${payload[0].value}`}
          </p>
        </div>
      )
    }
    return null
  }

  // Pie chart: service package distribution
  const typeDistribution = Object.entries(HELP_TYPE_LABELS).map(([k, v]) => ({
    type: v,
    key: k,
    count: requests.filter((r) => r.helpType === k).length,
    color: (PIE_COLORS as Record<string, string>)[k] || '#6b7280'
  })).filter((d) => d.count > 0)

  const statCards = [
    { title: 'Total Assigned', value: totalAssigned, sub: 'Help requests assigned to you', color: '#2d6a4f', icon: '📋' },
    { title: 'Active Requests', value: activeRequests, sub: 'Currently in progress', color: '#40916c', icon: '🔄' },
    { title: 'Completed', value: completedRequests, sub: 'Resolved or closed', color: '#22c55e', icon: '✅' },
    { title: 'Pending Acceptance', value: pendingAcceptance, sub: 'Awaiting your acceptance', color: '#f59e0b', icon: '⏳' },
    { title: 'Rejected Packages', value: rejectedRequests, sub: 'Service packages declined', color: '#ef4444', icon: '❌' },
  ]

  const alerts = [
    ...notifications.filter((n) => !n.read).slice(0, 5).map((n) => ({
      type: 'info' as const,
      title: n.title || 'Notification',
      message: n.message,
      link: normalizeSocialWorkerLink(n.actionUrl),
    })),
    ...requests.filter((r) => r.status === 'ASSIGNED').slice(0, 2).map((r) => ({
      type: 'assignment' as const,
      title: 'New Assignment',
      message: `${r.trackingId || r.id?.slice(0, 8)} - Accept or decline`,
      link: `/social-worker/requests/${r.id}`,
    })),
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Care & Support Dashboard</h1>
        <p className="text-muted mb-0">
          Manage assigned help requests, deliver services, and track performance.
        </p>
      </div>

      <SystemAnnouncementCard announcements={announcements} />

          <Row className="g-3 mb-4">
            {statCards.map((card) => (
              <Col key={card.title} xs={12} sm={6} lg={4} xl>
                <Card className="border-0 shadow-sm rounded-3 h-100 sw-stat-card">
                  <Card.Body className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 48, height: 48, backgroundColor: `${card.color}18` }}
                    >
                      <span className="fs-4">{card.icon}</span>
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="text-muted small">{card.title}</div>
                      <div className="fw-bold fs-4" style={{ color: card.color }}>{card.value}</div>
                      <div className="text-muted small">{card.sub}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="border-0 shadow-sm rounded-3 mb-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Completion Rate</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="flex-grow-1">
                  <div className="progress" style={{ height: 20, borderRadius: 10 }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${completionRate}%`, backgroundColor: '#2d6a4f' }}
                    />
                  </div>
                </div>
                <span className="fw-bold" style={{ color: '#2d6a4f', minWidth: 60 }}>{completionRate}%</span>
              </div>
              <p className="text-muted small mb-0 mt-2">Completed requests out of total assigned</p>
            </Card.Body>
          </Card>

          {alerts.length > 0 && (
            <Card className="border-0 shadow-sm rounded-3 mb-4 border-start border-4" style={{ borderLeftColor: '#2d6a4f' }}>
              <Card.Header className="bg-white border-0 pt-3">
                <h5 className="mb-0">Alerts & Notifications</h5>
              </Card.Header>
              <Card.Body className="py-2">
                {alerts.map((a, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 p-2 rounded bg-light mb-2">
                    <span className="badge" style={{ backgroundColor: a.type === 'assignment' ? '#2d6a4f' : '#6b7280' }}>
                      {a.type === 'assignment' ? 'New' : 'Info'}
                    </span>
                    <div className="flex-grow-1">
                      <strong className="small">{a.title}</strong>
                      <p className="mb-0 text-muted small">{a.message}</p>
                    </div>
                    {a.link && (
                  <Link to={a.link} className="btn btn-sm sw-btn-primary">View</Link>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}

      <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-0 pt-3">
          <h5 className="mb-0 fw-bold">Recent Activities</h5>
          <p className="mb-0 text-muted small">Latest 4 requests</p>
                </Card.Header>
        <Card.Body className="p-0">
          {recentActivities.length === 0 ? (
            <div className="p-4 text-center text-muted small">No recent requests.</div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-600 text-muted small py-3 ps-3">Request ID</th>
                  <th className="fw-600 text-muted small py-3">Category</th>
                  <th className="fw-600 text-muted small py-3">Status</th>
                  <th className="fw-600 text-muted small py-3 pe-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 ps-3">
                      <span className="fw-600 text-dark">{r.trackingId || r.id?.slice(0, 8) || '—'}</span>
                    </td>
                    <td className="py-3 text-muted small">
                      {r.helpType ? (HELP_TYPE_LABELS[r.helpType] ?? r.helpType) : '—'}
                    </td>
                    <td className="py-3">
                      <span className="badge rounded-pill" style={{ backgroundColor: (CHART_COLORS as Record<string, string>)[r.status ?? ''] || '#6b7280', color: '#fff' }}>
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="py-3 pe-3 text-end">
                      <Link to={`/social-worker/requests/${r.id}`} className="btn btn-sm sw-btn-primary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
                </Card.Body>
              </Card>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={6}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-0 pt-3 d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold">Overdue Requests</h5>
              {overdueRows.length > 0 && (
                <span className="badge bg-danger rounded-pill">{overdueRows.length}</span>
              )}
                </Card.Header>
            <Card.Body className="p-0">
              {overdueRows.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  No overdue requests. All follow-ups are up to date.
                    </div>
                  ) : (
                <Table responsive hover className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="fw-600 text-muted small py-3 ps-3">Request ID</th>
                      <th className="fw-600 text-muted small py-3">Type</th>
                      <th className="fw-600 text-muted small py-3">Overdue Reason</th>
                      <th className="fw-600 text-muted small py-3 text-center">Days Late</th>
                      <th className="fw-600 text-muted small py-3 pe-3 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueRows.map((row) => (
                      <tr key={`${row.helpRequestId}-${row.followUpId}`}>
                        <td className="py-3 ps-3">
                          <span className="fw-600 text-dark">{row.requestId}</span>
                        </td>
                        <td className="py-3 text-muted small">{row.type}</td>
                        <td className="py-3 small">{row.overdueReason}</td>
                        <td className="py-3 text-center">
                          <span className="badge bg-danger rounded-pill">{row.daysLate}</span>
                        </td>
                    <td className="py-3 pe-3 text-end">
                      <Link
                        to={`/social-worker/requests/${row.helpRequestId}`}
                        className="btn btn-sm btn-outline-secondary me-1"
                      >
                        View
                      </Link>
                      <Link
                        to={`/social-worker/requests/${row.helpRequestId}`}
                        className="btn btn-sm sw-btn-primary"
                      >
                        Update
                      </Link>
                    </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>

        <Col xs={12} lg={6}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
                <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0 fw-bold">Today&apos;s Schedule</h5>
              <p className="mb-0 text-muted small">Tasks for selected day. Click a date to view.</p>
                </Card.Header>
            <Card.Body>
              {/* Mini calendar */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() =>
                      setCalendarMonth((m) => {
                        const n = new Date(m)
                        n.setMonth(n.getMonth() - 1)
                        return n
                      })
                    }
                  >
                    ‹
                  </Button>
                  <span className="fw-600 small">
                    {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() =>
                      setCalendarMonth((m) => {
                        const n = new Date(m)
                        n.setMonth(n.getMonth() + 1)
                        return n
                      })
                    }
                  >
                    ›
                  </Button>
                </div>
                <div className="small">
                  <div className="d-flex flex-wrap mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-muted" style={{ width: '14.28%', minWidth: 28 }}>
                        {day.slice(0, 1)}
                      </div>
                    ))}
                  </div>
                  {(() => {
                    const year = calendarMonth.getFullYear()
                    const month = calendarMonth.getMonth()
                    const first = new Date(year, month, 1)
                    const last = new Date(year, month + 1, 0)
                    const startPad = first.getDay()
                    const daysInMonth = last.getDate()
                    const todayKey = toDateKey(new Date())
                    const selectedKey = toDateKey(selectedScheduleDate)
                    const cells: React.ReactNode[] = []
                    for (let i = 0; i < startPad; i++) {
                      cells.push(<div key={`pad-${i}`} style={{ width: '14.28%', minWidth: 28, height: 28 }} />)
                    }
                    for (let d = 1; d <= daysInMonth; d++) {
                      const date = new Date(year, month, d)
                      const key = toDateKey(date)
                      const hasTasks = datesWithTasks.has(key)
                      const isToday = key === todayKey
                      const isSelected = key === selectedKey
                      cells.push(
                        <button
                          key={key}
                          type="button"
                          className="border-0 rounded bg-transparent small text-center d-inline-flex align-items-center justify-content-center"
                          style={{
                            width: '14.28%',
                            minWidth: 28,
                            height: 28,
                            backgroundColor: isSelected ? '#2d6a4f' : hasTasks ? 'rgba(45, 106, 79, 0.2)' : undefined,
                            color: isSelected ? '#fff' : isToday ? '#2d6a4f' : undefined,
                            fontWeight: isToday ? 'bold' : undefined,
                          }}
                          onClick={() => {
                            setSelectedScheduleDate(date)
                            if (date.getMonth() !== calendarMonth.getMonth()) {
                              setCalendarMonth(new Date(date.getFullYear(), date.getMonth()))
                            }
                          }}
                        >
                          {d}
                        </button>
                      )
                    }
                    return <div className="d-flex flex-wrap">{cells}</div>
                  })()}
                </div>
              </div>

              {/* Task list for selected day */}
              <div className="mt-3">
                <p className="small text-muted mb-2">
                  {selectedScheduleDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' — '}
                  {scheduleTasksForSelectedDay.length} task(s)
                </p>
                {scheduleTasksForSelectedDay.length === 0 ? (
                  <p className="text-muted small mb-0">No tasks for this day.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {scheduleTasksForSelectedDay.map((fu) => {
                      const request = requests.find((r) => r.id === fu.helpRequestId)
                      const requestId = request?.trackingId || fu.helpRequestId?.slice(0, 8) || '-'
                      const timeStr = fu.scheduledDate
                        ? new Date(fu.scheduledDate).toLocaleTimeString(undefined, {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : '—'
                      const taskLabel = fu.type ? fu.type.replace(/_/g, ' ') : 'Follow-up'
                      const isCompleted = fu.status === 'COMPLETED' || fu.status === 'DONE'
                      const loadingThis = scheduleActionLoading === fu.id
                      return (
                        <div
                          key={fu.id}
                          className="border rounded p-2 bg-light"
                          style={{ borderColor: 'rgba(45, 106, 79, 0.3)' }}
                        >
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="small fw-600">⏰ {timeStr}</span>
                          </div>
                          <div className="small mb-1">
                            <strong>Task:</strong> {taskLabel}
                            {fu.notes ? ` – ${fu.notes}` : ''}
                          </div>
                          <div className="small text-muted mb-1">
                            <strong>Request:</strong> {requestId}
                          </div>
                          <div className="small mb-2">
                            <strong>Status:</strong>{' '}
                            <span className={isCompleted ? 'text-success' : 'text-warning'}>
                              {isCompleted ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                          <div className="d-flex gap-1 flex-wrap">
                            {!isCompleted && (
                              <Button
                                size="sm"
                                variant="success"
                                disabled={!!scheduleActionLoading}
                                onClick={() => handleMarkComplete(fu.id)}
                              >
                                {loadingThis ? '…' : 'Mark Complete'}
                              </Button>
                            )}
                            <Link
                              to={`/social-worker/requests/${fu.helpRequestId}`}
                              className="btn btn-sm btn-outline-secondary"
                            >
                              Reschedule
                            </Link>
                          </div>
                    </div>
                      )
                    })}
                  </div>
                )}
              </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
    </div>
  )
}

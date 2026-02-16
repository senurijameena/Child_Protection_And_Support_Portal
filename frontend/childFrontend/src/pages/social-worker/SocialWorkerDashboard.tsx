import { useMemo } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Row, Col, Spinner, Table, Modal, Form } from 'react-bootstrap'
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
  getSocialWorkerCompletedRequests,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO, AnnouncementDTO } from '../../types/dashboard'
import type { FollowUpDTO, CompletedRequestRow } from '../../services/socialWorkerApi'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import { SystemAnnouncementCard } from '../../components/social-worker/SystemAnnouncementCard'
import './SocialWorkerDashboard.css'

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
  const [completedRows, setCompletedRows] = useState<CompletedRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date())
  const [scheduleActionLoading, setScheduleActionLoading] = useState<string | null>(null)
  const [rescheduleModal, setRescheduleModal] = useState<{ id: string; date: string } | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')

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
    // SW-VIVA-1: Dashboard bootstrap call.
    // Loads assigned requests, follow-ups, notifications, announcements, and completed feedback rows in one place.
    Promise.all([
      getAssignedRequests(userId),
      getMyFollowUps(),
      getOffersByWorker(userId),
      getNotifications().catch(() => []),
      getActiveAnnouncements().catch(() => []),
      getSocialWorkerCompletedRequests().catch(() => []),
    ])
      .then(([reqs, follow, offers, notifs, ann, completed]) => {
        if (cancelled) return
        setRequests(Array.isArray(reqs) ? reqs : [])
        setFollowUps(Array.isArray(follow) ? follow : [])
        setNotifications(Array.isArray(notifs) ? notifs : [])
        setAnnouncements(Array.isArray(ann) ? ann : [])
        setCompletedRows(Array.isArray(completed) ? completed : [])
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
        if (fu.status === 'COMPLETED' || fu.status === 'DONE' || fu.status === 'ARCHIVED') return false
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
      if (fu.status === 'COMPLETED' || fu.status === 'DONE' || fu.status === 'ARCHIVED') return
      const d = new Date(fu.scheduledDate)
      if (Number.isNaN(d.getTime())) return
      if (d.getFullYear() === y && d.getMonth() === m) set.add(toDateKey(d))
    })
    return set
  }, [followUps, calendarMonth])

  const handleMarkComplete = async (followUpId: string) => {
    // SW-VIVA-2: Follow-up task completion action from dashboard schedule.
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

  const openRescheduleModal = (followUpId: string, currentScheduledDate?: string) => {
    const initialDate =
      currentScheduledDate && !Number.isNaN(new Date(currentScheduledDate).getTime())
        ? currentScheduledDate.slice(0, 10)
        : toDateKey(new Date())
    setRescheduleModal({ id: followUpId, date: initialDate })
    setRescheduleDate(initialDate)
  }

  const handleReschedule = async () => {
    // SW-VIVA-3: Follow-up reschedule action from dashboard schedule.
    if (!rescheduleModal?.id || !rescheduleDate) return
    setScheduleActionLoading(`reschedule-${rescheduleModal.id}`)
    try {
      const updated = await updateFollowUp(rescheduleModal.id, {
        scheduledDate: `${rescheduleDate}T09:00:00`,
        status: 'SCHEDULED',
      })
      setFollowUps((prev) => prev.map((f) => (f.id === rescheduleModal.id ? updated : f)))
      setRescheduleModal(null)
      setRescheduleDate('')
    } catch {
      setError('Failed to reschedule task.')
    } finally {
      setScheduleActionLoading(null)
    }
  }

  // Latest active requests first for Recent Activities (must be before early returns to keep hook order)
  const recentActivities = useMemo(() => {
    const activeStatuses = new Set(['ASSIGNED', 'IN_PROGRESS', 'PACKAGE_PROPOSED'])
    const activeRequests = requests.filter((r) => r.status && activeStatuses.has(r.status))
    const source = activeRequests.length > 0 ? activeRequests : requests
    return [...source]
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
      CLOSED: 'Closed',
      ARCHIVED: 'Archived',
      REJECTED: 'Rejected',
      CANCELLED: 'Cancelled',
      UNDER_REVIEW: 'Under Review',
      REQUESTED: 'Requested',
    }
    return map[s] || s.replace(/_/g, ' ')
  }

  const renderStars = (rating?: number | string) => {
    const value = Number(rating)
    if (!value || Number.isNaN(value)) return '—'
    return '⭐'.repeat(Math.min(5, Math.max(1, value)))
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
    { title: 'Total Assigned', value: totalAssigned, sub: 'All Requests', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', icon: '📋' },
    { title: 'Active Now', value: activeRequests, sub: 'In Progress', color: '#60a5fa', gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', icon: '🔄' },
    { title: 'Completed', value: completedRequests, sub: 'Done', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)', icon: '✅' },
    { title: 'Pending', value: pendingAcceptance, sub: 'Awaiting Response', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)', icon: '⏳' },
    { title: 'Rejected', value: rejectedRequests, sub: 'Declined', color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)', icon: '❌' },
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

  const now = new Date()
  const currentDate = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const currentTime = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const socialWorkerName = user?.fullName?.trim() || 'Social Worker'

  return (
    <div className="sw-dashboard animate-fade-in-up">
      <div
        className="mb-4 p-4 rounded-3 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white'
        }}
      >
        <div className="d-flex align-items-center gap-3 mb-2">
          <span style={{ fontSize: '2.5rem' }}>🏥</span>
          <div>
            <h1 className="h2 fw-bold mb-1">Welcome again, {socialWorkerName}</h1>
            <p className="mb-0" style={{ opacity: 0.9, fontSize: '0.95rem' }}>
              {currentDate} | {currentTime}
            </p>
          </div>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {statCards.map((card) => (
          <Col key={card.title} xs={12} sm={6} lg={4} xl>
            <Card
              className="border-0 shadow-sm rounded-3 h-100 sw-stat-card position-relative overflow-hidden"
              style={{
                background: card.gradient,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <span className="fs-3">{card.icon}</span>
                  </div>
                </div>
                <div className="text-white">
                  <div className="fw-bold display-6 mb-1">{card.value}</div>
                  <div className="fw-semibold mb-0" style={{ fontSize: '0.95rem', opacity: 0.95 }}>
                    {card.title}
                  </div>
                  <div className="small mt-1" style={{ opacity: 0.8 }}>
                    {card.sub}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm rounded-3 mb-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
        <Card.Header className="bg-transparent border-0 pt-3">
          <h5 className="mb-0 fw-bold" style={{ color: '#0369a1' }}>📊 Completion Rate</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex align-items-center gap-3">
            <div className="flex-grow-1">
              <div className="progress" style={{ height: 24, borderRadius: 12, backgroundColor: 'rgba(3, 105, 161, 0.1)' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${completionRate}%`,
                    background: 'linear-gradient(90deg, #06b6d4 0%, #0369a1 100%)',
                    borderRadius: 12
                  }}
                />
              </div>
            </div>
            <span className="fw-bold fs-4" style={{ color: '#0369a1', minWidth: 70 }}>{completionRate}%</span>
          </div>
          <p className="text-muted small mb-0 mt-2">✓ Completed / Total Assigned</p>
        </Card.Body>
      </Card>

      {alerts.length > 0 && (
        <Card className="border-0 shadow-sm rounded-3 mb-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
          <Card.Header className="bg-transparent border-0 pt-3">
            <h5 className="mb-0 fw-bold" style={{ color: '#92400e' }}>🔔 Alerts & Notifications</h5>
          </Card.Header>
          <Card.Body className="py-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className="d-flex align-items-center gap-2 p-3 rounded mb-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(146, 64, 14, 0.1)'
                }}
              >
                <span
                  className="badge rounded-pill px-3"
                  style={{
                    backgroundColor: a.type === 'assignment' ? '#10b981' : '#3b82f6',
                    fontSize: '0.75rem'
                  }}
                >
                  {a.type === 'assignment' ? '🆕 New' : 'ℹ️ Info'}
                </span>
                <div className="flex-grow-1">
                  <strong className="small d-block" style={{ color: '#92400e' }}>{a.title}</strong>
                  <p className="mb-0 small" style={{ color: '#78350f' }}>{a.message}</p>
                </div>
                {a.link && (
                  <Link
                    to={a.link}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: '#92400e',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      <Card className="border-0 shadow-sm rounded-3 mb-4" style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)' }}>
        <Card.Header className="bg-transparent border-0 pt-3">
          <h5 className="mb-0 fw-bold" style={{ color: '#6b21a8' }}>📌 Recent Activities</h5>
          <p className="mb-0 small" style={{ color: '#7c3aed' }}>Latest 4 requests</p>
        </Card.Header>
        <Card.Body className="p-0">
          {recentActivities.length === 0 ? (
            <div className="p-4 text-center text-muted small">No recent requests.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead style={{ background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)' }}>
                  <tr>
                    <th className="fw-600 small py-3 ps-3 text-white">Request ID</th>
                    <th className="fw-600 small py-3 text-white">Category</th>
                    <th className="fw-600 small py-3 text-white">Status</th>
                    <th className="fw-600 small py-3 pe-3 text-end text-white">Action</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                  {recentActivities.map((r, idx) => (
                    <tr
                      key={r.id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? 'rgba(243, 232, 255, 0.3)' : 'rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      <td className="py-3 ps-3">
                        <span className="fw-600" style={{ color: '#6b21a8' }}>
                          {r.trackingId || r.id?.slice(0, 8) || '—'}
                        </span>
                      </td>
                      <td className="py-3 small" style={{ color: '#7c3aed' }}>
                        {r.helpType ? (HELP_TYPE_LABELS[r.helpType] ?? r.helpType) : '—'}
                      </td>
                      <td className="py-3">
                        <span
                          className="badge rounded-pill px-3"
                          style={{
                            backgroundColor: (CHART_COLORS as Record<string, string>)[r.status ?? ''] || '#6b7280',
                            color: '#fff',
                            fontSize: '0.75rem'
                          }}
                        >
                          {statusLabel(r.status)}
                        </span>
                      </td>
                      <td className="py-3 pe-3 text-end">
                        <Link
                          to={`/social-worker/requests/${r.id}`}
                          className="btn btn-sm"
                          style={{
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={6}>
          <Card
            className="border-0 shadow-sm rounded-3 h-100"
            style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}
          >
            <Card.Header className="bg-transparent border-0 pt-3 d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold" style={{ color: '#991b1b' }}>⚠️ Overdue Requests</h5>
              {overdueRows.length > 0 && (
                <span
                  className="badge rounded-pill"
                  style={{ backgroundColor: '#dc2626', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                >
                  {overdueRows.length}
                </span>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              {overdueRows.length === 0 ? (
                <div className="p-4 text-center small" style={{ color: '#991b1b' }}>
                  ✓ No overdue requests. All follow-ups are up to date.
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead style={{ background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)' }}>
                      <tr>
                        <th className="fw-600 small py-3 ps-3 text-white">Request ID</th>
                        <th className="fw-600 small py-3 text-white">Type</th>
                        <th className="fw-600 small py-3 text-white">Reason</th>
                        <th className="fw-600 small py-3 text-center text-white">Days</th>
                        <th className="fw-600 small py-3 pe-3 text-end text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                      {overdueRows.map((row, idx) => (
                        <tr
                          key={`${row.helpRequestId}-${row.followUpId}`}
                          style={{
                            backgroundColor: idx % 2 === 0 ? 'rgba(254, 226, 226, 0.4)' : 'rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          <td className="py-3 ps-3">
                            <span className="fw-600" style={{ color: '#991b1b' }}>{row.requestId}</span>
                          </td>
                          <td className="py-3 small" style={{ color: '#b91c1c' }}>{row.type}</td>
                          <td className="py-3 small" style={{ color: '#b91c1c' }}>{row.overdueReason}</td>
                          <td className="py-3 text-center">
                            <span
                              className="badge rounded-pill"
                              style={{
                                backgroundColor: '#dc2626',
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.65rem'
                              }}
                            >
                              {row.daysLate}
                            </span>
                          </td>
                          <td className="py-3 pe-3 text-end">
                            <Link
                              to={`/social-worker/requests/${row.helpRequestId}`}
                              className="btn btn-sm me-1"
                              style={{
                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                color: '#991b1b',
                                border: '1px solid rgba(220, 38, 38, 0.3)',
                                fontSize: '0.75rem'
                              }}
                            >
                              View
                            </Link>
                            <Link
                              to={`/social-worker/requests/${row.helpRequestId}`}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                fontSize: '0.75rem'
                              }}
                            >
                              Update
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card
            className="border-0 shadow-sm rounded-3 h-100"
            style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
          >
            <Card.Header className="bg-transparent border-0 pt-3">
              <h5 className="mb-0 fw-bold" style={{ color: '#1e40af' }}>📅 Today&apos;s Schedule</h5>
              <p className="mb-0 small" style={{ color: '#2563eb' }}>Tasks for selected day</p>
            </Card.Header>
            <Card.Body>
              <div className="mb-3 d-flex align-items-center gap-2 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                <span style={{ fontSize: 24 }}>📆</span>
                <span className="fw-bold" style={{ fontSize: 18, color: '#1e3a8a' }}>
                  {selectedScheduleDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {scheduleTasksForSelectedDay.length === 0 ? (
                <div className="mt-3 small text-center p-4" style={{ color: '#1e40af', backgroundColor: 'rgba(255, 255, 255, 0.4)', borderRadius: '8px' }}>
                  ✓ No scheduled tasks for this day
                </div>
              ) : (
                <div className="mt-3">
                  {scheduleTasksForSelectedDay.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 mb-2 rounded"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(30, 64, 175, 0.2)'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="fw-semibold small" style={{ color: '#1e40af' }}>
                            {task.type || 'Task'}
                          </div>
                          <div className="small mt-1" style={{ color: '#2563eb' }}>
                            {task.notes || 'No description'}
                          </div>
                        </div>
                        <span
                          className={`badge ${task.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'}`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {task.status}
                        </span>
                      </div>
                      <div className="d-flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="success"
                          disabled={scheduleActionLoading === task.id}
                          onClick={() => handleMarkComplete(task.id)}
                        >
                          {scheduleActionLoading === task.id ? 'Completing…' : 'Complete'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          disabled={scheduleActionLoading === `reschedule-${task.id}`}
                          onClick={() => openRescheduleModal(task.id, task.scheduledDate)}
                        >
                          {scheduleActionLoading === `reschedule-${task.id}` ? 'Rescheduling…' : 'Reschedule'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-3 mb-4" style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)' }}>
        <Card.Header className="bg-transparent border-0 pt-3">
          <h5 className="mb-0 fw-bold" style={{ color: '#0f766e' }}>Completed Requests</h5>
          <p className="mb-0 small" style={{ color: '#0f766e' }}>Completed / closed / archived requests with feedback</p>
        </Card.Header>
        <Card.Body className="p-0">
          {completedRows.length === 0 ? (
            <div className="p-4 text-center small" style={{ color: '#0f766e' }}>
              No closed requests yet.
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead style={{ background: 'linear-gradient(90deg, #14b8a6 0%, #2dd4bf 100%)' }}>
                  <tr>
                    <th className="fw-600 small py-3 ps-3 text-white">Request ID</th>
                    <th className="fw-600 small py-3 text-white">Type</th>
                    <th className="fw-600 small py-3 text-white">Rating</th>
                    <th className="fw-600 small py-3 text-white">Feedback</th>
                    <th className="fw-600 small py-3 text-white">Closed Date</th>
                    <th className="fw-600 small py-3 pe-3 text-end text-white">Action</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                  {completedRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      style={{ backgroundColor: idx % 2 === 0 ? 'rgba(236, 254, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)' }}
                    >
                      <td className="py-3 ps-3">
                        <span className="fw-600" style={{ color: '#0f766e' }}>
                          {row.requestId || row.id?.slice(0, 8) || '—'}
                        </span>
                      </td>
                      <td className="py-3 small" style={{ color: '#0f766e' }}>
                        {row.type ? (HELP_TYPE_LABELS as Record<string, string>)[row.type] ?? row.type : '—'}
                      </td>
                      <td className="py-3 small" style={{ color: '#0f766e' }}>
                        {renderStars(row.rating)}
                      </td>
                      <td className="py-3 small" style={{ color: '#0f766e' }}>
                        {row.hasFeedback ? 'Yes' : 'No'}
                      </td>
                      <td className="py-3 small" style={{ color: '#0f766e' }}>
                        {row.closedDate ? new Date(row.closedDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 pe-3 text-end">
                        <Link
                          to={`/social-worker/feedback/${row.id}`}
                          className="btn btn-sm"
                          style={{
                            backgroundColor: '#0f766e',
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <SystemAnnouncementCard announcements={announcements} />

      <Modal show={!!rescheduleModal} onHide={() => setRescheduleModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">Reschedule Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="small">Choose another day</Form.Label>
            <Form.Control
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={toDateKey(new Date())}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setRescheduleModal(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleReschedule}
            disabled={!rescheduleDate || (scheduleActionLoading?.startsWith('reschedule-') ?? false)}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

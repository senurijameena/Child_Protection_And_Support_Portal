import { useEffect, useState } from 'react'
import { Card, Container, Row, Col, Form } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import { getAssignedRequests, getMyFollowUps, type FollowUpDTO } from '../../services/socialWorkerApi'
import type { HelpRequestDTO, HelpType } from '../../types/dashboard'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './SocialWorkerAnalytics.css'

interface MetricCardProps {
  label: string
  value: number
  icon: string
  color: string
  trend?: { value: number; direction: 'up' | 'down' }
}

interface DateRange {
  type: 'week' | 'month' | 'custom'
  startDate?: Date
  endDate?: Date
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']
const COLOR_MAP = {
  completed: '#10b981',
  pending: '#f59e0b',
  overdue: '#ef4444',
  inProgress: '#3b82f6',
  assigned: '#8b5cf6',
  emergency: '#ef4444',
  waitingUser: '#f59e0b',
}

export function SocialWorkerAnalyticsPage() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange>({ type: 'month' })
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!user?.userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [assignedRequests, followUpsData] = await Promise.all([
          getAssignedRequests(user.userId),
          getMyFollowUps(),
        ])

        if (!isMounted) return

        setRequests(assignedRequests)
        setFollowUps(followUpsData)
        setError(null)
      } catch (err) {
        console.error('Failed to load analytics data', err)
        setError((err as Error).message)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user?.userId])

  // Calculate metrics
  const metrics = {
    totalRequests: requests.length,
    inProgress: requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
    overdue: followUps.filter((f) => {
      if (!f.scheduledDate) return false
      const date = new Date(f.scheduledDate)
      return date < new Date() && f.status !== 'COMPLETED'
    }).length,
    activePending: requests.filter((r) => r.status === 'REQUESTED' || r.status === 'UNDER_REVIEW').length,
    totalFollowUps: followUps.length,
  }

  // Prepare chart data
  const getStatusDistribution = () => {
    return [
      {
        name: 'Assigned',
        value: requests.filter((r) => r.status === 'ASSIGNED').length,
        fill: COLOR_MAP.assigned,
      },
      {
        name: 'In Progress',
        value: requests.filter((r) => r.status === 'IN_PROGRESS').length,
        fill: COLOR_MAP.inProgress,
      },
      {
        name: 'Waiting for User',
        value: requests.filter((r) => r.status === 'REQUESTED' || r.status === 'UNDER_REVIEW').length,
        fill: COLOR_MAP.waitingUser,
      },
      {
        name: 'Completed',
        value: requests.filter((r) => r.status === 'COMPLETED').length,
        fill: COLOR_MAP.completed,
      },
      {
        name: 'Overdue',
        value: metrics.overdue,
        fill: COLOR_MAP.overdue,
      },
    ]
  }

  const getServiceDistribution = () => {
    const serviceMap: Record<string, number> = {}

    requests.forEach((req) => {
      const type = req.helpType || 'OTHER'
      const serviceType = getServiceTypeLabel(type as HelpType)
      serviceMap[serviceType] = (serviceMap[serviceType] || 0) + 1
    })

    return Object.entries(serviceMap).map(([name, value], idx) => ({
      name,
      value,
      fill: COLORS[idx % COLORS.length],
    }))
  }

  const getCompletionTimeData = () => {
    const typeMap: Record<string, { count: number; totalDays: number }> = {}

    requests
      .filter((r) => r.status === 'COMPLETED')
      .forEach((req) => {
        const type = getServiceTypeLabel((req.helpType as HelpType) || 'OTHER')
        if (!typeMap[type]) {
          typeMap[type] = { count: 0, totalDays: 0 }
        }

        if (req.requestDate) {
          const startDate = new Date(req.requestDate)
          const endDate = new Date()
          const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
          typeMap[type].totalDays += days
          typeMap[type].count += 1
        }
      })

    return Object.entries(typeMap)
      .map(([name, { totalDays, count }]) => ({
        name,
        'Avg Days': Math.round(totalDays / count),
      }))
      .sort((a, b) => b['Avg Days'] - a['Avg Days'])
  }

  const getFollowUpPerformance = () => {
    const completed = followUps.filter((f) => f.status === 'COMPLETED').length
    const pending = followUps.filter((f) => f.status !== 'COMPLETED').length
    const overdue = metrics.overdue

    return [
      { name: 'Completed', value: completed, fill: COLOR_MAP.completed },
      { name: 'Pending', value: pending - overdue, fill: COLOR_MAP.pending },
      { name: 'Overdue', value: overdue, fill: COLOR_MAP.overdue },
    ]
  }

  const getPriorityDistribution = () => {
    const highPriority = requests.filter((r) => r.priority === 'High').length
    const mediumPriority = requests.filter((r) => r.priority === 'Medium').length
    const lowPriority = requests.filter((r) => r.priority === 'Low').length
    const emergency = requests.filter((r) => r.priority === 'Emergency').length

    return [
      { name: 'High', value: highPriority, fill: '#ef4444' },
      { name: 'Medium', value: mediumPriority, fill: '#f59e0b' },
      { name: 'Low', value: lowPriority, fill: '#10b981' },
      { name: 'Emergency', value: emergency, fill: '#8b5cf6' },
    ]
  }

  const getTrendData = () => {
    // Create 30-day trend data
    const data = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      const newAssigned = requests.filter((r) => {
        if (!r.requestDate) return false
        const reqDate = new Date(r.requestDate)
        return reqDate.toDateString() === date.toDateString()
      }).length

      const completed = requests.filter((r) => {
        if (r.status !== 'COMPLETED' || !r.requestDate) return false
        const reqDate = new Date(r.requestDate)
        return reqDate.toDateString() === date.toDateString()
      }).length

      data.push({
        date: dateStr,
        'New Assigned': newAssigned,
        Completed: completed,
      })
    }

    return data
  }

  const MetricCard = ({ label, value, icon, color, trend }: MetricCardProps) => (
    <Card className="sw-metric-card border-0 h-100">
      <Card.Body className="p-4">
        <div className="d-flex align-items-start justify-content-between">
          <div className="flex-grow-1">
            <p className="text-muted small fw-600 mb-2">{label}</p>
            <div className="d-flex align-items-baseline gap-3">
              <h3 className="mb-0 fw-700" style={{ color }}>
                {value}
              </h3>
              {trend && (
                <span className={`small fw-600 ${trend.direction === 'up' ? 'text-success' : 'text-danger'}`}>
                  {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className="metric-icon" style={{ fontSize: '2rem', opacity: 0.7 }}>
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  )

  const getServiceTypeLabel = (type: HelpType): string => {
    const labels: Record<HelpType, string> = {
      FOOD_ASSISTANCE: 'Food',
      EDUCATION_SUPPORT: 'Education',
      MEDICAL_HELP: 'Medical',
      SHELTER: 'Shelter',
      CLOTHING: 'Clothing',
      COUNSELING: 'Counseling',
      LEGAL_PROTECTION: 'Legal',
      LIVELIHOOD_EMPLOYMENT: 'Livelihood',
      DISABILITY_SUPPORT: 'Disability',
      EMERGENCY_DISASTER: 'Emergency',
      OTHER: 'Other',
    }
    return labels[type] || 'Other'
  }

  if (loading) {
    return (
      <Container fluid className="py-4 sw-analytics">
        <div className="text-center py-5">
          <p className="text-muted">Loading analytics...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4 sw-analytics">
      {error && (
        <Row className="mb-4">
          <Col xs={12}>
            <div className="alert alert-danger mb-0 small">{error}</div>
          </Col>
        </Row>
      )}

      {/* Header */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="sw-analytics-header mb-4">
            <h1 className="h2 fw-700 mb-1">📈 Analytics Dashboard</h1>
            <p className="text-muted mb-0">Monitor your workload, performance metrics, and service distribution.</p>
          </div>
        </Col>
      </Row>

      {/* Filters & Controls */}
      <Row className="mb-5 g-3">
        <Col xs={12} md={6} lg={4}>
          <Form.Group>
            <Form.Label className="small fw-600 mb-2">Date Range</Form.Label>
            <Form.Select
              size="sm"
              value={dateRange.type}
              onChange={(e) => setDateRange({ type: e.target.value as DateRange['type'] })}
              className="sw-filter-select"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Top Stat Cards */}
      <Row className="mb-5 g-3">
        <Col xs={12} sm={6} lg={4}>
          <MetricCard
            label="Total Assigned Requests"
            value={metrics.totalRequests}
            icon="📂"
            color="#3b82f6"
            trend={{ value: 8, direction: 'up' }}
          />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <MetricCard
            label="Requests In Progress"
            value={metrics.inProgress}
            icon="⚙️"
            color="#3b82f6"
          />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <MetricCard
            label="Completed Requests"
            value={metrics.completed}
            icon="✅"
            color="#10b981"
            trend={{ value: 12, direction: 'up' }}
          />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <MetricCard
            label="Overdue Requests"
            value={metrics.overdue}
            icon="⚠️"
            color="#ef4444"
          />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <MetricCard
            label="Active Service Packages"
            value={metrics.activePending}
            icon="📦"
            color="#f59e0b"
          />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <MetricCard
            label="Pending User Approvals"
            value={metrics.activePending}
            icon="👤"
            color="#8b5cf6"
          />
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row className="g-4 mb-5">
        {/* Requests by Status */}
        <Col xs={12} lg={6}>
          <Card className="sw-chart-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-700">Requests by Status</h6>
              <p className="text-muted small mb-0">Distribution of request statuses</p>
            </Card.Header>
            <Card.Body className="d-flex justify-content-center">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={getStatusDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name} ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStatusDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value as string} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Service Package Distribution */}
        <Col xs={12} lg={6}>
          <Card className="sw-chart-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-700">Service Package Distribution</h6>
              <p className="text-muted small mb-0">Usage by service type</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getServiceDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {getServiceDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row className="g-4 mb-5">
        {/* Requests Over Time */}
        <Col xs={12} lg={7}>
          <Card className="sw-chart-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-700">Requests Over Time</h6>
              <p className="text-muted small mb-0">30-day trend of new and completed requests</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="New Assigned"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Follow-Up Performance */}
        <Col xs={12} lg={5}>
          <Card className="sw-chart-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-700">Follow-Up Performance</h6>
              <p className="text-muted small mb-0">Status of follow-up tasks</p>
            </Card.Header>
            <Card.Body className="d-flex justify-content-center">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={getFollowUpPerformance()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {getFollowUpPerformance().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 3 */}
      <Row className="g-4 mb-5">
        {/* Completion Time Analysis */}
        <Col xs={12} lg={6}>
          <Card className="sw-chart-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-700">Completion Time Analysis</h6>
              <p className="text-muted small mb-0">Average days to complete by service type</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getCompletionTimeData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `${value} days`} />
                  <Bar dataKey="Avg Days" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Priority & Emergency Tracking */}
        <Col xs={12} lg={6}>
          <Card className="sw-chart-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-700">Priority & Emergency Tracking</h6>
              <p className="text-muted small mb-0">Request distribution by priority level</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getPriorityDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {getPriorityDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Summary */}
      <Row className="mb-5">
        <Col xs={12}>
          <Card className="sw-chart-card border-0">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-700">Performance Summary</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                <Col xs={12} sm={6} md={3}>
                  <div className="stat-summary">
                    <div className="stat-label">Completion Rate</div>
                    <div className="stat-value">
                      {metrics.totalRequests > 0
                        ? Math.round((metrics.completed / metrics.totalRequests) * 100)
                        : 0}
                      %
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="stat-summary">
                    <div className="stat-label">Avg Requests/Day</div>
                    <div className="stat-value">
                      {Math.round(metrics.totalRequests / 30)}
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="stat-summary">
                    <div className="stat-label">Follow-Up Completion</div>
                    <div className="stat-value">
                      {metrics.totalFollowUps > 0
                        ? Math.round(
                            (followUps.filter((f) => f.status === 'COMPLETED').length /
                              metrics.totalFollowUps) *
                              100
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="stat-summary">
                    <div className="stat-label">Pending Actions</div>
                    <div className="stat-value" style={{ color: '#ef4444' }}>
                      {metrics.inProgress + metrics.overdue}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

import { useEffect, useState } from 'react'
import { Card, Row, Col, Spinner, Table, Badge } from 'react-bootstrap'
import {
  getAdminDashboardOverview,
  getUserStatistics,
  getAllPoliceStations,
  getAllUsersForManagement,
} from '../../services/adminApi'
import type { AdminDashboardOverviewDTO, UserStatisticsDTO, PoliceStationDTO, UserManagementDTO } from '../../types/admin'
import { CASE_STATUS_LABELS, CASE_STATUS_BADGE_VARIANTS, HELP_TYPE_LABELS } from '../../types/dashboard'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts'

export function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminDashboardOverviewDTO | null>(null)
  const [userStats, setUserStats] = useState<UserStatisticsDTO | null>(null)
  const [stations, setStations] = useState<PoliceStationDTO[]>([])
  const [users, setUsers] = useState<UserManagementDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const [overview, stats, stationsRes, usersRes] = await Promise.all([
          getAdminDashboardOverview(),
          getUserStatistics(),
          getAllPoliceStations(),
          getAllUsersForManagement(),
        ])

        if (!isMounted) return
        setData(overview)
        setUserStats(stats)
        setStations(stationsRes)
        setUsers(usersRes)
      } catch {
        if (!isMounted) return
        setData(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="alert alert-danger">
        Failed to load analytics
      </div>
    )
  }

  const m = data.metrics
  const casesByStatus = m.casesByStatus ?? {}
  const helpByType = m.helpRequestsByType ?? {}

  const totalUsers = userStats?.totalUsers ?? m.totalUsers
  const totalCases = m.totalCases ?? Object.values(casesByStatus).reduce((sum, v) => sum + (v || 0), 0)
  const totalHelpRequests =
    m.totalHelpRequests ?? Object.values(helpByType).reduce((sum, v) => sum + (v || 0), 0)
  const totalSocialWorkers = userStats?.totalSocialWorkers ?? 0
  const totalPoliceStations = stations.length

  // Build user growth over time from registration dates (monthly)
  const userGrowthMap: Record<string, number> = {}
  users.forEach((u) => {
    if (!u.registrationDate) return
    const d = new Date(u.registrationDate)
    if (Number.isNaN(d.getTime())) return
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    userGrowthMap[key] = (userGrowthMap[key] || 0) + 1
  })
  const userGrowthData = Object.entries(userGrowthMap)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, count]) => ({ month, count }))

  const caseStatusChartData = Object.entries(casesByStatus).map(([status, count]) => ({
    statusLabel: CASE_STATUS_LABELS[status as keyof typeof CASE_STATUS_LABELS] || status,
    count,
  }))

  const stationVsWorkerData = [
    { category: 'Police Stations', count: totalPoliceStations },
    { category: 'Social Workers', count: totalSocialWorkers },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Analytics & Overview</h1>
        <p className="text-muted mb-0">
          High-level overview of users, stations, cases, and help requests with visual insights.
        </p>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm h-100 rounded-3 border-start border-4 border-primary-subtle">
            <Card.Body className="py-3">
              <div className="text-muted text-uppercase small mb-1">Total Users</div>
              <div className="fw-bold display-6 text-primary">{totalUsers}</div>
              <div className="text-muted small mt-1">All registered accounts across the platform.</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm h-100 rounded-3 border-start border-4 border-info-subtle">
            <Card.Body className="py-3">
              <div className="text-muted text-uppercase small mb-1">Total Police Stations</div>
              <div className="fw-bold display-6 text-info">{totalPoliceStations}</div>
              <div className="text-muted small mt-1">Registered police stations in the system.</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm h-100 rounded-3 border-start border-4 border-success-subtle">
            <Card.Body className="py-3">
              <div className="text-muted text-uppercase small mb-1">Total Social Workers</div>
              <div className="fw-bold display-6 text-success">{totalSocialWorkers}</div>
              <div className="text-muted small mt-1">Verified social worker accounts.</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col xs={12} md={6} lg={4}>
          <Card className="border-0 shadow-sm h-100 rounded-3 border-start border-4 border-danger-subtle">
            <Card.Body className="py-3">
              <div className="text-muted text-uppercase small mb-1">Total Cases</div>
              <div className="fw-bold display-6 text-danger">{totalCases}</div>
              <div className="text-muted small mt-1">All reported and tracked child protection cases.</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="border-0 shadow-sm h-100 rounded-3 border-start border-4 border-warning-subtle">
            <Card.Body className="py-3">
              <div className="text-muted text-uppercase small mb-1">Total Help Requests</div>
              <div className="fw-bold display-6 text-warning">{totalHelpRequests}</div>
              <div className="text-muted small mt-1">Support and assistance requests from the public.</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">User Growth Over Time</h5>
              <div className="text-muted small">Monthly new user registrations</div>
            </Card.Header>
            <Card.Body style={{ height: 280 }}>
              {userGrowthData.length === 0 ? (
                <div className="text-muted text-center py-4">Not enough data to display user growth.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" name="New Users" stroke="#0d6efd" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Police Stations vs Social Workers</h5>
              <div className="text-muted small">Capacity overview</div>
            </Card.Header>
            <Card.Body style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stationVsWorkerData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#198754" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mt-1">
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Cases by Status</h5>
            </Card.Header>
            <Card.Body>
              {caseStatusChartData.length === 0 ? (
                <div className="text-muted text-center py-4">No case data yet</div>
              ) : (
                <>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={caseStatusChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="statusLabel" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Cases" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table hover responsive size="sm" className="mb-0 mt-3">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th className="text-end">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(casesByStatus).map(([status, count]) => {
                        const s = status as keyof typeof CASE_STATUS_LABELS
                        return (
                          <tr key={status}>
                            <td>
                              <Badge bg={CASE_STATUS_BADGE_VARIANTS[s] ?? 'secondary'}>
                                {CASE_STATUS_LABELS[s] || status}
                              </Badge>
                            </td>
                            <td className="text-end">{count}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Help Requests by Type</h5>
            </Card.Header>
            <Card.Body>
              {Object.keys(helpByType).length === 0 ? (
                <div className="text-muted text-center py-4">No help request data yet</div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(helpByType).map(([type, count]) => (
                      <tr key={type}>
                        <td>{HELP_TYPE_LABELS[type as keyof typeof HELP_TYPE_LABELS] || type}</td>
                        <td className="text-end">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
        console.log('Analytics data loaded:', {
          overview,
          metrics: overview?.metrics,
          casesByStatus: overview?.metrics?.casesByStatus,
          helpRequestsByType: overview?.metrics?.helpRequestsByType,
        })
        setData(overview)
        setUserStats(stats)
        setStations(stationsRes)
        setUsers(usersRes)
      } catch (error) {
        if (!isMounted) return
        console.error('Error loading analytics:', error)
        setData(null)
        setUserStats(null)
        setStations([])
        setUsers([])
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

  const totalUsers = userStats?.totalUsers ?? m.totalUsers ?? 0
  const totalCases = m.totalCases ?? Object.values(casesByStatus).reduce((sum, v) => sum + (v || 0), 0)
  const totalHelpRequests = m.totalHelpRequests ?? Object.values(helpByType).reduce((sum, v) => sum + (v || 0), 0)
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

  const caseStatusChartData = Object.entries(casesByStatus)
    .map(([status, count]) => ({
      statusLabel: CASE_STATUS_LABELS[status as keyof typeof CASE_STATUS_LABELS] || status,
      count: count || 0,
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending

  const helpRequestsByTypeChartData = Object.entries(helpByType)
    .map(([type, count]) => ({
      typeLabel: HELP_TYPE_LABELS[type as keyof typeof HELP_TYPE_LABELS] || type,
      count: count || 0,
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending

  // Debug logging
  console.log('Analytics page render:', {
    casesByStatus,
    helpByType,
    casesByStatusKeys: Object.keys(casesByStatus),
    helpByTypeKeys: Object.keys(helpByType),
    caseStatusChartDataLength: caseStatusChartData.length,
    helpRequestsByTypeChartDataLength: helpRequestsByTypeChartData.length,
    totalCases,
    totalHelpRequests,
  })

  const stationVsWorkerData = [
    { category: 'Police Stations', count: totalPoliceStations },
    { category: 'Social Workers', count: totalSocialWorkers },
  ]

  // Light colors for charts
  const PIE_COLORS = ['#86b7fe', '#6fcf97', '#ffd54f', '#ff8a80', '#b39ddb', '#80deea', '#ffb74d']
  const COLORS = ['#86b7fe', '#6fcf97'] // Light blue and light green for pie chart

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Analytics Dashboard</h1>
          <p className="text-muted mb-0">
            Comprehensive overview of platform metrics and insights
          </p>
        </div>
      </div>

      {/* Top Stat Cards - Modern Design */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="p-4 text-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="text-white-50 text-uppercase small mb-1" style={{ opacity: 0.9 }}>Total Users</div>
                  <div className="fw-bold" style={{ fontSize: '2.5rem' }}>{totalUsers}</div>
                </div>
              </div>
              <div className="text-white-50 small">All registered accounts</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Card.Body className="p-4 text-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="text-white-50 text-uppercase small mb-1" style={{ opacity: 0.9 }}>Total Cases</div>
                  <div className="fw-bold" style={{ fontSize: '2.5rem' }}>{totalCases}</div>
                </div>
              </div>
              <div className="text-white-50 small">Child protection cases</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Card.Body className="p-4 text-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="text-white-50 text-uppercase small mb-1" style={{ opacity: 0.9 }}>Help Requests</div>
                  <div className="fw-bold" style={{ fontSize: '2.5rem' }}>{totalHelpRequests}</div>
                </div>
              </div>
              <div className="text-white-50 small">Public assistance requests</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Card.Body className="p-4 text-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="text-white-50 text-uppercase small mb-1" style={{ opacity: 0.9 }}>Active Workers</div>
                  <div className="fw-bold" style={{ fontSize: '2.5rem' }}>{totalSocialWorkers + totalPoliceStations}</div>
                </div>
              </div>
              <div className="text-white-50 small">SW: {totalSocialWorkers} | PO: {totalPoliceStations}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 fw-bold">User Growth Over Time</h5>
                  <div className="text-muted small">Monthly new user registrations</div>
                </div>
              </div>
            </Card.Header>
            <Card.Body style={{ height: 320, padding: '20px' }}>
              {userGrowthData.length === 0 ? (
                <div className="text-muted text-center py-5">Not enough data to display user growth.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorUserGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#86b7fe" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#86b7fe" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6c757d"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      allowDecimals={false}
                      stroke="#6c757d"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="New Users" 
                      stroke="#86b7fe" 
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorUserGrowth)"
                      dot={{ fill: '#86b7fe', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 fw-bold">Police Stations vs Social Workers</h5>
                  <div className="text-muted small">Capacity distribution</div>
                </div>
              </div>
            </Card.Header>
            <Card.Body style={{ height: 320, padding: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stationVsWorkerData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stationVsWorkerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => {
                      const data = stationVsWorkerData.find(d => d.category === value)
                      return `${value} (${data?.count || 0})`
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mt-2">
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 fw-bold">Cases by Status</h5>
                  <div className="text-muted small">Distribution of case statuses</div>
                </div>
              </div>
            </Card.Header>
            <Card.Body style={{ padding: '20px' }}>
              {Object.keys(casesByStatus).length === 0 || caseStatusChartData.length === 0 ? (
                <div className="text-muted text-center py-5">No case data yet</div>
              ) : (
                <>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={caseStatusChartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                        <XAxis 
                          dataKey="statusLabel" 
                          stroke="#6c757d"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          allowDecimals={false}
                          stroke="#6c757d"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          name="Cases" 
                          fill="#86b7fe" 
                          radius={[8, 8, 0, 0]}
                        >
                          {caseStatusChartData.map((entry, index) => {
                            const status = Object.keys(casesByStatus).find(
                              k => CASE_STATUS_LABELS[k as keyof typeof CASE_STATUS_LABELS] === entry.statusLabel
                            )
                            const s = status as keyof typeof CASE_STATUS_BADGE_VARIANTS
                            const colorMap: Record<string, string> = {
                              'primary': '#86b7fe',
                              'success': '#6fcf97',
                              'danger': '#ff8a80',
                              'warning': '#ffd54f',
                              'info': '#80deea',
                              'dark': '#b0bec5',
                              'secondary': '#b0bec5',
                            }
                            const variant = CASE_STATUS_BADGE_VARIANTS[s] ?? 'secondary'
                            return (
                              <Cell key={`cell-${index}`} fill={colorMap[variant] || '#6c757d'} />
                            )
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table hover responsive size="sm" className="mb-0 mt-4">
                    <thead className="table-light">
                    <tr>
                      <th>Status</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                      {Object.entries(casesByStatus)
                        .sort(([, a], [, b]) => (b || 0) - (a || 0)) // Sort by count descending
                        .map(([status, count]) => {
                          const s = status as keyof typeof CASE_STATUS_LABELS
                          return (
                      <tr key={status}>
                        <td>
                                <Badge bg={CASE_STATUS_BADGE_VARIANTS[s] ?? 'secondary'}>
                                  {CASE_STATUS_LABELS[s] || status}
                          </Badge>
                        </td>
                              <td className="text-end fw-medium">{count || 0}</td>
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
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 fw-bold">Help Requests by Type</h5>
                  <div className="text-muted small">Distribution of help request types</div>
                </div>
              </div>
            </Card.Header>
            <Card.Body style={{ padding: '20px' }}>
              {Object.keys(helpByType).length === 0 || helpRequestsByTypeChartData.length === 0 ? (
                <div className="text-muted text-center py-5">No help request data yet</div>
              ) : (
                <>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={helpRequestsByTypeChartData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                        <XAxis 
                          dataKey="typeLabel" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          stroke="#6c757d"
                          style={{ fontSize: '11px' }}
                        />
                        <YAxis 
                          allowDecimals={false}
                          stroke="#6c757d"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          name="Help Requests" 
                          fill="#ffd54f" 
                          radius={[8, 8, 0, 0]}
                        >
                          {helpRequestsByTypeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table hover responsive size="sm" className="mb-0 mt-4">
                    <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                      {Object.entries(helpByType)
                        .sort(([, a], [, b]) => (b || 0) - (a || 0)) // Sort by count descending
                        .map(([type, count]) => (
                      <tr key={type}>
                            <td className="fw-medium">{HELP_TYPE_LABELS[type as keyof typeof HELP_TYPE_LABELS] || type}</td>
                            <td className="text-end fw-medium">{count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

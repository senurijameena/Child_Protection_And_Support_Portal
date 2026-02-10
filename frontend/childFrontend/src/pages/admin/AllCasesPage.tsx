import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, Table, Badge, Form, Spinner } from 'react-bootstrap'
import { getAllCasesWithDetails, getAllPoliceStations } from '../../services/adminApi'
import type { CaseDTO } from '../../types/dashboard'
import type { PoliceStationDTO } from '../../types/admin'
import { CASE_STATUS_LABELS, CASE_STATUS_BADGE_VARIANTS, CASE_TYPE_LABELS } from '../../types/dashboard'

const STATUS_FILTERS: { code: string; label: string }[] = [
  { code: 'REPORTED', label: 'Submitted' },
  { code: 'UNDER_REVIEW', label: 'Accepted' },
  { code: 'REJECTED', label: 'Rejected' },
  { code: 'ASSIGNED', label: 'Assigned' },
  { code: 'INVESTIGATING', label: 'Investigating' },
  { code: 'RESOLVED', label: 'Resolved' },
  { code: 'CLOSED', label: 'Closed' },
]

export function AllCasesPage() {
  const [searchParams] = useSearchParams()
  const [cases, setCases] = useState<CaseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '')
  const [filterType, setFilterType] = useState('')
  const [stations, setStations] = useState<PoliceStationDTO[]>([])

  const loadCases = () => {
    setLoading(true)
    getAllCasesWithDetails()
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCases()
  }, [])

  useEffect(() => {
    getAllPoliceStations().then(setStations).catch(() => setStations([]))
  }, [])

  const filteredCases = cases.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false
    if (filterType && c.caseType !== filterType) return false
    return true
  })

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">All Cases</h1>
          <p className="text-muted mb-0">View and manage case submissions</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Label className="small text-muted">Case Status</Form.Label>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                {STATUS_FILTERS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Label className="small text-muted">Case Type</Form.Label>
              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All</option>
                <option value="MISSING_CHILD">Missing Child</option>
                <option value="CHILD_ABUSE">Child Abuse</option>
                <option value="CHILD_LABOR">Child Labor</option>
                <option value="CHILD_TRAFFICKING">Child Trafficking</option>
                <option value="OTHER">Other</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Case Type</th>
                <th>Current Status</th>
                <th>Submitted Date</th>
                <th>Assigned Police Station</th>
                <th className="text-end">View</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No cases found
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <code className="small">{c.trackingId || c.id?.slice(0, 8)}</code>
                    </td>
                    <td>
                      {CASE_TYPE_LABELS[(c.caseType as keyof typeof CASE_TYPE_LABELS) || 'OTHER']}
                    </td>
                    <td>
                      <Badge
                        bg={CASE_STATUS_BADGE_VARIANTS[(c.status as keyof typeof CASE_STATUS_BADGE_VARIANTS) || 'REPORTED']}
                      >
                        {c.status === 'UNDER_REVIEW'
                          ? 'Accepted'
                          : CASE_STATUS_LABELS[(c.status as keyof typeof CASE_STATUS_LABELS) || 'REPORTED']}
                      </Badge>
                    </td>
                    <td className="text-muted small">
                      {c.reportDate
                        ? new Date(c.reportDate).toLocaleString()
                        : '-'}
                    </td>
                    <td>
                      {c.assignedStationId
                        ? stations.find((s) => s.id === c.assignedStationId)?.stationName || 'Assigned'
                        : '-'}
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/admin/cases/${c.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

    </div>
  )
}

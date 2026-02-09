import { useState } from 'react'
import { Card, Button, Form, Spinner } from 'react-bootstrap'
import { getAllCasesWithDetails, getAllHelpRequests } from '../../services/adminApi'

export function AdminReportsPage() {
  const [reportType, setReportType] = useState<'cases' | 'help-requests'>('cases')
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv')
  const [loading, setLoading] = useState(false)

  const exportCSV = (data: unknown[], headers: string[], filename: string) => {
    const csvRows = [headers.join(',')]
    data.forEach((row: Record<string, unknown>) => {
      const values = headers.map((h) => {
        const val = row[h]
        const str = val != null ? String(val) : ''
        return str.includes(',') ? `"${str}"` : str
      })
      csvRows.push(values.join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      if (reportType === 'cases') {
        const cases = await getAllCasesWithDetails()
        if (format === 'csv') {
          const headers = ['id', 'trackingId', 'caseType', 'status', 'reportDate', 'location', 'priority']
          exportCSV(
            cases.map((c) => ({
              id: c.id,
              trackingId: c.trackingId,
              caseType: c.caseType,
              status: c.status,
              reportDate: c.reportDate,
              location: c.location,
              priority: c.priority,
            })),
            headers,
            `cases-report-${new Date().toISOString().slice(0, 10)}.csv`
          )
        } else {
          window.print()
        }
      } else {
        const requests = await getAllHelpRequests()
        if (format === 'csv') {
          const headers = ['id', 'trackingId', 'helpType', 'status', 'requestDate', 'location']
          exportCSV(
            requests.map((r) => ({
              id: r.id,
              trackingId: r.trackingId,
              helpType: r.helpType,
              status: r.status,
              requestDate: r.requestDate,
              location: r.location,
            })),
            headers,
            `help-requests-report-${new Date().toISOString().slice(0, 10)}.csv`
          )
        } else {
          window.print()
        }
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Reports & Export</h1>
        <p className="text-muted mb-0">Generate case and help request reports</p>
      </div>
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label>Report Type</Form.Label>
            <Form.Select value={reportType} onChange={(e) => setReportType(e.target.value as 'cases' | 'help-requests')}>
              <option value="cases">Case Progress</option>
              <option value="help-requests">Help Request Progress</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Export Format</Form.Label>
            <Form.Select value={format} onChange={(e) => setFormat(e.target.value as 'csv' | 'pdf')}>
              <option value="csv">CSV</option>
              <option value="pdf">PDF (Print)</option>
            </Form.Select>
          </Form.Group>
          <Button variant="primary" onClick={handleExport} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Generate Report'}
          </Button>
        </Card.Body>
      </Card>
    </div>
  )
}

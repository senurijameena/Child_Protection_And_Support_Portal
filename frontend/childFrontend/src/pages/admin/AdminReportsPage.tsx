import React, { useRef, useState } from 'react'
import { Card, Button, Form, Spinner, Table } from 'react-bootstrap'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import ReactToPrint from 'react-to-print'
import { getAllCasesWithDetails, getAllHelpRequests } from '../../services/adminApi'
import { apiGet } from '../../services/api'
import type { CaseDTO, HelpRequestDTO } from '../../types/dashboard'

type ReportType = 'cases' | 'help-requests' | 'combined'
type ScopeType = 'all' | 'by-id'
type IdType = 'case' | 'help'

interface ReportRow {
  kind: 'Case' | 'Help'
  id: string
  trackingId?: string
  status?: string
  date?: string
  location?: string
  typeLabel?: string
}

export function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('cases')
  const [scope, setScope] = useState<ScopeType>('all')
  const [idType, setIdType] = useState<IdType>('case')
  const [searchId, setSearchId] = useState('')
  const [rows, setRows] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const reportRef = useRef<HTMLDivElement | null>(null)

  const buildRowsFromCases = (cases: CaseDTO[]): ReportRow[] =>
    cases.map((c) => ({
      kind: 'Case',
      id: c.id,
      trackingId: c.trackingId,
      status: c.status,
      date: c.reportDate ? new Date(c.reportDate).toLocaleString() : undefined,
      location: c.location,
      typeLabel: c.caseType,
    }))

  const buildRowsFromHelps = (requests: HelpRequestDTO[]): ReportRow[] =>
    requests.map((r) => ({
      kind: 'Help',
      id: r.id,
      trackingId: r.trackingId,
      status: r.status,
      date: r.requestDate ? new Date(r.requestDate).toLocaleString() : undefined,
      location: r.location,
      typeLabel: r.helpType,
    }))

  const loadData = async (): Promise<ReportRow[]> => {
    if (scope === 'all') {
      if (reportType === 'cases') {
        const cases = await getAllCasesWithDetails()
        return buildRowsFromCases(cases)
      }
      if (reportType === 'help-requests') {
        const requests = await getAllHelpRequests()
        return buildRowsFromHelps(requests)
      }
      // combined
      const [cases, requests] = await Promise.all([getAllCasesWithDetails(), getAllHelpRequests()])
      return [...buildRowsFromCases(cases), ...buildRowsFromHelps(requests)]
    }

    // ID-based
    if (!searchId.trim()) {
      throw new Error('Please enter an ID to search')
    }

    if (idType === 'case') {
      const c = await apiGet<CaseDTO>(`/cases/${encodeURIComponent(searchId.trim())}`)
      return buildRowsFromCases([c])
    }

    const r = await apiGet<HelpRequestDTO>(`/help-requests/${encodeURIComponent(searchId.trim())}`)
    return buildRowsFromHelps([r])
  }

  const exportCSV = (data: ReportRow[], filename: string) => {
    const headers = ['Type', 'ID', 'Tracking ID', 'Status', 'Date', 'Location', 'Category']
    const csvRows = [headers.join(',')]
    data.forEach((row) => {
      const values = [
        row.kind,
        row.id,
        row.trackingId ?? '',
        row.status ?? '',
        row.date ?? '',
        row.location ?? '',
        row.typeLabel ?? '',
      ].map((str) => {
        const v = String(str)
        return v.includes(',') ? `"${v}"` : v
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

  const exportExcel = (data: ReportRow[], filename: string) => {
    const worksheetData = data.map((row) => ({
      Type: row.kind,
      ID: row.id,
      'Tracking ID': row.trackingId,
      Status: row.status,
      Date: row.date,
      Location: row.location,
      Category: row.typeLabel,
    }))
    const ws = XLSX.utils.json_to_sheet(worksheetData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, filename)
  }

  const exportPDF = (data: ReportRow[], filename: string) => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const title =
      scope === 'all'
        ? reportType === 'cases'
          ? 'Cases Report'
          : reportType === 'help-requests'
            ? 'Help Requests Report'
            : 'Combined Cases & Help Requests Report'
        : idType === 'case'
          ? 'Case Detail Report'
          : 'Help Request Detail Report'

    doc.setFontSize(14)
    doc.text('Child Protection & Support Portal', 14, 15)
    doc.setFontSize(11)
    doc.text(title, 14, 23)
    doc.setFontSize(9)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

    const body = data.map((row) => [
      row.kind,
      row.id,
      row.trackingId ?? '',
      row.status ?? '',
      row.date ?? '',
      row.location ?? '',
      row.typeLabel ?? '',
    ])

    // @ts-expect-error - jsPDF autotable plugin typing
    autoTable(doc, {
      head: [['Type', 'ID', 'Tracking ID', 'Status', 'Date', 'Location', 'Category']],
      body,
      startY: 34,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 37, 41] },
    })

    doc.save(filename)
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const data = await loadData()
      setRows(data)
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (kind: 'csv' | 'excel' | 'pdf') => {
    setLoading(true)
    try {
      const data = rows.length ? rows : await loadData()
      const dateSuffix = new Date().toISOString().slice(0, 10)
      const baseName =
        scope === 'all'
          ? reportType === 'cases'
            ? 'cases-report'
            : reportType === 'help-requests'
              ? 'help-requests-report'
              : 'combined-report'
          : idType === 'case'
            ? 'case-report'
            : 'help-request-report'

      if (kind === 'csv') {
        exportCSV(data, `${baseName}-${dateSuffix}.csv`)
      } else if (kind === 'excel') {
        exportExcel(data, `${baseName}-${dateSuffix}.xlsx`)
      } else {
        exportPDF(data, `${baseName}-${dateSuffix}.pdf`)
      }
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  const hasData = rows.length > 0

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Reports & Export</h1>
        <p className="text-muted mb-0">
          Generate PDF, Excel/CSV, and print-friendly reports for cases and help requests.
        </p>
      </div>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body className="p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Report Type</Form.Label>
                <Form.Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                >
                  <option value="cases">Cases</option>
                  <option value="help-requests">Help Requests</option>
                  <option value="combined">Combined (Cases + Help Requests)</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Scope</Form.Label>
                <div className="d-flex gap-3 mt-1">
                  <Form.Check
                    type="radio"
                    id="scope-all"
                    label="All data"
                    name="scope"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                  />
                  <Form.Check
                    type="radio"
                    id="scope-id"
                    label="ID-based"
                    name="scope"
                    checked={scope === 'by-id'}
                    onChange={() => setScope('by-id')}
                  />
                </div>
              </Form.Group>
            </div>

            {scope === 'by-id' && (
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Search by</Form.Label>
                  <div className="d-flex gap-2 mb-2">
                    <Form.Select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value as IdType)}
                      style={{ maxWidth: 160 }}
                    >
                      <option value="case">Case ID</option>
                      <option value="help">Help ID</option>
                    </Form.Select>
                    <Form.Control
                      type="text"
                      placeholder={idType === 'case' ? 'Enter Case ID' : 'Enter Help ID'}
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                    />
                  </div>
                  <small className="text-muted">
                    Use the system ID from the admin dashboards (case or help request details URL).
                  </small>
                </Form.Group>
              </div>
            )}
          </div>

          <div className="mt-4 d-flex flex-wrap gap-2">
            <Button variant="primary" onClick={handleGenerate} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Generate / Refresh'}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => handleExport('csv')}
              disabled={loading}
            >
              Export CSV
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => handleExport('excel')}
              disabled={loading}
            >
              Export Excel
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => handleExport('pdf')}
              disabled={loading}
            >
              Export PDF
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button variant="outline-secondary" disabled={!hasData}>
                  Print
                </Button>
              )}
              content={() => reportRef.current}
            />
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-4">
          <div ref={reportRef}>
            <h2 className="h5 mb-3">
              {scope === 'all'
                ? reportType === 'cases'
                  ? 'Cases Overview'
                  : reportType === 'help-requests'
                    ? 'Help Requests Overview'
                    : 'Combined Cases & Help Requests'
                : idType === 'case'
                  ? 'Case Detail'
                  : 'Help Request Detail'}
            </h2>
            {rows.length === 0 ? (
              <p className="text-muted mb-0">No data loaded yet. Generate a report to see results.</p>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>ID</th>
                      <th>Tracking ID</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={`${row.kind}-${row.id}`}>
                        <td>{row.kind}</td>
                        <td>{row.id}</td>
                        <td>{row.trackingId}</td>
                        <td>{row.status}</td>
                        <td>{row.date}</td>
                        <td>{row.location}</td>
                        <td>{row.typeLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

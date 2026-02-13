import { useRef, useState } from 'react'
import { Card, Button, Form, Spinner, Table } from 'react-bootstrap'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { getAllCasesWithDetails, getAllHelpRequests } from '../../services/adminApi'
import { apiGet } from '../../services/api'
import type { CaseDTO, HelpRequestDTO } from '../../types/dashboard'

type ReportType = 'cases' | 'help-requests'
type ScopeType = 'all' | 'by-id'
type IdType = 'case' | 'help'

interface ReportRow {
  kind: 'Case' | 'Help'
  id: string
  trackingId?: string
  title?: string
  description?: string
  status?: string
  createdDate?: string
  lastUpdated?: string
  assignedUser?: string
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

  const getAssignedUser = (caseData: CaseDTO): string => {
    if (caseData.assignedOfficerId) return `Officer: ${caseData.assignedOfficerId}`
    if (caseData.assignedStationId) return `Station: ${caseData.assignedStationId}`
    if (caseData.assignedWorkerId) return `Worker: ${caseData.assignedWorkerId}`
    return 'Not assigned'
  }

  const buildRowsFromCases = (cases: CaseDTO[]): ReportRow[] =>
    cases.map((c) => {
      // Use first part of description as title, or case type as fallback
      const description = c.caseDescription || ''
      const title = description.length > 50 ? description.substring(0, 50) + '...' : description || c.caseType || 'N/A'
      
      return {
        kind: 'Case',
        id: c.id,
        trackingId: c.trackingId,
        title: title,
        description: c.caseDescription || 'No description',
        status: c.status,
        createdDate: c.reportDate ? new Date(c.reportDate).toLocaleString() : undefined,
        lastUpdated: c.reportDate ? new Date(c.reportDate).toLocaleString() : undefined, // Using reportDate as fallback until lastUpdated is added to DTO
        assignedUser: getAssignedUser(c),
        location: c.location,
        typeLabel: c.caseType,
      }
    })

  const buildRowsFromHelps = (requests: HelpRequestDTO[]): ReportRow[] =>
    requests.map((r) => {
      const description = r.description || ''
      const title = description.length > 50 ? description.substring(0, 50) + '...' : description || r.helpType || 'N/A'
      
      return {
        kind: 'Help',
        id: r.id,
        trackingId: r.trackingId,
        title: title,
        description: r.description || 'No description',
        status: r.status,
        createdDate: r.requestDate ? new Date(r.requestDate).toLocaleString() : undefined,
        lastUpdated: r.requestDate ? new Date(r.requestDate).toLocaleString() : undefined, // Using requestDate as fallback until lastUpdated is added to DTO
        assignedUser: r.assignedWorkerId ? `Worker: ${r.assignedWorkerId}` : 'Not assigned',
        location: r.location,
        typeLabel: r.helpType,
      }
    })

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
    const headers = ['Type', 'ID', 'Tracking ID', 'Title', 'Description', 'Status', 'Created Date', 'Last Updated', 'Assigned User', 'Location', 'Category']
    const csvRows = [headers.join(',')]
    data.forEach((row) => {
      const values = [
        row.kind,
        row.id,
        row.trackingId ?? '',
        (row.title ?? '').replace(/"/g, '""'),
        (row.description ?? '').replace(/"/g, '""'),
        row.status ?? '',
        row.createdDate ?? '',
        row.lastUpdated ?? '',
        (row.assignedUser ?? '').replace(/"/g, '""'),
        row.location ?? '',
        row.typeLabel ?? '',
      ].map((str) => {
        const v = String(str)
        return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v}"` : v
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
      Title: row.title,
      Description: row.description,
      Status: row.status,
      'Created Date': row.createdDate,
      'Last Updated': row.lastUpdated,
      'Assigned User': row.assignedUser,
      Location: row.location,
      Category: row.typeLabel,
    }))
    const ws = XLSX.utils.json_to_sheet(worksheetData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, filename)
  }

  const exportPDF = (
    data: ReportRow[], 
    filename: string,
    currentScope: ScopeType,
    currentReportType: ReportType,
    currentIdType: IdType
  ) => {
    if (!data || data.length === 0) {
      alert('No data available to export. Please generate a report first.')
      return
    }

    try {
      // Use landscape orientation for better table fit
      const doc = new jsPDF('l', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 10

      // Report title
      const reportTitle =
        currentScope === 'all'
          ? currentReportType === 'cases'
            ? 'Cases Report'
            : 'Help Requests Report'
          : currentIdType === 'case'
            ? 'Case Detail Report'
            : 'Help Request Detail Report'

      // Header with styling
      doc.setFillColor(33, 37, 41)
      doc.rect(0, 0, pageWidth, 30, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Child Protection & Support Portal', margin, 15)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(reportTitle, margin, 24)
      
      // Reset text color
      doc.setTextColor(0, 0, 0)
      
      // Report metadata
      let startY = 38
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      const genDate = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      doc.text(`Generated: ${genDate}`, margin, startY)
      doc.text(`Total Records: ${data.length}`, pageWidth - margin - 35, startY)
      doc.setTextColor(0, 0, 0)
      
      startY += 6

      // Prepare table data
      const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return 'N/A'
        try {
          const date = new Date(dateStr)
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        } catch {
          return 'N/A'
        }
      }

      const truncate = (text: string | undefined, maxLen: number) => {
        if (!text) return 'N/A'
        return text.length > maxLen ? text.substring(0, maxLen - 3) + '...' : text
      }

      const body = data.map((row) => [
        row.kind || 'N/A',
        row.id.length > 10 ? row.id.substring(0, 8) + '...' : row.id,
        truncate(row.trackingId, 15),
        truncate(row.title, 35),
        truncate(row.description, 45),
        truncate(row.status, 15),
        formatDate(row.createdDate),
        formatDate(row.lastUpdated),
        truncate(row.assignedUser || 'Not assigned', 20),
        truncate(row.location, 20),
        truncate(row.typeLabel, 15),
      ])

      // Add table
      autoTable(doc, {
        head: [[
          'Type', 'ID', 'Tracking ID', 'Title', 'Description',
          'Status', 'Created', 'Updated', 'Assigned', 'Location', 'Category'
        ]],
        body,
        startY: startY,
        styles: { 
          fontSize: 7,
          cellPadding: 2,
          overflow: 'linebreak',
        },
        headStyles: { 
          fillColor: [33, 37, 41],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 35, halign: 'left' },
          4: { cellWidth: 45, halign: 'left' },
          5: { cellWidth: 20, halign: 'center' },
          6: { cellWidth: 30, halign: 'left', fontSize: 6 },
          7: { cellWidth: 30, halign: 'left', fontSize: 6 },
          8: { cellWidth: 25, halign: 'left', fontSize: 6 },
          9: { cellWidth: 25, halign: 'left' },
          10: { cellWidth: 20, halign: 'center' },
        },
        margin: { left: margin, right: margin },
        theme: 'striped',
        showHead: 'everyPage',
        pageBreak: 'auto',
        rowPageBreak: 'avoid',
      })

      // Add footer on each page
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(100, 100, 100)
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' })
        doc.text('Child Protection & Support Portal - Confidential', margin, pageHeight - 8, { align: 'left' })
        doc.text(
          new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          pageWidth - margin,
          pageHeight - 8,
          { align: 'right' }
        )
      }

      // Save the PDF
      doc.save(filename)
    } catch (error) {
      console.error('PDF export error:', error)
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
        }
      }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const data = await loadData()
      setRows(data)
    } catch (e) {
       
      alert(e instanceof Error ? e.message : 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (kind: 'csv' | 'excel' | 'pdf') => {
    setLoading(true)
    try {
      const data = rows.length ? rows : await loadData()
      
      if (data.length === 0) {
        alert('No data available to export. Please generate a report first.')
        setLoading(false)
        return
      }

      const dateSuffix = new Date().toISOString().slice(0, 10)
      const baseName =
        scope === 'all'
          ? reportType === 'cases'
            ? 'cases-report'
            : 'help-requests-report'
          : idType === 'case'
            ? 'case-report'
            : 'help-request-report'

      if (kind === 'csv') {
        exportCSV(data, `${baseName}-${dateSuffix}.csv`)
        setLoading(false)
      } else if (kind === 'excel') {
        exportExcel(data, `${baseName}-${dateSuffix}.xlsx`)
        setLoading(false)
      } else if (kind === 'pdf') {
        exportPDF(data, `${baseName}-${dateSuffix}.pdf`, scope, reportType, idType)
        setLoading(false)
      }
    } catch (e) {
      console.error('Export error:', e)
       
      alert(e instanceof Error ? e.message : 'Export failed. Please check the console for details.')
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Reports & Export</h1>
        <p className="text-muted mb-0">
          Generate PDF, Excel, and CSV reports for cases and help requests.
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
                  : 'Help Requests Overview'
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
                      <th>Title</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Last Updated</th>
                      <th>Assigned User</th>
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
                        <td>{row.title}</td>
                        <td style={{ maxWidth: 300, wordWrap: 'break-word' }}>{row.description}</td>
                        <td>{row.status}</td>
                        <td>{row.createdDate}</td>
                        <td>{row.lastUpdated}</td>
                        <td>{row.assignedUser}</td>
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

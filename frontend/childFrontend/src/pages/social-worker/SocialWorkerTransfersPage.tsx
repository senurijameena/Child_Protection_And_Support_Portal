import { Card, Container, Badge, Table } from 'react-bootstrap'

export function SocialWorkerTransfersPage() {
  const transfers = [
    { id: 1, caseId: '#2541', employee: 'Sarah Martinez', status: 'Pending', date: '2 days ago' },
    { id: 2, caseId: '#2589', employee: 'James Wilson', status: 'Approved', date: '1 week ago' },
  ]

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h3 fw-700 mb-1">Transfer Requests 🔄</h1>
        <p className="text-muted">Request case transfers to other social workers</p>
      </div>
      <Card className="sw-card border-0">
        <Card.Body>
          <Table hover responsive className="mb-0">
            <thead>
              <tr className="border-top">
                <th>Case ID</th>
                <th>Transfer To</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(t => (
                <tr key={t.id}>
                  <td className="fw-600">{t.caseId}</td>
                  <td>{t.employee}</td>
                  <td><Badge bg={t.status === 'Approved' ? 'success' : 'warning'}>{t.status}</Badge></td>
                  <td className="text-muted small">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  )
}

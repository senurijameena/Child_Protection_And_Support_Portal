import { Card, Row, Col } from 'react-bootstrap'

const RESOURCE_CATEGORIES = [
  {
    title: 'Guidelines',
    items: [
      { name: 'Child Protection Guidelines', desc: 'Standard protocols for child welfare cases', type: 'PDF' },
      { name: 'Counseling Best Practices', desc: 'Evidence-based approaches for trauma-informed care', type: 'PDF' },
      { name: 'Referral Procedures', desc: 'When and how to refer to medical or legal services', type: 'PDF' },
    ],
  },
  {
    title: 'Forms & Templates',
    items: [
      { name: 'Referral Form', desc: 'Medical/legal referral template', type: 'Doc' },
      { name: 'Session Report Template', desc: 'Standard session documentation format', type: 'Doc' },
      { name: 'Home Visit Checklist', desc: 'Pre-visit and during-visit checklist', type: 'Doc' },
    ],
  },
  {
    title: 'Legal & Policy',
    items: [
      { name: 'Child Welfare Act Summary', desc: 'Key provisions relevant to social work', type: 'PDF' },
      { name: 'Confidentiality Guidelines', desc: 'Data protection and consent requirements', type: 'PDF' },
      { name: 'Mandatory Reporting Requirements', desc: 'When and how to report to authorities', type: 'PDF' },
    ],
  },
  {
    title: 'Counseling Tips',
    items: [
      { name: 'Trauma-Informed Care Overview', desc: 'Principles for working with trauma survivors', type: 'PDF' },
      { name: 'Communication with Families', desc: 'Tips for difficult conversations', type: 'PDF' },
      { name: 'Self-Care for Social Workers', desc: 'Preventing burnout and vicarious trauma', type: 'PDF' },
    ],
  },
]

export function SocialWorkerLibraryPage() {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Resource Library</h1>
        <p className="text-muted mb-0">
          Reference documents, guidelines, referral forms, and counseling tips. Attach resources to requests or share securely with users.
        </p>
      </div>

      <Row className="g-4">
        {RESOURCE_CATEGORIES.map((cat) => (
          <Col key={cat.title} xs={12} lg={6}>
            <Card className="border-0 shadow-sm rounded-3 h-100 sw-stat-card">
              <Card.Header className="bg-white border-0 pt-3">
                <h5 className="mb-0" style={{ color: '#2d6a4f' }}>{cat.title}</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-2">
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      className="d-flex align-items-start gap-2 p-2 rounded border border-light"
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="badge bg-light text-dark flex-shrink-0">{item.type}</span>
                      <div>
                        <strong className="small">{item.name}</strong>
                        <p className="mb-0 text-muted small">{item.desc}</p>
                      </div>
                      <a
                        href="#"
                        className="btn btn-sm btn-outline-secondary ms-auto"
                        onClick={(e) => {
                          e.preventDefault()
                          alert('Document preview/download would open here. In production, link to actual files.')
                        }}
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm rounded-3 mt-4">
        <Card.Body>
          <p className="text-muted small mb-0">
            <strong>Tip:</strong> When working on a request, you can attach relevant resources from this library to share with the user. 
            Documents are stored securely and access is logged for audit purposes.
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Badge, Spinner, ListGroup } from 'react-bootstrap'
import { apiGet, getUploadBaseUrl } from '../../services/api'
import { REQUEST_STATUS_LABELS, HELP_TYPE_LABELS } from '../../types/dashboard'
import type { HelpRequestDTO } from '../../types/dashboard'

interface TimelineEvent {
  id?: string
  eventType?: string
  description?: string
  performedByName?: string
  eventTime?: string
}

export function AdminHelpRequestDetailsPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const [r, setR] = useState<HelpRequestDTO | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  const getPriorityVariant = (priority?: string) => {
    const p = priority?.toUpperCase()
    if (p === 'HIGH') return 'danger'
    if (p === 'MEDIUM') return 'warning'
    if (p === 'LOW') return 'primary'
    return 'secondary'
  }

  useEffect(() => {
    if (!requestId) return
    Promise.all([
      apiGet<HelpRequestDTO>(`/help-requests/${requestId}`),
      apiGet<TimelineEvent[]>(`/timeline/help-request/${requestId}`).catch(() => []),
    ])
      .then(([req, tl]) => {
        setR(req)
        setTimeline(Array.isArray(tl) ? tl : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [requestId])

  if (loading || !r) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-3">
        <Link
          to="/admin/help-requests"
          className="text-primary text-decoration-none"
        >
          ← Back to Help Requests
        </Link>
      </div>
      <h2 className="h4 fw-bold mb-4">
        Help Request {r.trackingId || r.id}
        <Badge bg="light" text="dark" className="ms-2">
          {REQUEST_STATUS_LABELS[(r.status as keyof typeof REQUEST_STATUS_LABELS) || 'REQUESTED']}
        </Badge>
      </h2>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Details</h5>
            </Card.Header>
            <Card.Body>
              <p>
                <strong>Type:</strong>{' '}
                {HELP_TYPE_LABELS[(r.helpType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}
              </p>
              <p>
                <strong>Requester:</strong>{' '}
                {r.anonymous ? (
                  <Badge bg="secondary">Anonymous</Badge>
                ) : (
                  r.requesterName || '-'
                )}
                {!r.anonymous && (
                  <span className="text-muted small ms-2">
                    (Admin sees full identity)
                  </span>
                )}
              </p>
              <p>
                <strong>Gender:</strong> {r.gender || '-'}
              </p>
              <p>
                <strong>Approximate Age:</strong> {r.approximateAge || '-'}
              </p>
              <p>
                <strong>Submitted:</strong>{' '}
                {r.requestDate ? new Date(r.requestDate).toLocaleString() : '-'}
              </p>
              <p>
                <strong>Location:</strong> {r.location || '-'}
              </p>
              <p>
                <strong>Priority:</strong>{' '}
                <Badge bg={getPriorityVariant(r.priority)}>
                  {(r.priority || 'MEDIUM').toUpperCase()}
                </Badge>
              </p>
              <p>
                <strong>Description:</strong>
              </p>
              <p className="text-muted">{r.description || '-'}</p>

              {/* 🥘 Food Assistance Conditional Fields */}
              {r.helpType === 'FOOD_ASSISTANCE' && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">🥘 Food Assistance Details</h6>
                  <p><strong>Family Members:</strong> {r.familyMembers || '-'}</p>
                  <p><strong>Monthly Income Range:</strong> {r.monthlyIncomeRange || '-'}</p>
                  <p><strong>Employment Status:</strong> {r.employmentStatus || '-'}</p>
                </div>
              )}

              {/* 🎓 Education Conditional Fields */}
              {r.helpType === 'EDUCATION_SUPPORT' && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">🎓 Education Support Details</h6>
                  <p><strong>School Grade:</strong> {r.schoolGrade || '-'}</p>
                  <p><strong>Required Items:</strong> {r.requiredItems?.length ? r.requiredItems.join(', ') : '-'}</p>
                  <p><strong>Exam Year:</strong> {r.examYear || '-'}</p>
                </div>
              )}

              {/* 🏥 Medical Conditional Fields */}
              {r.helpType === 'MEDICAL_HELP' && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">🏥 Medical Help Details</h6>
                  <p><strong>Condition Description:</strong> {r.conditionDescription || '-'}</p>
                  <p><strong>Urgency Level:</strong> {r.urgencyLevel || '-'}</p>
                  <p><strong>Hospital/Clinic:</strong> {r.hospitalName || '-'}</p>
                  <p><strong>Estimated Cost:</strong> {r.estimatedCost || '-'}</p>
                  {r.medicalReportUrl && (
                    <div className="mt-2">
                      <a href={`${getUploadBaseUrl()}${r.medicalReportUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                        View Medical Report
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* 🏠 Shelter Conditional Fields */}
              {r.helpType === 'SHELTER' && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">🏠 Shelter Details</h6>
                  <p><strong>Current Housing Type:</strong> {r.currentHousingType || '-'}</p>
                  <p><strong>Risk of Eviction:</strong> <Badge bg={r.riskOfEviction ? 'danger' : 'success'}>{r.riskOfEviction ? 'Yes' : 'No'}</Badge></p>
                  <p><strong>Immediate Danger:</strong> <Badge bg={r.immediateDanger ? 'danger' : 'success'}>{r.immediateDanger ? 'Yes' : 'No'}</Badge></p>
                </div>
              )}

              {/* 👕 Clothing Conditional Fields */}
              {r.helpType === 'CLOTHING' && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">👕 Clothing Details</h6>
                  <p><strong>Quantity Needed:</strong> {r.quantityNeeded || '-'}</p>
                </div>
              )}

              {/* 🧠 Counseling Conditional Fields */}
              {r.helpType === 'COUNSELING' && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">🧠 Counseling Details</h6>
                  <p><strong>Counseling Type:</strong> {r.counselingType || '-'}</p>
                  <p><strong>Preferred Contact Method:</strong> {r.preferredContactMethod || '-'}</p>
                </div>
              )}

              {r.documentUrls && r.documentUrls.length > 0 && (
                <div className="mt-4">
                  <h6 className="mb-1">Evidence / Documents</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {r.documentUrls.map((url, i) => (
                      <a
                        key={url}
                        href={`${getUploadBaseUrl()}${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                        aria-label={`View evidence ${i + 1}`}
                      >
                        View
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
          {timeline.length > 0 && (
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Header className="bg-white border-0 pt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">Progress Timeline</h5>
                    <span className="text-muted small">Chronological log of all updates and actions</span>
                  </div>
                  <Badge bg="light" text="dark" className="small">
                    {timeline.length} event{timeline.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {timeline.map((item, i) => {
                    const isLast = i === timeline.length - 1
                    const timestamp = item.eventTime ? new Date(item.eventTime).toLocaleString() : '-'
                    return (
                      <ListGroup.Item key={item.id || i} className="border-0 px-0">
                        <div className="d-flex">
                          <div className="me-3 d-flex flex-column align-items-center">
                            <div
                              className="rounded-circle bg-primary"
                              style={{ width: 10, height: 10 }}
                            />
                            {!isLast && (
                              <div
                                style={{
                                  width: 2,
                                  flexGrow: 1,
                                  backgroundColor: '#e5e7eb',
                                  marginTop: 2,
                                }}
                              />
                            )}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <small className="text-muted">{timestamp}</small>
                              {item.eventType && (
                                <Badge bg="secondary" className="text-uppercase small">
                                  {item.eventType}
                                </Badge>
                              )}
                            </div>
                            <div className="fw-medium small text-dark">
                              {item.description || '-'}
                            </div>
                            {item.performedByName && (
                              <div className="text-muted small mt-1">
                                By {item.performedByName}
                              </div>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    )
                  })}
                </ListGroup>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

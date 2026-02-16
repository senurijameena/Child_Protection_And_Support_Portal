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

              {/* 🥘 Food Assistance Conditional Fields - Only show if has data */}
              {r.helpType === 'FOOD_ASSISTANCE' && 
               (r.familyMembers || r.monthlyIncomeRange || r.employmentStatus) && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">🥘 Food Assistance Details</h6>
                  {r.familyMembers && <p><strong>Family Members:</strong> {r.familyMembers}</p>}
                  {r.monthlyIncomeRange && <p><strong>Monthly Income Range:</strong> {r.monthlyIncomeRange}</p>}
                  {r.employmentStatus && <p><strong>Employment Status:</strong> {r.employmentStatus}</p>}
                </div>
              )}

              {/* 🎓 Education Conditional Fields - Only show if has data */}
              {r.helpType === 'EDUCATION_SUPPORT' && 
               (r.schoolGrade || (r.requiredItems && r.requiredItems.length > 0) || r.examYear) && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">🎓 Education Support Details</h6>
                  {r.schoolGrade && <p><strong>School Grade:</strong> {r.schoolGrade}</p>}
                  {r.requiredItems && r.requiredItems.length > 0 && (
                    <p><strong>Required Items:</strong> {r.requiredItems.join(', ')}</p>
                  )}
                  {r.examYear && <p><strong>Exam Year:</strong> {r.examYear}</p>}
                </div>
              )}

              {/* 🏥 Medical Conditional Fields - Only show if has data */}
              {r.helpType === 'MEDICAL_HELP' && 
               (r.conditionDescription || r.urgencyLevel || r.hospitalName || r.estimatedCost || r.medicalReportUrl) && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">🏥 Medical Help Details</h6>
                  {r.conditionDescription && <p><strong>Condition Description:</strong> {r.conditionDescription}</p>}
                  {r.urgencyLevel && <p><strong>Urgency Level:</strong> {r.urgencyLevel}</p>}
                  {r.hospitalName && <p><strong>Hospital/Clinic:</strong> {r.hospitalName}</p>}
                  {r.estimatedCost && <p><strong>Estimated Cost:</strong> {r.estimatedCost}</p>}
                  {r.medicalReportUrl && (
                    <div className="mt-2">
                      <a href={`${getUploadBaseUrl()}${r.medicalReportUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                        View Medical Report
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* 🏠 Shelter Conditional Fields - Only show if has data */}
              {r.helpType === 'SHELTER' && 
               (r.currentHousingType !== undefined || r.riskOfEviction !== undefined || r.immediateDanger !== undefined) && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">🏠 Shelter Details</h6>
                  {r.currentHousingType && <p><strong>Current Housing Type:</strong> {r.currentHousingType}</p>}
                  {r.riskOfEviction !== undefined && (
                    <p><strong>Risk of Eviction:</strong> <Badge bg={r.riskOfEviction ? 'danger' : 'success'}>{r.riskOfEviction ? 'Yes' : 'No'}</Badge></p>
                  )}
                  {r.immediateDanger !== undefined && (
                    <p><strong>Immediate Danger:</strong> <Badge bg={r.immediateDanger ? 'danger' : 'success'}>{r.immediateDanger ? 'Yes' : 'No'}</Badge></p>
                  )}
                </div>
              )}

              {/* 👕 Clothing Conditional Fields - Only show if has data */}
              {r.helpType === 'CLOTHING' && r.quantityNeeded && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">👕 Clothing Details</h6>
                  <p><strong>Quantity Needed:</strong> {r.quantityNeeded}</p>
                </div>
              )}

              {/* 🧠 Counseling Conditional Fields - Only show if has data */}
              {r.helpType === 'COUNSELING' && 
               (r.counselingType || r.preferredContactMethod) && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="mb-3">🧠 Counseling Details</h6>
                  {r.counselingType && <p><strong>Counseling Type:</strong> {r.counselingType}</p>}
                  {r.preferredContactMethod && <p><strong>Preferred Contact Method:</strong> {r.preferredContactMethod}</p>}
                </div>
              )}

              {/* Evidence / Documents - Always show, with better display */}
              <div className="mt-4">
                <h6 className="mb-3">Evidence / Documents</h6>
                {r.documentUrls && r.documentUrls.length > 0 ? (
                  <div className="row g-3">
                    {r.documentUrls.map((url, i) => {
                      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url)
                      const fileName = url.split('/').pop() || `Document ${i + 1}`
                      return (
                        <div key={url} className="col-md-4 col-sm-6">
                          <Card className="h-100 border">
                            <Card.Body className="p-3">
                              {isImage ? (
                                <div className="mb-2" style={{ height: '150px', overflow: 'hidden', borderRadius: '4px' }}>
                                  <img
                                    src={`${getUploadBaseUrl()}${url}`}
                                    alt={`Evidence ${i + 1}`}
                                    className="w-100 h-100"
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                      const parent = target.parentElement
                                      if (parent) {
                                        parent.innerHTML = '<div class="d-flex align-items-center justify-content-center h-100 text-muted"><span>Image not available</span></div>'
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="mb-2 d-flex align-items-center justify-content-center bg-light rounded" style={{ height: '150px' }}>
                                  <span className="fs-1">📄</span>
                                </div>
                              )}
                              <div className="small text-muted mb-2" style={{ 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap' 
                              }}>
                                {fileName}
                              </div>
                              <a
                                href={`${getUploadBaseUrl()}${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary w-100"
                                aria-label={`View evidence ${i + 1}`}
                              >
                                View
                              </a>
                            </Card.Body>
                          </Card>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted">No evidence files uploaded for this help request</p>
                )}
              </div>
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

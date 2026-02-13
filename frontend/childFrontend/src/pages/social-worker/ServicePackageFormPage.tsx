import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import type { HelpType, ServicePackageDTO, ServicePackageStatus } from '../../types/dashboard'
import {
  createServicePackage,
  getServicePackage,
  updateServicePackage,
} from '../../services/socialWorkerApi'
import './SocialWorkerDashboard.css'

type PackageHelpType = Extract<
  HelpType,
  'FOOD_ASSISTANCE' | 'EDUCATION_SUPPORT' | 'MEDICAL_HELP' | 'SHELTER' | 'CLOTHING' | 'COUNSELING' | 'OTHER'
>

type TargetGroup = 'CHILD' | 'FAMILY' | 'INDIVIDUAL' | 'EMERGENCY'
type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH'

const TARGET_GROUP_LABELS: Record<TargetGroup, string> = {
  CHILD: 'Child',
  FAMILY: 'Family',
  INDIVIDUAL: 'Individual',
  EMERGENCY: 'Emergency',
}

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

const SERVICE_CATEGORIES: { id: string; label: string; icon: string; items: string[] }[] = [
  {
    id: 'FOOD',
    label: 'Food Assistance',
    icon: '🍱',
    items: ['Grocery vouchers', 'Hot meal delivery', 'Nutritional counselling', 'Special dietary support'],
  },
  {
    id: 'EDUCATION',
    label: 'Educational Support',
    icon: '🎓',
    items: ['School fees', 'Books & stationery', 'Tuition / mentoring'],
  },
  {
    id: 'MEDICAL',
    label: 'Medical Help',
    icon: '🏥',
    items: ['Doctor consultation', 'Medicines', 'Lab tests'],
  },
  {
    id: 'SHELTER',
    label: 'Shelter',
    icon: '🏠',
    items: ['Temporary accommodation', 'Rent assistance', 'Safe house referral'],
  },
  {
    id: 'CLOTHING',
    label: 'Clothing',
    icon: '👕',
    items: ['Clothing kits', 'School uniforms', 'Hygiene items'],
  },
  {
    id: 'COUNSELING',
    label: 'Counselling',
    icon: '🧠',
    items: ['Individual counselling', 'Family counselling', 'Trauma support'],
  },
  {
    id: 'OTHER',
    label: 'Other',
    icon: '🔧',
    items: ['Legal aid', 'Transportation', 'Job support'],
  },
]

const HELP_TYPE_FROM_CATEGORY: Record<string, PackageHelpType> = {
  FOOD: 'FOOD_ASSISTANCE',
  EDUCATION: 'EDUCATION_SUPPORT',
  MEDICAL: 'MEDICAL_HELP',
  SHELTER: 'SHELTER',
  CLOTHING: 'CLOTHING',
  COUNSELING: 'COUNSELING',
  OTHER: 'OTHER',
}

export function ServicePackageFormPage() {
  const { packageId } = useParams<{ packageId: string }>()
  const navigate = useNavigate()
  const isEdit = !!packageId

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetGroup, setTargetGroup] = useState<TargetGroup | ''>('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM')
  const [addedItems, setAddedItems] = useState<string[]>([])
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
  const [addSelectValue, setAddSelectValue] = useState('')
  const [customServiceInput, setCustomServiceInput] = useState('')

  const primaryType = useMemo(() => {
    const counts: Record<string, number> = {}
    SERVICE_CATEGORIES.forEach((cat) => {
      const count = cat.items.filter((item) => addedItems.includes(item)).length
      if (count > 0) counts[HELP_TYPE_FROM_CATEGORY[cat.id]] = count
    })
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return entries[0]?.[0] ?? 'OTHER'
  }, [addedItems])

  useEffect(() => {
    if (!isEdit || !packageId) return
    const load = async () => {
      try {
        setLoading(true)
        const pkg = await getServicePackage(packageId)
        setName(pkg.title)
        setDescription(pkg.description ?? '')
        setEstimatedDuration(pkg.estimatedDuration ?? '')
        const formItems = SERVICE_CATEGORIES.flatMap((c) => c.items)
        const normalize = (s: string) => s.toLowerCase().replace(/counseling/g, 'counselling')
        const list: string[] = []
        pkg.items?.forEach((pkgItem) => {
          const match = formItems.find((f) => f === pkgItem || normalize(f) === normalize(pkgItem))
          list.push(match ?? pkgItem)
        })
        setAddedItems(list)
      } catch (err) {
        setError((err as Error).message ?? 'Package not found')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [packageId, isEdit])

  const selectedCount = addedItems.length

  const handleAddService = (item: string) => {
    const trimmed = item.trim()
    if (!trimmed) return
    setAddedItems((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setAddSelectValue('')
  }

  const handleAddCustom = () => {
    const trimmed = customServiceInput.trim()
    if (!trimmed) return
    setAddedItems((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setCustomServiceInput('')
  }

  const handleRemoveService = (index: number) => {
    setAddedItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async (status: ServicePackageStatus) => {
    if (!name.trim()) {
      setError('Package name is required')
      return
    }

    setError(null)
    setLoading(true)

    const items = [...addedItems]

    const payload: Omit<ServicePackageDTO, 'id' | 'createdAt' | 'updatedAt'> = {
      title: name.trim(),
      requestType: primaryType as PackageHelpType,
      description: description.trim() || undefined,
      estimatedDuration: estimatedDuration.trim() || undefined,
      items,
      status,
    }

    try {
      if (isEdit) {
        await updateServicePackage(packageId!, payload)
        navigate('/social-worker/packages')
      } else {
        await createServicePackage(payload)
        navigate('/social-worker/packages')
      }
    } catch (err) {
      setError((err as Error).message ?? 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit && !name) {
    return (
      <Container fluid className="py-4 sw-dashboard">
        <div className="p-5 text-center text-muted">Loading package…</div>
      </Container>
    )
  }

  if (error && isEdit && !name) {
    return (
      <Container fluid className="py-4 sw-dashboard">
        <div className="alert alert-danger">{error}</div>
        <Link to="/social-worker/packages">← Back to packages</Link>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4 sw-dashboard">
      <Row className="mb-4">
        <Col xs={12}>
          <Link to="/social-worker/packages" className="btn btn-link text-decoration-none p-0 mb-2">
            ← Back to Service Packages
          </Link>
          <h1 className="h3 fw-700 mb-1">
            {isEdit ? 'Edit Service Package' : 'Create Service Package'}
          </h1>
          <p className="text-muted mb-0">
            {isEdit
              ? 'Update package details and services.'
              : 'Define a structured service bundle reusable across help requests.'}
          </p>
          {isEdit && (
            <div className="alert alert-warning small mt-3 mb-0">
              <strong>Note:</strong> If this package is already used in active requests, changes will apply only to future assignments.
            </div>
          )}
        </Col>
      </Row>

      <div className="d-flex mb-3 gap-2">
        <Button
          variant={step === 1 ? 'primary' : 'outline-secondary'}
          size="sm"
          onClick={() => setStep(1)}
        >
          🧾 Step 1: Basic Package Info
        </Button>
        <Button
          variant={step === 2 ? 'primary' : 'outline-secondary'}
          size="sm"
          onClick={() => setStep(2)}
        >
          🧩 Step 2: Select Services
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger mb-3">{error}</div>
      )}

      {step === 1 && (
        <Card className="sw-card border-0 mb-4">
          <Card.Header className="bg-white border-0 pt-4 pb-3">
            <h5 className="mb-0 fw-700">🧾 Step 1: Basic Package Info</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Label className="small fw-600 text-muted">Package Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Emergency Food & Shelter Support"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Col>
              <Col xs={12} md={6}>
                <Form.Label className="small fw-600 text-muted">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Short explanation of this package"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <Form.Label className="small fw-600 text-muted">Target Group</Form.Label>
                <Form.Select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value as TargetGroup | '')}
                >
                  <option value="">Select (optional)</option>
                  {(Object.keys(TARGET_GROUP_LABELS) as TargetGroup[]).map((tg) => (
                    <option key={tg} value={tg}>{TARGET_GROUP_LABELS[tg]}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={4}>
                <Form.Label className="small fw-600 text-muted">Estimated Duration</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. 2 weeks, 3 months, 10 days"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Add any time frame that makes sense for this package (for example, &quot;6 weeks of support&quot;).
                </Form.Text>
              </Col>
              <Col xs={12} md={4}>
                <Form.Label className="small fw-600 text-muted">Priority Level</Form.Label>
                <Form.Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                >
                  {(Object.keys(PRIORITY_LABELS) as PriorityLevel[]).map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <div className="mt-4">
              <Button variant="primary" onClick={() => setStep(2)}>
                Next: Select Services →
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {step === 2 && (
        <Card className="sw-card border-0 mb-4">
          <Card.Header className="bg-white border-0 pt-4 pb-3">
            <h5 className="mb-0 fw-700">🧩 Step 2: Select Services (Core Form)</h5>
            <p className="small text-muted mb-0 mt-1">
              Add services from the list below or type your own. Each added service can have optional notes.
              {selectedCount > 0 && (
                <span className="ms-1 fw-600 text-dark">{selectedCount} in package</span>
              )}
            </p>
          </Card.Header>
          <Card.Body>
            {/* Added services list */}
            {addedItems.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-600 mb-2">Services in this package</h6>
                <div className="d-flex flex-column gap-2">
                  {addedItems.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="d-flex flex-column gap-1 p-2 rounded border bg-light"
                    >
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <span className="fw-600">{item}</span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="shrink-0"
                          onClick={() => handleRemoveService(index)}
                          aria-label={`Remove ${item}`}
                        >
                          ✕ Remove
                        </Button>
                      </div>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Optional notes for this service"
                        value={itemNotes[item] ?? ''}
                        onChange={(e) =>
                          setItemNotes((prev) => ({ ...prev, [item]: e.target.value }))
                        }
                      />

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add from list */}
            <div className="mb-3">
              <h6 className="fw-600 mb-2">Add service from list</h6>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <Form.Select
                  className="w-auto"
                  style={{ minWidth: '220px' }}
                  value={addSelectValue}
                  onChange={(e) => setAddSelectValue(e.target.value)}
                >
                  <option value="">Choose a service…</option>
                  {SERVICE_CATEGORIES.map((category) => (
                    <optgroup key={category.id} label={`${category.icon} ${category.label}`}>
                      {category.items.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Form.Select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddService(addSelectValue)}
                  disabled={!addSelectValue.trim()}
                >
                  Add to package
                </Button>
              </div>
            </div>

            {/* Add custom */}
            <div>
              <h6 className="fw-600 mb-2">Or add your own</h6>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <Form.Control
                  className="flex-grow-1"
                  style={{ maxWidth: 320 }}
                  type="text"
                  placeholder="e.g. Custom support, Special arrangement"
                  value={customServiceInput}
                  onChange={(e) => setCustomServiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleAddCustom}
                  disabled={!customServiceInput.trim()}
                >
                  Add custom
                </Button>
              </div>
            </div>

            <div className="mt-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
              <Button variant="outline-secondary" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => navigate('/social-worker/packages')}>
                  ❌ Cancel
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => handleSave('DRAFT')}
                  disabled={loading || !name.trim()}
                >
                  💾 Save as Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSave('PUBLISHED')}
                  disabled={loading || !name.trim()}
                >
                  ✅ Save & Activate Package
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  )
}

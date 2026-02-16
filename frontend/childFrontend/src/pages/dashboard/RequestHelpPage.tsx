import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Card } from 'react-bootstrap'
import { createHelpRequest } from '../../services/dashboardApi'
import { uploadRegistrationDocument } from '../../services/authApi'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import type { HelpType } from '../../types/dashboard'

const HELP_TYPES: HelpType[] = ['FOOD_ASSISTANCE', 'EDUCATION_SUPPORT', 'MEDICAL_HELP', 'SHELTER', 'CLOTHING', 'COUNSELING', 'LIVELIHOOD_EMPLOYMENT', 'DISABILITY_SUPPORT', 'OTHER']

export function RequestHelpPage() {
  const navigate = useNavigate()
  const [anonymous, setAnonymous] = useState(false)
  const [helpTypes, setHelpTypes] = useState<HelpType[]>([])
  const [description, setDescription] = useState('')
  const [gender, setGender] = useState('')
  const [approximateAge, setApproximateAge] = useState('')
  const [location, setLocation] = useState('')
  const [documentUrls, setDocumentUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Food Assistance fields
  const [familyMembers, setFamilyMembers] = useState('')
  const [monthlyIncomeRange, setMonthlyIncomeRange] = useState('')
  const [employmentStatus, setEmploymentStatus] = useState('')

  // Education fields
  const [schoolGrade, setSchoolGrade] = useState('')
  const [requiredItems, setRequiredItems] = useState<string[]>([])
  const [examYear, setExamYear] = useState('')

  // Medical fields
  const [conditionDescription, setConditionDescription] = useState('')
  const [urgencyLevel, setUrgencyLevel] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [medicalReportUrl, setMedicalReportUrl] = useState<string | null>(null)

  // Shelter fields
  const [currentHousingType, setCurrentHousingType] = useState('')
  const [riskOfEviction, setRiskOfEviction] = useState<boolean | null>(null)
  const [immediateDanger, setImmediateDanger] = useState<boolean | null>(null)

  // Clothing fields
  const [quantityNeeded, setQuantityNeeded] = useState('')

  // Counseling fields
  const [counselingType, setCounselingType] = useState('')
  const [preferredContactMethod, setPreferredContactMethod] = useState('')

  const toggleHelpType = (type: HelpType) => {
    setHelpTypes([type])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadRegistrationDocument(file)
      setDocumentUrls((prev) => [...prev, url])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleMedicalReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadRegistrationDocument(file)
      setMedicalReportUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Medical report upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const toggleRequiredItem = (item: string) => {
    if (requiredItems.includes(item)) {
      setRequiredItems(requiredItems.filter((i) => i !== item))
    } else {
      setRequiredItems([...requiredItems, item])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!description.trim()) {
      setError('Description is required')
      return
    }
    if (helpTypes.length === 0) {
      setError('Please select at least one help type')
      return
    }
    setSubmitting(true)
    try {
      const res = await createHelpRequest({
        anonymous,
        helpType: helpTypes[0],
        description: description.trim(),
        approximateAge: approximateAge.trim() || undefined,
        gender: gender.trim() || undefined,
        location: location.trim() || undefined,
        documentUrls: documentUrls.length > 0 ? documentUrls : undefined,
        familyMembers: familyMembers.trim() ? parseInt(familyMembers) : undefined,
        monthlyIncomeRange: monthlyIncomeRange.trim() || undefined,
        employmentStatus: employmentStatus.trim() || undefined,
        schoolGrade: schoolGrade.trim() || undefined,
        requiredItems: requiredItems.length > 0 ? requiredItems : undefined,
        examYear: examYear.trim() || undefined,
        conditionDescription: conditionDescription.trim() || undefined,
        urgencyLevel: urgencyLevel.trim() || undefined,
        hospitalName: hospitalName.trim() || undefined,
        estimatedCost: estimatedCost.trim() || undefined,
        medicalReportUrl: medicalReportUrl || undefined,
        currentHousingType: currentHousingType.trim() || undefined,
        riskOfEviction: riskOfEviction !== null ? riskOfEviction : undefined,
        immediateDanger: immediateDanger !== null ? immediateDanger : undefined,
        quantityNeeded: quantityNeeded.trim() || undefined,
        counselingType: counselingType.trim() || undefined,
        preferredContactMethod: preferredContactMethod.trim() || undefined,
      })
      if (res.success) {
        navigate(res.requestId ? `/dashboard/requests/${res.requestId}` : '/dashboard/my-requests')
      } else {
        setError(res.message || 'Failed to create request')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="h4 fw-bold mb-4">Request Help</h2>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4 p-md-5">
          <Form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="anonymous"
                label="Submit anonymously"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Gender (optional)</Form.Label>
              <Form.Select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="NOT_SPECIFIED">Not Specified</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Type of Help Needed * (Select one)</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {HELP_TYPES.map((type) => (
                  <Form.Check
                    key={type}
                    type="radio"
                    name="helpType"
                    id={`helptype-${type}`}
                    label={HELP_TYPE_LABELS[type]}
                    checked={helpTypes.includes(type)}
                    onChange={() => toggleHelpType(type)}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what kind of help you need..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Approximate age (optional)</Form.Label>
              <Form.Control
                type="text"
                value={approximateAge}
                onChange={(e) => setApproximateAge(e.target.value)}
                placeholder="e.g. 5–7 years, under 10"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location (optional)</Form.Label>
              <Form.Control
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your location or area"
              />
            </Form.Group>

            {/* 🥘 Food Assistance */}
            {helpTypes.includes('FOOD_ASSISTANCE') && (
              <Card className="mb-4 bg-light border-0">
                <Card.Body>
                  <h5 className="mb-3">🥘 Food Assistance Details</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Number of family members (optional)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={familyMembers}
                      onChange={(e) => setFamilyMembers(e.target.value)}
                      placeholder="e.g. 4"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Monthly income range (optional)</Form.Label>
                    <Form.Select value={monthlyIncomeRange} onChange={(e) => setMonthlyIncomeRange(e.target.value)}>
                      <option value="">Select range</option>
                      <option value="BELOW_5000">Below 5,000</option>
                      <option value="5000_10000">5,000 - 10,000</option>
                      <option value="10000_20000">10,000 - 20,000</option>
                      <option value="20000_50000">20,000 - 50,000</option>
                      <option value="ABOVE_50000">Above 50,000</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Current employment status (optional)</Form.Label>
                    <Form.Select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)}>
                      <option value="">Select status</option>
                      <option value="EMPLOYED">Employed</option>
                      <option value="SELF_EMPLOYED">Self-employed</option>
                      <option value="UNEMPLOYED">Unemployed</option>
                      <option value="STUDENT">Student</option>
                      <option value="HOMEMAKER">Homemaker</option>
                      <option value="RETIRED">Retired</option>
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>
            )}

            {/* 🎓 Education */}
            {helpTypes.includes('EDUCATION_SUPPORT') && (
              <Card className="mb-4 bg-light border-0">
                <Card.Body>
                  <h5 className="mb-3">🎓 Education Support Details</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>School grade (optional)</Form.Label>
                    <Form.Select value={schoolGrade} onChange={(e) => setSchoolGrade(e.target.value)}>
                      <option value="">Select grade</option>
                      <option value="NURSERY">Nursery / Pre-K</option>
                      <option value="PRIMARY">Primary (1-5)</option>
                      <option value="MIDDLE">Middle (6-8)</option>
                      <option value="SECONDARY">Secondary (9-10)</option>
                      <option value="HIGHER_SECONDARY">Higher Secondary (11-12)</option>
                      <option value="COLLEGE">College</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Required items (optional)</Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                      {['Books', 'Fees', 'Uniform', 'Transport'].map((item) => (
                        <Form.Check
                          key={item}
                          type="checkbox"
                          id={`item-${item}`}
                          label={item}
                          checked={requiredItems.includes(item)}
                          onChange={() => toggleRequiredItem(item)}
                        />
                      ))}
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Exam year (optional)</Form.Label>
                    <Form.Control
                      type="text"
                      value={examYear}
                      onChange={(e) => setExamYear(e.target.value)}
                      placeholder="e.g. 2026"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            )}

            {/* 🏥 Medical */}
            {helpTypes.includes('MEDICAL_HELP') && (
              <Card className="mb-4 bg-light border-0">
                <Card.Body>
                  <h5 className="mb-3">🏥 Medical Help Details</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Condition description (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={conditionDescription}
                      onChange={(e) => setConditionDescription(e.target.value)}
                      placeholder="Describe the medical condition..."
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Urgency level (optional)</Form.Label>
                    <Form.Select value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value)}>
                      <option value="">Select urgency</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="EMERGENCY">Emergency</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Hospital/Clinic name (optional)</Form.Label>
                    <Form.Control
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. Central Medical Hospital"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Estimated cost (optional)</Form.Label>
                    <Form.Control
                      type="text"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="e.g. 50000"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Medical report (optional)</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleMedicalReportUpload}
                      disabled={uploading}
                    />
                    {uploading && <small className="text-muted">Uploading...</small>}
                    {medicalReportUrl && <small className="text-success">✓ Report uploaded</small>}
                  </Form.Group>
                </Card.Body>
              </Card>
            )}

            {/* 🏠 Shelter */}
            {helpTypes.includes('SHELTER') && (
              <Card className="mb-4 bg-light border-0">
                <Card.Body>
                  <h5 className="mb-3">🏠 Shelter Details</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Current housing type (optional)</Form.Label>
                    <Form.Select value={currentHousingType} onChange={(e) => setCurrentHousingType(e.target.value)}>
                      <option value="">Select type</option>
                      <option value="OWNED">Owned</option>
                      <option value="RENTED">Rented</option>
                      <option value="SHARED">Shared accommodation</option>
                      <option value="TEMPORARY">Temporary shelter</option>
                      <option value="HOMELESS">Homeless</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Risk of eviction?</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        name="riskOfEviction"
                        id="eviction-yes"
                        label="Yes"
                        checked={riskOfEviction === true}
                        onChange={() => setRiskOfEviction(true)}
                      />
                      <Form.Check
                        type="radio"
                        name="riskOfEviction"
                        id="eviction-no"
                        label="No"
                        checked={riskOfEviction === false}
                        onChange={() => setRiskOfEviction(false)}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Immediate danger?</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        name="immediateDanger"
                        id="danger-yes"
                        label="Yes"
                        checked={immediateDanger === true}
                        onChange={() => setImmediateDanger(true)}
                      />
                      <Form.Check
                        type="radio"
                        name="immediateDanger"
                        id="danger-no"
                        label="No"
                        checked={immediateDanger === false}
                        onChange={() => setImmediateDanger(false)}
                      />
                    </div>
                  </Form.Group>
                </Card.Body>
              </Card>
            )}

            {/* 👕 Clothing */}
            {helpTypes.includes('CLOTHING') && (
              <Card className="mb-4 bg-light border-0">
                <Card.Body>
                  <h5 className="mb-3">👕 Clothing Details</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity needed (optional)</Form.Label>
                    <Form.Control
                      type="text"
                      value={quantityNeeded}
                      onChange={(e) => setQuantityNeeded(e.target.value)}
                      placeholder="e.g. 2 sets of clothing, 1 pair of shoes"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            )}

            {/* 🧠 Counseling */}
            {helpTypes.includes('COUNSELING') && (
              <Card className="mb-4 bg-light border-0">
                <Card.Body>
                  <h5 className="mb-3">🧠 Counseling Details</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Type of counseling (optional)</Form.Label>
                    <Form.Select value={counselingType} onChange={(e) => setCounselingType(e.target.value)}>
                      <option value="">Select type</option>
                      <option value="TRAUMA">Trauma counseling</option>
                      <option value="ABUSE">Abuse recovery</option>
                      <option value="EMOTIONAL">Emotional support</option>
                      <option value="FAMILY">Family counseling</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Preferred contact method (optional)</Form.Label>
                    <Form.Select value={preferredContactMethod} onChange={(e) => setPreferredContactMethod(e.target.value)}>
                      <option value="">Select method</option>
                      <option value="IN_PERSON">In-person</option>
                      <option value="PHONE">Phone</option>
                      <option value="ONLINE">Online/Video call</option>
                      <option value="HOME_VISIT">Home visit</option>
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>
            )}

            <Form.Group className="mb-4">
              <Form.Label>Supporting Documents (optional)</Form.Label>
              <Form.Control type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} disabled={uploading} />
              {uploading && <small className="text-muted">Uploading...</small>}
              {documentUrls.length > 0 && (
                <div className="mt-2">
                  {documentUrls.map((url, i) => (
                    <span key={i} className="badge bg-light text-dark me-1">{url.split('/').pop()}</span>
                  ))}
                </div>
              )}
            </Form.Group>
            <Button type="submit" variant="primary" className="rounded-pill px-4" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

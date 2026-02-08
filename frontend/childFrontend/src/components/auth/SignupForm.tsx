import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Button, Card } from 'react-bootstrap'
import type { Role, RegisterRequest } from '../../types/auth'
import { ROLE_LABELS } from '../../types/auth'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import { FileUploadField } from './FileUploadField'
import { registerPublicUser, registerPoliceStation, registerSocialWorker, uploadRegistrationDocument } from '../../services/authApi'

const REGISTRABLE_ROLES: Role[] = ['PU', 'PO', 'SW']

const initialForm: RegisterRequest = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
  role: 'PU',
  termsAccepted: false,
  stationName: '',
  district: '',
  city: '',
  officerInChargeName: '',
  locationCoordinates: '',
  officerIdProofUrl: '',
  governmentApprovalLetterUrl: '',
  allocatedResources: '',
  staffDetails: '',
  licenseNumber: '',
  organization: '',
  specializations: '',
  yearsOfExperience: '',
  certificationDocumentUrl: '',
}

export function SignupForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterRequest>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k: keyof RegisterRequest, v: unknown) => {
    if (k === 'role') {
      const newRole = v as Role
      setForm((prev) => {
        const next = { ...prev, role: newRole }
        // Clear role-specific fields when switching
        if (newRole !== 'PO') {
          next.stationName = next.district = next.city = next.locationCoordinates = ''
          next.officerIdProofUrl = next.governmentApprovalLetterUrl = ''
          next.allocatedResources = next.staffDetails = ''
        }
        if (newRole !== 'SW') {
          next.licenseNumber = next.organization = next.specializations = ''
          next.yearsOfExperience = next.certificationDocumentUrl = ''
        }
        return next
      })
    } else {
      setForm((prev) => ({ ...prev, [k]: v }))
    }
    setErrors((prev) => {
      const next = { ...prev }
      delete next[k as string]
      return next
    })
    setServerError('')
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.fullName?.trim()) e.fullName = 'Full name is required'
    if (!form.email?.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.termsAccepted) e.termsAccepted = 'You must accept the Terms and Privacy Policy'

    if (form.role === 'PO') {
      if (!form.stationName?.trim()) e.stationName = 'Station name is required'
      if (!form.district?.trim()) e.district = 'District is required'
      if (!form.city?.trim()) e.city = 'City is required'
      if (!form.locationCoordinates?.trim()) e.locationCoordinates = 'Enter station coordinates (latitude,longitude)'
      if (!form.officerIdProofUrl?.trim()) e.officerIdProofUrl = 'Officer in charge ID proof is required'
      if (!form.governmentApprovalLetterUrl?.trim()) e.governmentApprovalLetterUrl = 'Government approval letter is required'
    }
    if (form.role === 'SW') {
      if (!form.licenseNumber?.trim()) e.licenseNumber = 'License number is required'
      if (!form.certificationDocumentUrl?.trim()) e.certificationDocumentUrl = 'Upload certification certificate file'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError('')
    try {
      const payload: RegisterRequest = {
        ...form,
        role: form.role,
        termsAccepted: true,
      }
      let res
      if (form.role === 'PU') res = await registerPublicUser(payload)
      else if (form.role === 'PO') res = await registerPoliceStation(payload)
      else if (form.role === 'SW') res = await registerSocialWorker(payload)
      else {
        setServerError('Admin registration is not available. Please contact your administrator.')
        setLoading(false)
        return
      }
      if (res.approved && res.token) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify({ userId: res.userId, email: res.email, fullName: res.fullName, role: res.role }))
        navigate('/')
        window.location.reload()
      } else {
        setServerError(res.message || 'Registration failed')
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const Input = ({
    name,
    label,
    type = 'text',
    required,
    placeholder,
  }: {
    name: keyof RegisterRequest
    label: string
    type?: string
    required?: boolean
    placeholder?: string
  }) => (
    <Form.Group className="mb-3">
      <Form.Label>{label} {required && '*'}</Form.Label>
      <Form.Control
        type={type}
        value={(form[name] as string) ?? ''}
        onChange={(e) => update(name, e.target.value)}
        isInvalid={!!errors[name as string]}
        placeholder={placeholder}
        className="auth-input"
        autoComplete={type === 'password' ? 'new-password' : undefined}
      />
      <Form.Control.Feedback type="invalid">{errors[name as string]}</Form.Control.Feedback>
    </Form.Group>
  )

  return (
    <Card className="shadow-sm border-0 rounded-4 overflow-hidden auth-card">
      <Card.Body className="p-4 p-md-5">
        <h2 className="h3 fw-bold text-dark mb-2">Create Account</h2>
        <p className="text-secondary mb-4">Join the Child Protection and Support Portal</p>

        {serverError && (
          <div className="alert alert-danger py-2 small" role="alert">
            {serverError}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Role *</Form.Label>
            <Form.Select
              value={form.role}
              onChange={(e) => update('role', e.target.value as Role)}
              className="auth-input"
            >
              {REGISTRABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Input name="fullName" label={form.role === 'PO' ? 'Contact person / Officer in charge name' : 'Full Name'} required placeholder={form.role === 'PO' ? 'Name of person in charge' : 'Your full name'} />
          <Input name="email" label="Email" type="email" required placeholder="you@example.com" />
          <Input name="phone" label={form.role === 'PO' ? 'Station contact number' : 'Phone (optional)'} placeholder="+1 234 567 8900" />
          <Input name="address" label={form.role === 'PO' ? 'Station address' : 'Address (optional)'} placeholder="Full address" />

          {form.role === 'PO' && (
            <>
              <Input name="stationName" label="Station Name" required placeholder="e.g. Central Police Station" />
              <Input name="district" label="District" required placeholder="District name" />
              <Input name="city" label="City" required placeholder="City name" />
              <Input name="officerInChargeName" label="Officer in charge name (optional)" placeholder="If different from above" />
              <Form.Group className="mb-3">
                <Form.Label>Station location (latitude,longitude) *</Form.Label>
                <Form.Control
                  type="text"
                  value={form.locationCoordinates ?? ''}
                  onChange={(e) => update('locationCoordinates', e.target.value)}
                  isInvalid={!!errors.locationCoordinates}
                  placeholder="e.g. 7.8731,80.7718"
                  className="auth-input"
                />
                <Form.Text className="text-muted">
                  Enter coordinates in format latitude,longitude (e.g. 7.8731,80.7718). You can find coordinates using Google Maps.
                </Form.Text>
                <Form.Control.Feedback type="invalid">{errors.locationCoordinates}</Form.Control.Feedback>
              </Form.Group>
              <FileUploadField
                label="Officer in charge ID proof"
                value={form.officerIdProofUrl ?? ''}
                onChange={(v) => update('officerIdProofUrl', v)}
                onUpload={uploadRegistrationDocument}
                required
                error={errors.officerIdProofUrl}
              />
              <FileUploadField
                label="Government approval letter"
                value={form.governmentApprovalLetterUrl ?? ''}
                onChange={(v) => update('governmentApprovalLetterUrl', v)}
                onUpload={uploadRegistrationDocument}
                required
                error={errors.governmentApprovalLetterUrl}
              />
              <Form.Group className="mb-3">
                <Form.Label>Allocated resources</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={form.allocatedResources ?? ''}
                  onChange={(e) => update('allocatedResources', e.target.value)}
                  placeholder="e.g. vehicles, equipment, budget allocated to the station"
                  className="auth-input"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Staff details</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.staffDetails ?? ''}
                  onChange={(e) => update('staffDetails', e.target.value)}
                  placeholder="Names, roles, and contact of key staff"
                  className="auth-input"
                />
              </Form.Group>
            </>
          )}

          {form.role === 'SW' && (
            <>
              <Input name="licenseNumber" label="License Number" required placeholder="Social work license number" />
              <Input name="organization" label="Organization" placeholder="Employing organization" />
              <Input name="specializations" label="Specializations" placeholder="e.g. Child Welfare, Family Services" />
              <Input name="yearsOfExperience" label="Years of Experience" placeholder="e.g. 5" />
              <FileUploadField
                label="Certification certificate"
                value={form.certificationDocumentUrl ?? ''}
                onChange={(v) => update('certificationDocumentUrl', v)}
                onUpload={uploadRegistrationDocument}
                required
                error={errors.certificationDocumentUrl}
              />
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Password *</Form.Label>
            <Form.Control
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              isInvalid={!!errors.password}
              placeholder="At least 6 characters"
              className="auth-input"
              autoComplete="new-password"
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            <PasswordStrengthIndicator password={form.password} className="mt-2" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password *</Form.Label>
            <Form.Control
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              isInvalid={!!errors.confirmPassword}
              placeholder="Re-enter password"
              className="auth-input"
              autoComplete="new-password"
            />
            <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="terms"
              label={
                <>
                  I agree to the <a href="#" className="text-primary">Terms of Service</a> and{' '}
                  <a href="#" className="text-primary">Privacy Policy</a>
                </>
              }
              checked={form.termsAccepted}
              onChange={(e) => update('termsAccepted', e.target.checked)}
              isInvalid={!!errors.termsAccepted}
            />
            <Form.Control.Feedback type="invalid">{errors.termsAccepted}</Form.Control.Feedback>
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100 py-2 rounded-pill fw-semibold btn-primary-custom"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </Form>

        <p className="text-center text-secondary small mt-4 mb-0">
          Already have an account? <Link to="/login" className="text-primary fw-medium">Log in</Link>
        </p>
      </Card.Body>
    </Card>
  )
}

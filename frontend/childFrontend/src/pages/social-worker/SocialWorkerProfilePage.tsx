import { useEffect, useState } from 'react'
import { Card, Container, Row, Col, Button, Form, Alert } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import { getUploadBaseUrl } from '../../services/api'
import { getUserProfile, updateUserProfile, changePassword } from '../../services/socialWorkerApi'

interface UserProfile {
  id: string
  fullName?: string
  email?: string
  phone?: string
  address?: string
  profilePhoto?: string
  licenseNumber?: string
  organization?: string
  specializations?: string[]
  yearsOfExperience?: string
  certificationDocumentUrl?: string
}

const getInitials = (fullName?: string) => {
  if (!fullName) return 'SW'
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function SocialWorkerProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Editable fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [organization, setOrganization] = useState('')
  const [specializations, setSpecializations] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user?.userId) {
        setLoadingProfile(false)
        return
      }
      try {
        const data = await getUserProfile(user.userId)
        setProfile(data)
        setFullName(data.fullName || '')
        setPhone(data.phone || '')
        setAddress(data.address || '')
        setLicenseNumber(data.licenseNumber || '')
        setOrganization(data.organization || '')
        setSpecializations(Array.isArray(data.specializations) ? data.specializations.join(', ') : '')
        setYearsOfExperience(data.yearsOfExperience || '')
      } catch (err) {
        console.error('Failed to load user profile', err)
      } finally {
        setLoadingProfile(false)
      }
    }

    void load()
  }, [user?.userId])

  const handleEditClick = () => {
    setIsEditing(true)
    setMessage(null)
  }

  const handleCancelClick = () => {
    setIsEditing(false)
    setMessage(null)
    // Reset to original values
    if (profile) {
      setFullName(profile.fullName || '')
      setPhone(profile.phone || '')
      setAddress(profile.address || '')
      setLicenseNumber(profile.licenseNumber || '')
      setOrganization(profile.organization || '')
      setSpecializations(Array.isArray(profile.specializations) ? profile.specializations.join(', ') : '')
      setYearsOfExperience(profile.yearsOfExperience || '')
    }
  }

  const handleSaveClick = async () => {
    if (!user?.userId) return
    setSaving(true)
    setMessage(null)
    try {
      const specializationsArray = specializations
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      await updateUserProfile(user.userId, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        licenseNumber: licenseNumber.trim() || undefined,
        organization: organization.trim() || undefined,
        specializations: specializationsArray.length > 0 ? specializationsArray : undefined,
        yearsOfExperience: yearsOfExperience.trim() || undefined,
      })

      // Reload profile
      const updatedProfile = await getUserProfile(user.userId)
      setProfile(updatedProfile)
      setIsEditing(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user?.userId) return
    setPasswordMessage(null)

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordMessage({
        type: 'error',
        text: 'Please fill in all password fields.',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'New password and confirmation do not match.',
      })
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: 'error',
        text: 'New password should be at least 8 characters long.',
      })
      return
    }

    try {
      setChangingPassword(true)
      await changePassword(user.userId, currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage({
        type: 'success',
        text: 'Password updated successfully.',
      })
      setTimeout(() => setPasswordMessage(null), 3000)
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to change password.',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const displayName = profile?.fullName ?? user?.fullName ?? 'Social Worker'
  const displayEmail = profile?.email ?? user?.email ?? ''
  const displayPhone = profile?.phone ?? user?.phone ?? ''
  const displayAddress = profile?.address ?? user?.address ?? ''
  const displayLicense = profile?.licenseNumber ?? user?.licenseNumber ?? ''
  const displayOrganization = profile?.organization ?? user?.organization ?? ''

  const displaySpecializations = (() => {
    if (profile?.specializations && Array.isArray(profile.specializations)) {
      return profile.specializations.join(', ')
    }
    if (Array.isArray(user?.specializations)) {
      return user.specializations.join(', ')
    }
    if (typeof user?.specializations === 'string') {
      return user.specializations
    }
    return ''
  })()

  const displayYearsOfExperience = profile?.yearsOfExperience ?? user?.yearsOfExperience ?? ''

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h3 fw-700 mb-1">My Profile 👤</h1>
        <p className="text-muted">
          {isEditing ? 'Edit your profile information' : 'View your registered information'}
        </p>
      </div>
      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'danger'} dismissible className="mb-3">
          {message.text}
        </Alert>
      )}
      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card className="sw-card border-0">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Personal Information</h5>
            </Card.Header>
            <Card.Body>
              {/* Profile photo and basic info */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                  style={{
                    width: '72px',
                    height: '72px',
                    backgroundColor: '#3b82f6',
                    overflow: 'hidden',
                    fontSize: '1.4rem',
                  }}
                >
                  {(profile?.profilePhoto ?? user?.profilePhoto) ? (
                    <img
                      src={profile?.profilePhoto ?? user?.profilePhoto}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
                <div>
                  <div className="fw-700" style={{ fontSize: '1.1rem' }}>
                    {displayName}
                  </div>
                  {displayEmail && (
                    <div className="text-muted small">{displayEmail}</div>
                  )}
                  <div className="text-muted small">Role: Social Worker</div>
                </div>
              </div>

              {loadingProfile ? (
                <div className="text-muted small">Loading your profile details…</div>
              ) : (
                <>
                  <Row className="g-3">
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          value={isEditing ? fullName : displayName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={displayEmail} disabled />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          value={isEditing ? phone : (displayPhone || 'Not provided')}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter phone number"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Professional ID</Form.Label>
                        <Form.Control value={user?.userId?.slice(0, 8) ?? ''} disabled />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          value={isEditing ? address : (displayAddress || 'Not provided')}
                          onChange={(e) => setAddress(e.target.value)}
                          as="textarea"
                          rows={2}
                          disabled={!isEditing}
                          placeholder="Enter your address"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>License Number</Form.Label>
                        <Form.Control
                          value={isEditing ? licenseNumber : (displayLicense || 'Not provided')}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter license number"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Organization</Form.Label>
                        <Form.Control
                          value={isEditing ? organization : (displayOrganization || 'Not provided')}
                          onChange={(e) => setOrganization(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter organization"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Specializations (comma-separated)</Form.Label>
                        <Form.Control
                          value={isEditing ? specializations : (displaySpecializations || 'Not provided')}
                          onChange={(e) => setSpecializations(e.target.value)}
                          disabled={!isEditing}
                          placeholder="e.g. Child Psychology, Trauma Counseling, Family Support"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Years of Experience</Form.Label>
                        <Form.Control
                          value={isEditing ? yearsOfExperience : (displayYearsOfExperience || 'Not provided')}
                          onChange={(e) => setYearsOfExperience(e.target.value)}
                          disabled={!isEditing}
                          placeholder="e.g. 5 years"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Certificate (PDF / Image)</Form.Label>
                        {profile?.certificationDocumentUrl ? (
                          <div>
                            <a
                              href={`${getUploadBaseUrl()}${profile.certificationDocumentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View uploaded certificate
                            </a>
                          </div>
                        ) : (
                          <Form.Control value="No certificate on file" disabled />
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    {isEditing ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={handleCancelClick}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleSaveClick}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    ) : (
                      <Button variant="primary" onClick={handleEditClick}>
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="sw-card border-0">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Account Security</h5>
            </Card.Header>
            <Card.Body id="change-password">
              <p className="text-muted small mb-3">
                Update your password regularly to keep your account secure.
              </p>
              {passwordMessage && (
                <Alert
                  variant={passwordMessage.type === 'success' ? 'success' : 'danger'}
                  dismissible
                  className="mb-3"
                  onClose={() => setPasswordMessage(null)}
                >
                  {passwordMessage.text}
                </Alert>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Current password</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New password</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm new password</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button
                  variant="primary"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Updating…' : 'Change Password'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

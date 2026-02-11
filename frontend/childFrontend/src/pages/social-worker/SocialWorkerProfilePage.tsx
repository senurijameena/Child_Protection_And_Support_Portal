import { useEffect, useState } from 'react'
import { Card, Container, Row, Col, Button, Form } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import { getUserProfile } from '../../services/socialWorkerApi'

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

  useEffect(() => {
    const load = async () => {
      if (!user?.userId) {
        setLoadingProfile(false)
        return
      }
      try {
        const data = await getUserProfile(user.userId)
        setProfile(data)
      } catch (err) {
        console.error('Failed to load user profile', err)
      } finally {
        setLoadingProfile(false)
      }
    }

    void load()
  }, [user?.userId])

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
        <p className="text-muted">View the information you provided during registration</p>
      </div>
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
                        <Form.Control value={displayName} disabled />
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
                          value={displayPhone || 'Not provided'}
                          disabled
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
                          value={displayAddress || 'Not provided'}
                          as="textarea"
                          rows={2}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>License Number</Form.Label>
                        <Form.Control
                          value={displayLicense || 'Not provided'}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Organization</Form.Label>
                        <Form.Control
                          value={displayOrganization || 'Not provided'}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Specializations</Form.Label>
                        <Form.Control
                          value={displaySpecializations || 'Not provided'}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Years of Experience</Form.Label>
                        <Form.Control
                          value={displayYearsOfExperience || 'Not provided'}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Certificate (PDF / Image)</Form.Label>
                        {profile?.certificationDocumentUrl ? (
                          <div>
                            <a
                              href={profile.certificationDocumentUrl}
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

                  <div className="d-flex justify-content-end mt-2">
                    <Button variant="primary" disabled>
                      Edit Profile (coming soon)
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

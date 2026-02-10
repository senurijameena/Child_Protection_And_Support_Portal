import { useEffect, useState } from 'react'
import { Card, Form, Button, Spinner, Tab, Tabs, Alert } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator'
import {
  getUserProfile,
  updateUserProfile,
  uploadProfilePhoto,
  changePassword,
} from '../../services/socialWorkerApi'
import { uploadRegistrationDocument } from '../../services/authApi'
import { FileUploadField } from '../../components/auth/FileUploadField'

const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api')

export function SocialWorkerProfilePage() {
  const { user, refreshUser } = useAuth()
  const userId = user?.userId ?? ''
  const [profile, setProfile] = useState<{
    id?: string
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
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    organization: '',
    specializations: '',
    yearsOfExperience: '',
    certificationDocumentUrl: '',
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    getUserProfile(userId)
      .then((p) => {
        setProfile(p)
        setEditForm({
          fullName: p?.fullName || '',
          email: p?.email || '',
          phone: p?.phone || '',
          address: p?.address || '',
          licenseNumber: p?.licenseNumber || '',
          organization: p?.organization || '',
          specializations: p?.specializations ? p.specializations.join(', ') : '',
          yearsOfExperience: p?.yearsOfExperience || '',
          certificationDocumentUrl: p?.certificationDocumentUrl || '',
        })
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [userId])

  const photoUrl = photoPreview || profile?.profilePhoto
  const baseUrl = API_BASE.replace(/\/api\/?$/, '')
  const displayPhoto = photoUrl
    ? (photoUrl.startsWith('http') ? photoUrl : photoUrl.startsWith('data:') ? photoUrl : `${baseUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`)
    : null

  const handleSaveProfile = async () => {
    if (!userId) return
    setSaveLoading(true)
    setSaveMsg(null)
    try {
      const specList = editForm.specializations.split(',').map(s => s.trim()).filter(Boolean)
      await updateUserProfile(userId, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        licenseNumber: editForm.licenseNumber.trim(),
        organization: editForm.organization.trim(),
        specializations: specList,
        yearsOfExperience: editForm.yearsOfExperience.trim(),
        certificationDocumentUrl: editForm.certificationDocumentUrl.trim(),
      })
      setProfile((prev) => prev ? { ...prev, ...editForm, specializations: specList } : null)
      setEditMode(false)
      setSaveMsg({ type: 'success', text: 'Profile updated successfully.' })
      refreshUser?.()
    } catch (e) {
      setSaveMsg({ type: 'danger', text: e instanceof Error ? e.message : 'Failed to update profile.' })
    } finally {
      setSaveLoading(false)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSaveMsg({ type: 'danger', text: 'Please select an image file (JPG, PNG, etc.).' })
        return
      }
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSavePhoto = async () => {
    if (!userId || !photoFile) return
    setPhotoLoading(true)
    setSaveMsg(null)
    try {
      await uploadProfilePhoto(userId, photoFile)
      setPhotoFile(null)
      setPhotoPreview(null)
      setSaveMsg({ type: 'success', text: 'Profile image updated successfully.' })
      getUserProfile(userId).then(setProfile)
      refreshUser?.()
    } catch (e) {
      setSaveMsg({ type: 'danger', text: e instanceof Error ? e.message : 'Failed to upload image.' })
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!userId || pwdForm.currentPassword === '' || pwdForm.newPassword === '' || pwdForm.confirmPassword === '') {
      setPwdMsg({ type: 'danger', text: 'All fields are required.' })
      return
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'danger', text: 'New password and confirmation do not match.' })
      return
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdMsg({ type: 'danger', text: 'New password must be at least 6 characters.' })
      return
    }
    setPwdLoading(true)
    setPwdMsg(null)
    try {
      await changePassword(userId, pwdForm.currentPassword, pwdForm.newPassword)
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPwdMsg({ type: 'success', text: 'Password changed successfully.' })
    } catch (e) {
      setPwdMsg({ type: 'danger', text: e instanceof Error ? e.message : 'Failed to change password.' })
    } finally {
      setPwdLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: '#2d6a4f' }} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Profile & Account Settings</h1>
        <p className="text-muted mb-0">View and manage your social worker profile.</p>
      </div>

      <Tabs defaultActiveKey="profile" className="mb-3">
        <Tab eventKey="profile" title="👤 Profile">
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Profile Management</h5>
            </Card.Header>
            <Card.Body>
              {saveMsg && (
                <Alert variant={saveMsg.type} dismissible onClose={() => setSaveMsg(null)}>
                  {saveMsg.text}
                </Alert>
              )}
              <div className="d-flex flex-wrap gap-4 align-items-start mb-4">
                <div className="text-center">
                  <div
                    className="rounded-circle border bg-light d-flex align-items-center justify-content-center overflow-hidden"
                    style={{ width: 100, height: 100 }}
                  >
                    {displayPhoto ? (
                      <img src={displayPhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="fs-1 text-muted">👤</span>
                    )}
                  </div>
                  <p className="small text-muted mt-2 mb-0">Image preview</p>
                  <Form.Group className="mt-2">
                    <Form.Control type="file" accept="image/*" onChange={handlePhotoSelect} className="small" />
                    {photoFile && (
                      <Button
                        size="sm"
                        className="sw-btn-primary mt-2"
                        onClick={handleSavePhoto}
                        disabled={photoLoading}
                      >
                        {photoLoading ? 'Saving...' : 'Save Image'}
                      </Button>
                    )}
                  </Form.Group>
                </div>
                <div className="flex-grow-1">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Form.Label className="small text-muted">Social Worker ID</Form.Label>
                      <p className="mb-0 fw-medium font-monospace">{user?.userId || '-'}</p>
                    </div>
                    {!editMode ? (
                      <>
                        <div className="col-md-6">
                          <Form.Label className="small text-muted">Full Name</Form.Label>
                          <p className="mb-0 fw-medium">{profile?.fullName || user?.fullName || '-'}</p>
                        </div>
                        <div className="col-md-6">
                          <Form.Label className="small text-muted">Email</Form.Label>
                          <p className="mb-0 fw-medium">{profile?.email || user?.email || '-'}</p>
                        </div>
                        <div className="col-md-6">
                          <Form.Label className="small text-muted">Phone</Form.Label>
                          <p className="mb-0 fw-medium">{profile?.phone || '-'}</p>
                        </div>
                        <div className="col-md-6">
                          <Form.Label className="small text-muted">Address</Form.Label>
                          <p className="mb-0 fw-medium">{profile?.address || '-'}</p>
                        </div>
                        <div className="col-md-6">
                          <Form.Label className="small text-muted">License Number</Form.Label>
                          <p className="mb-0 fw-medium">{profile?.licenseNumber || '-'}</p>
                        </div>
                        <div className="col-md-6">
                          <Form.Label className="small text-muted">Organization</Form.Label>
                          <p className="mb-0 fw-medium">{profile?.organization || '-'}</p>
                        </div>
                        <div className="col-md-6">
                          <Form.Label className="small text-muted">Specializations</Form.Label>
                          <p className="mb-0 fw-medium">{profile?.specializations?.join(', ') || '-'}</p>
                        </div>
                        <div className="col-md-6">
                          <Form.Label className="small text-muted">Years of Experience</Form.Label>
                          <p className="mb-0 fw-medium">{profile?.yearsOfExperience || '-'}</p>
                        </div>
                        <div className="col-md-12">
                          <Form.Label className="small text-muted">Certification Certificate</Form.Label>
                          {profile?.certificationDocumentUrl ? (
                            <div className="mt-1">
                              <a href={profile.certificationDocumentUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                                View Certificate
                              </a>
                            </div>
                          ) : (
                            <p className="mb-0 fw-medium text-muted">-</p>
                          )}
                        </div>
                        <div className="col-12 mt-4">
                          <Button variant="outline-secondary" size="sm" onClick={() => setEditMode(true)}>
                            Edit Profile
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-md-6">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            value={editForm.fullName}
                            onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                            placeholder="Full name"
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            value={editForm.email}
                            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                            placeholder="Email address"
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            value={editForm.phone}
                            onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                            placeholder="Phone number"
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            value={editForm.address}
                            onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                            placeholder="Full address"
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>License Number</Form.Label>
                          <Form.Control
                            value={editForm.licenseNumber}
                            onChange={(e) => setEditForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                            placeholder="Social work license number"
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Organization</Form.Label>
                          <Form.Control
                            value={editForm.organization}
                            onChange={(e) => setEditForm((f) => ({ ...f, organization: e.target.value }))}
                            placeholder="Employing organization"
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Specializations</Form.Label>
                          <Form.Control
                            value={editForm.specializations}
                            onChange={(e) => setEditForm((f) => ({ ...f, specializations: e.target.value }))}
                            placeholder="e.g. Child Welfare, Family Services"
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Years of Experience</Form.Label>
                          <Form.Control
                            value={editForm.yearsOfExperience}
                            onChange={(e) => setEditForm((f) => ({ ...f, yearsOfExperience: e.target.value }))}
                            placeholder="e.g. 5"
                          />
                        </div>
                        <div className="col-md-12">
                          <FileUploadField
                            label="Certification Certificate"
                            value={editForm.certificationDocumentUrl}
                            onChange={(url: string) => setEditForm((f) => ({ ...f, certificationDocumentUrl: url }))}
                            onUpload={uploadRegistrationDocument}
                            required={false}
                          />
                          {editForm.certificationDocumentUrl && (
                            <div className="mt-1">
                              <a
                                href={editForm.certificationDocumentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none small me-3"
                              >
                                📄 View current certificate
                              </a>
                              <Button
                                variant="link"
                                className="text-danger p-0 small text-decoration-none"
                                onClick={() => setEditForm((f) => ({ ...f, certificationDocumentUrl: '' }))}
                              >
                                ❌ Remove
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="col-12 mt-4">
                          <Button
                            className="sw-btn-primary me-2"
                            size="sm"
                            onClick={handleSaveProfile}
                            disabled={saveLoading}
                          >
                            {saveLoading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="outline-secondary" size="sm" onClick={() => setEditMode(false)}>
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="security" title="🔐 Password & Security">
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Change Password</h5>
              <p className="text-muted small mb-0">Current password verification required.</p>
            </Card.Header>
            <Card.Body>
              {pwdMsg && (
                <Alert variant={pwdMsg.type} dismissible onClose={() => setPwdMsg(null)}>
                  {pwdMsg.text}
                </Alert>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <PasswordStrengthIndicator password={pwdForm.newPassword} className="mt-2" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
              </Form.Group>
              <Button
                className="sw-btn-primary"
                onClick={handleChangePassword}
                disabled={pwdLoading || !pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword}
              >
                {pwdLoading ? 'Updating...' : 'Change Password'}
              </Button>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  )
}

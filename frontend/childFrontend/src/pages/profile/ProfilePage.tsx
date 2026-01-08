import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { caseService } from '../../services/caseService';
import { helpRequestService } from '../../services/helpRequestService';
import feedbackService from '../../services/feedbackService';
import './ProfilePage.css';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  createdAt?: string;
  defaultAnonymous?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  showNameToOfficers?: boolean;
  autoDeleteAfterYears?: number;
}

interface AccountStats {
  memberSince: string;
  totalCases: number;
  helpRequests: number;
  feedbackGiven: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    id: currentUser?.id || '',
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    profileImage: currentUser?.profileImage,
    defaultAnonymous: false,
    emailNotifications: true,
    smsNotifications: false,
    showNameToOfficers: true,
    autoDeleteAfterYears: 1,
  });

  const [stats, setStats] = useState<AccountStats>({
    memberSince: '',
    totalCases: 0,
    helpRequests: 0,
    feedbackGiven: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = currentUser?.id;
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      // Fetch user profile
      let profileData: any = null;
      try {
        const profileResponse = await userService.getUserProfile(userId);
        if (profileResponse.data) {
          profileData = profileResponse.data;
          setProfile(prev => ({
            ...prev,
            name: profileData.fullName || profileData.name || prev.name,
            email: profileData.email || prev.email,
            phone: profileData.phone || prev.phone,
            profileImage: profileData.profilePhoto || profileData.profileImage || prev.profileImage,
            createdAt: profileData.createdAt || profileData.registrationDate || prev.createdAt,
            defaultAnonymous: profileData.defaultAnonymous ?? prev.defaultAnonymous,
            emailNotifications: profileData.emailNotifications ?? prev.emailNotifications,
            smsNotifications: profileData.smsNotifications ?? prev.smsNotifications,
            showNameToOfficers: profileData.showNameToOfficers ?? prev.showNameToOfficers,
            autoDeleteAfterYears: profileData.autoDeleteAfterYears || prev.autoDeleteAfterYears,
          }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }

      // Fetch stats
      const [casesResponse, helpRequestsResponse, feedbackResponse] = await Promise.all([
        caseService.getMyCases().catch(() => ({ data: [] })),
        helpRequestService.getMyRequests().catch(() => ({ data: [] })),
        feedbackService.getFeedbackByUser(userId).catch(() => []),
      ]);

      const cases = Array.isArray(casesResponse.data) ? casesResponse.data : [];
      const helpRequests = Array.isArray(helpRequestsResponse.data) ? helpRequestsResponse.data : [];
      const feedback = Array.isArray(feedbackResponse) ? feedbackResponse : [];

      // Calculate memberSince from profile data or currentUser
      const memberSince = (profileData?.createdAt || profileData?.registrationDate || currentUser?.createdAt || new Date().toISOString());
      const memberSinceDate = new Date(memberSince);
      const memberSinceFormatted = memberSinceDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      setStats({
        memberSince: memberSinceFormatted,
        totalCases: cases.length,
        helpRequests: helpRequests.length,
        feedbackGiven: feedback.length,
      });

    } catch (err: any) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile photo must be less than 5MB');
        return;
      }
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const userId = currentUser?.id;
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      // Upload profile photo if changed
      if (profilePhotoFile) {
        const formData = new FormData();
        formData.append('photo', profilePhotoFile);
        await userService.uploadProfilePhoto(userId, formData);
      }

      // Update profile
      const updateData = {
        fullName: profile.name,
        phone: profile.phone,
        defaultAnonymous: profile.defaultAnonymous,
        emailNotifications: profile.emailNotifications,
        smsNotifications: profile.smsNotifications,
        showNameToOfficers: profile.showNameToOfficers,
        autoDeleteAfterYears: profile.autoDeleteAfterYears,
      };

      const updateResponse = await userService.updateUserProfile(userId, updateData);

      // If profile photo was uploaded, get the updated photo URL from response
      let updatedProfileImage = profilePhotoPreview || profile.profileImage;
      if (profilePhotoFile) {
        // After upload, fetch the updated profile to get the new photo URL
        try {
          const photoResponse = await userService.getUserProfile(userId);
          if (photoResponse.data?.profilePhoto || photoResponse.data?.profileImage) {
            updatedProfileImage = photoResponse.data.profilePhoto || photoResponse.data.profileImage;
          }
        } catch (err) {
          console.error('Error fetching updated profile photo:', err);
        }
      } else if (updateResponse?.data?.profilePhoto || updateResponse?.data?.profileImage) {
        updatedProfileImage = updateResponse.data.profilePhoto || updateResponse.data.profileImage;
      }

      // Update local user data in localStorage
      const updatedUser = {
        ...currentUser,
        name: profile.name,
        phone: profile.phone,
        profileImage: updatedProfileImage,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update profile state with new image if available
      if (updatedProfileImage) {
        setProfile(prev => ({
          ...prev,
          profileImage: updatedProfileImage,
        }));
      }

      // Trigger a custom event to notify other components of user data update
      window.dispatchEvent(new CustomEvent('userProfileUpdated', {
        detail: { user: updatedUser }
      }));

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);

      // Refresh profile data immediately
      await fetchProfileData();

    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setProfile(prev => ({
        ...prev,
        defaultAnonymous: false,
        emailNotifications: true,
        smsNotifications: false,
        showNameToOfficers: true,
        autoDeleteAfterYears: 1,
      }));
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  if (loading) {
    return (
      <Container className="profile-page">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <div className="profile-page">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">👤 MY PROFILE</h2>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={handleEditProfile} disabled={isEditing}>
              ✏️ Edit Profile
            </Button>
            <Button variant="outline-secondary" onClick={handleChangePassword}>
              🔒 Change Password
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
            {success}
          </Alert>
        )}

        <Row className="mb-4 g-3">
          {/* Profile Photo */}
          <Col md={6} lg={4}>
            <Card className="profile-photo-card h-100">
              <Card.Body className="text-center">
                <div className="profile-photo-container mb-3">
                  <div className="profile-photo-wrapper">
                    {profilePhotoPreview || profile.profileImage ? (
                      <img
                        src={profilePhotoPreview || profile.profileImage}
                        alt="Profile"
                        className="profile-photo"
                      />
                    ) : (
                      <div className="profile-photo-placeholder">
                        {profile.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    {isEditing && (
                      <label className="profile-photo-upload-label">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePhotoChange}
                          className="d-none"
                        />
                        <span className="upload-hint">Click to change</span>
                      </label>
                    )}
                  </div>
                </div>
                <h5 className="mb-0">🖼️ PROFILE PHOTO</h5>
                {isEditing && (
                  <small className="text-muted">Click photo to upload</small>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Account Stats */}
          <Col md={6} lg={4}>
            <Card className="account-stats-card h-100">
              <Card.Body>
                <h5 className="mb-4">📊 ACCOUNT STATS</h5>
                <div className="stats-list">
                  <div className="stat-item">
                    <span className="stat-label">Member Since:</span>
                    <span className="stat-value">{stats.memberSince}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Cases:</span>
                    <span className="stat-value">{stats.totalCases}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Help Requests:</span>
                    <span className="stat-value">{stats.helpRequests}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Feedback Given:</span>
                    <span className="stat-value">{stats.feedbackGiven}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Personal Information & Settings */}
        <Card className="profile-settings-card">
          <Card.Body>
            <h5 className="mb-4">Personal Information:</h5>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Full Name:</Form.Label>
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="profile-value">{profile.name}</div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Email:</Form.Label>
                  <div className="profile-value">{profile.email}</div>
                  <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Phone:</Form.Label>
                  {isEditing ? (
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={profile.phone || ''}
                      onChange={handleInputChange}
                      placeholder="+1-555-0123"
                    />
                  ) : (
                    <div className="profile-value">{profile.phone || 'Not provided'}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />

            <h5 className="mb-4">Reporting Preferences:</h5>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Default Anonymous:</Form.Label>
                  {isEditing ? (
                    <Form.Check
                      type="checkbox"
                      name="defaultAnonymous"
                      checked={profile.defaultAnonymous}
                      onChange={handleInputChange}
                      label={profile.defaultAnonymous ? '✅ Yes' : '❌ No'}
                    />
                  ) : (
                    <div className="profile-value">
                      {profile.defaultAnonymous ? '✅ Yes' : '❌ No'}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Email Notifications:</Form.Label>
                  {isEditing ? (
                    <Form.Check
                      type="checkbox"
                      name="emailNotifications"
                      checked={profile.emailNotifications}
                      onChange={handleInputChange}
                      label={profile.emailNotifications ? '✅ Enabled' : '❌ Disabled'}
                    />
                  ) : (
                    <div className="profile-value">
                      {profile.emailNotifications ? '✅ Enabled' : '❌ Disabled'}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">SMS Notifications:</Form.Label>
                  {isEditing ? (
                    <Form.Check
                      type="checkbox"
                      name="smsNotifications"
                      checked={profile.smsNotifications}
                      onChange={handleInputChange}
                      label={profile.smsNotifications ? '✅ Enabled' : '❌ Disabled'}
                    />
                  ) : (
                    <div className="profile-value">
                      {profile.smsNotifications ? '✅ Enabled' : '❌ Disabled'}
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />

            <h5 className="mb-4">Privacy Settings:</h5>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Show my name to officers:</Form.Label>
                  {isEditing ? (
                    <Form.Check
                      type="checkbox"
                      name="showNameToOfficers"
                      checked={profile.showNameToOfficers}
                      onChange={handleInputChange}
                      label={profile.showNameToOfficers ? '✅ Yes' : '❌ No'}
                    />
                  ) : (
                    <div className="profile-value">
                      {profile.showNameToOfficers ? '✅ Yes' : '❌ No'}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Auto-delete old cases after:</Form.Label>
                  {isEditing ? (
                    <Form.Select
                      name="autoDeleteAfterYears"
                      value={profile.autoDeleteAfterYears || 1}
                      onChange={handleInputChange}
                    >
                      <option value={1}>1 year</option>
                      <option value={2}>2 years</option>
                      <option value={3}>3 years</option>
                      <option value={5}>5 years</option>
                      <option value={0}>Never</option>
                    </Form.Select>
                  ) : (
                    <div className="profile-value">
                      {profile.autoDeleteAfterYears === 0
                        ? 'Never'
                        : `${profile.autoDeleteAfterYears || 1} year${(profile.autoDeleteAfterYears || 1) > 1 ? 's' : ''}`}
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {isEditing && (
              <div className="d-flex gap-2 justify-content-end mt-4">
                <Button
                  variant="secondary"
                  onClick={handleResetToDefaults}
                  disabled={saving}
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setProfilePhotoFile(null);
                    setProfilePhotoPreview(null);
                    fetchProfileData();
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ProfilePage;

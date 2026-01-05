import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Button, Spinner,
  Form, Table, Badge, Dropdown, InputGroup
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService, UserRole } from '../../services/authService';
import { adminService } from '../../services/adminService';
import { userService } from '../../services/userService';
import { statusService } from '../../services/statusService';
import './UserManagement.css';

interface User {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  roleLabel: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  approved: boolean;
  active: boolean;
  registrationDate: string;
  lastLogin?: string;
  profileImage?: string;
  documents?: {
    idProof: 'VERIFIED' | 'PENDING' | 'REJECTED';
    badgeCopy?: 'VERIFIED' | 'PENDING' | 'REJECTED';
    licenseCopy?: 'VERIFIED' | 'PENDING' | 'REJECTED';
    authorization?: 'VERIFIED' | 'PENDING' | 'REJECTED';
  };
  roleSpecific?: {
    badgeNumber?: string;
    department?: string;
    rank?: string;
    stationAddress?: string;
    licenseNumber?: string;
    specializations?: string[];
    organization?: string;
    yearsOfExperience?: string;
  };
  activityStats?: {
    casesHandled: number;
    activeCases: number;
    resolutionRate: number;
    avgResponseTime: number;
    userSatisfaction?: number;
  };
  caseCount?: number;
  availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY' | 'EMERGENCY_ONLY';
  statusChangedAt?: string;
  currentStatus?: {
    availability: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
    workload: string;
    lastStatusChange: string;
  };
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ALL');

  const [_showUserDetails, setShowUserDetails] = useState(false);
  const [_showRejectModal, setShowRejectModal] = useState(false);
  const [_showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [_selectedUser, setSelectedUser] = useState<User | null>(null);
  const [_rejectionReasons, _setRejectionReasons] = useState<string[]>([]);
  const [_rejectionNote, _setRejectionNote] = useState('');
  const [_bulkEmailSubject, _setBulkEmailSubject] = useState('');
  const [_bulkEmailContent, _setBulkEmailContent] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);










  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== UserRole.ADMIN) {
      navigate('/unauthorized');
      return;
    }

    loadInitialData();

    const refreshInterval = setInterval(() => {
      loadInitialData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [user, navigate]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, roleFilter, statusFilter, allUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredUsers]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users by role - adminService returns response.data which is the array
      const [policeData, socialWorkerData, publicData, adminData] = await Promise.all([
        adminService.getUsersByRole('PO').catch(() => []),
        adminService.getUsersByRole('SW').catch(() => []),
        adminService.getUsersByRole('PUBLIC').catch(() => []),
        adminService.getUsersByRole('ADMIN').catch(() => [])
      ]);

      // Normalize all users to a common format
      const normalizeUser = (user: any): User => {
        if (!user) return null as any;
        
        const userId = user.id || user.userId || user._id || '';
        // Handle role - backend uses PO, SW, PUBLIC, ADMIN
        let roleStr = user.role;
        if (typeof roleStr === 'object' && roleStr?.name) {
          roleStr = roleStr.name;
        }
        if (!roleStr) roleStr = 'PUBLIC';
        
        // Map backend role codes to frontend role enum
        let role: UserRole = UserRole.PUBLIC;
        if (roleStr === 'PO' || roleStr === 'POLICE') {
          role = UserRole.POLICE;
        } else if (roleStr === 'SW' || roleStr === 'SOCIAL_WORKER') {
          role = UserRole.SOCIAL_WORKER;
        } else if (roleStr === 'ADMIN') {
          role = UserRole.ADMIN;
        } else {
          role = UserRole.PUBLIC;
        }
        
        // Determine status based on active and approved flags
        let status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' = 'ACTIVE';
        if (user.active === false) {
          status = 'INACTIVE';
        } else if (user.approved === false) {
          status = 'PENDING';
        } else if (user.suspended === true) {
          status = 'SUSPENDED';
        }

        // Get role label
        let roleLabel = 'User';
        switch (role) {
          case UserRole.POLICE: roleLabel = 'Police'; break;
          case UserRole.SOCIAL_WORKER: roleLabel = 'Social'; break;
          case UserRole.PUBLIC: roleLabel = 'Public'; break;
          case UserRole.ADMIN: roleLabel = 'Admin'; break;
        }

        return {
          id: userId,
          userId: userId,
          fullName: user.fullName || user.name || user.userName || 'Unknown User',
          email: user.email || '',
          phone: user.phone || user.phoneNumber || '',
          role: role,
          roleLabel: roleLabel,
          status: status,
          approved: user.approved !== false,
          active: user.active !== false,
          registrationDate: user.registrationDate || user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin || user.lastActive,
          profileImage: user.profilePhoto || user.profileImage,
          availabilityStatus: user.availabilityStatus,
          statusChangedAt: user.statusChangedAt
        };
      };

      // Combine all users and normalize
      const allUsersList = [
        ...(Array.isArray(policeData) ? policeData : []),
        ...(Array.isArray(socialWorkerData) ? socialWorkerData : []),
        ...(Array.isArray(publicData) ? publicData : []),
        ...(Array.isArray(adminData) ? adminData : [])
      ]
      .filter(user => user != null)
      .map(normalizeUser)
      .filter(user => user != null);

      // Add case counts and status info
      const usersWithCaseCounts = await Promise.all(
        allUsersList.map(async (user) => {
          try {
            // Try to get user stats, but don't fail if it doesn't work
            let caseCount = 0;
            try {
              const statsResponse = await userService.getUserStats(user.id || user.userId).catch(() => null);
              caseCount = statsResponse?.data?.casesHandled || statsResponse?.data?.totalCases || user.currentCaseCount || 0;
            } catch {
              // Ignore stats errors
            }
            
            // Set current status from availabilityStatus
            let currentStatus = null;
            if (user.availabilityStatus) {
              const availabilityStatus = user.availabilityStatus;
              currentStatus = {
                availability: availabilityStatus === 'AVAILABLE' ? 'AVAILABLE' : 
                             availabilityStatus === 'BUSY' ? 'BUSY' : 
                             availabilityStatus === 'OFF_DUTY' ? 'OFFLINE' : 
                             availabilityStatus === 'EMERGENCY_ONLY' ? 'AWAY' : 'AWAY',
                workload: 'Normal',
                lastStatusChange: user.statusChangedAt || new Date().toISOString()
              };
            }
            
            return {
              ...user,
              caseCount,
              currentStatus
            };
          } catch {
            return {
              ...user,
              caseCount: 0
            };
          }
        })
      );

      setAllUsers(usersWithCaseCounts);
      setFilteredUsers(usersWithCaseCounts);
    } catch (err: any) {
      console.error('Error loading user data:', err);
      setError(err.response?.data?.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allUsers];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(user => {
        const fullName = (user.fullName || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const userId = (user.userId || user.id || '').toLowerCase();
        const phone = (user.phone || '').toLowerCase();
        
        return fullName.includes(query) ||
               email.includes(query) ||
               userId.includes(query) ||
               phone.includes(query);
      });
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => {
        // Direct comparison since we normalized roles in normalizeUser
        return user.role === roleFilter;
      });
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(user => {
        const userStatus = (user.status || '').toUpperCase();
        const filterStatus = statusFilter.toUpperCase();
        return userStatus === filterStatus;
      });
    }

    setFilteredUsers(filtered);
  };



  const handleToggleUserStatus = async (_userId: string, activate: boolean) => {
    try {

      setSuccess(`User ${activate ? 'activation' : 'deactivation'} requested!`);
      setTimeout(() => setSuccess(null), 3000);
      await loadInitialData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };


























  const getRoleIcon = (role: UserRole): string => {
    switch (role) {
      case UserRole.POLICE: return '👮';
      case UserRole.SOCIAL_WORKER: return '🏥';
      case UserRole.PUBLIC: return '👤';
      case UserRole.ADMIN: return '👨‍💼';
      default: return '👤';
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case UserRole.POLICE: return 'Police';
      case UserRole.SOCIAL_WORKER: return 'Social';
      case UserRole.PUBLIC: return 'Public';
      case UserRole.ADMIN: return 'Admin';
      default: return 'User';
    }
  };

  const formatUserId = (userId: string): string => {

    const match = userId.match(/\d+/);
    if (match) {
      const num = match[0];
      return `U${num.padStart(3, '0')}`;
    }
    return userId.substring(0, 4).toUpperCase();
  };

  const formatLastActive = (lastLogin?: string, currentStatus?: any): string => {
    if (currentStatus?.availability === 'AVAILABLE' || currentStatus?.availability === 'ONLINE') {
      return 'Online now';
    }
    
    if (!lastLogin) return '-';
    
    try {
      const date = new Date(lastLogin);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return lastLogin;
    }
  };

  const getStatusBadgeDisplay = (status: string, currentStatus?: any) => {
    const availability = currentStatus?.availability;
    
    // Show availability status badge for social workers and police officers
    if (availability) {
      if (availability === 'AVAILABLE' || availability === 'ONLINE') {
        return <Badge bg="success" className="d-inline-flex align-items-center gap-1">🟢 Available</Badge>;
      }
      if (availability === 'BUSY') {
        return <Badge bg="warning" className="d-inline-flex align-items-center gap-1">⚪ Busy</Badge>;
      }
      if (availability === 'OFF_DUTY' || availability === 'OFFLINE') {
        return <Badge bg="secondary" className="d-inline-flex align-items-center gap-1">🔴 Off Duty</Badge>;
      }
      if (availability === 'AWAY') {
        return <Badge bg="info" className="d-inline-flex align-items-center gap-1">🟡 Away</Badge>;
      }
    }
    
    const config: Record<string, { variant: string; text: string; icon: string }> = {
      ACTIVE: { variant: 'success', text: '✅ Active', icon: 'bi-check-circle' },
      PENDING: { variant: 'warning', text: '⏳ Pending', icon: 'bi-clock' },
      INACTIVE: { variant: 'secondary', text: 'INACTIVE', icon: 'bi-slash-circle' },
      SUSPENDED: { variant: 'danger', text: 'SUSPENDED', icon: 'bi-x-circle' }
    };
    
    const badgeConfig = config[status] || { variant: 'light', text: status, icon: 'bi-question' };
    
    return (
      <Badge bg={badgeConfig.variant} className="d-inline-flex align-items-center gap-1">
        {badgeConfig.text}
      </Badge>
    );
  };

  const renderAllUsers = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
      <>
        {}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="page-title mb-0">
            <span className="title-icon">👥</span>
            ALL USERS
          </h2>
          <InputGroup style={{ maxWidth: '300px' }}>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="🔍 Search Users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>

        {}
        <Card className="mb-4 filter-bar-card">
          <Card.Body className="py-2">
            <Row className="g-3 align-items-center">
              <Col md={3}>
                <div className="d-flex align-items-center gap-2">
                  <label className="filter-label mb-0">Role:</label>
                  <Form.Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                    size="sm"
                    className="filter-select"
                  >
                    <option value="ALL">All</option>
                    <option value={UserRole.PUBLIC}>Public</option>
                    <option value={UserRole.POLICE}>Police</option>
                    <option value={UserRole.SOCIAL_WORKER}>Social Worker</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </Form.Select>
                </div>
              </Col>
              <Col md={3}>
                <div className="d-flex align-items-center gap-2">
                  <label className="filter-label mb-0">Status:</label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
                    size="sm"
                    className="filter-select"
                  >
                    <option value="ALL">All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </Form.Select>
                </div>
              </Col>
              <Col md={6} className="text-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={loadInitialData}
                  title="Refresh Data"
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </Button>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                {selectedUsers.length > 0 && (
                  <div className="d-flex gap-2 align-items-center">
                    <span className="text-muted">{selectedUsers.length} selected</span>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => setShowBulkEmailModal(true)} // eslint-disable-line @typescript-eslint/no-unused-vars
                    >
                      <i className="bi bi-envelope me-1"></i>
                      Send Email
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="table-responsive mb-4">
          <Table hover className="align-middle users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>LAST ACTIVE</th>
                <th style={{ width: '100px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <code className="user-id-code">{formatUserId(user.userId || user.id)}</code>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.fullName} 
                          className="user-profile-photo"
                        />
                      ) : (
                        <div className="user-profile-photo user-profile-placeholder">
                          {user.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="user-name">{user.fullName}</div>
                        <div className="text-muted small user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <span className="role-icon">{getRoleIcon(user.role)}</span>
                      <span className="role-label">{getRoleLabel(user.role)}</span>
                    </div>
                  </td>
                  <td>
                    {getStatusBadgeDisplay(user.status, user.currentStatus)}
                  </td>
                  <td>
                    <span className="last-active-time">
                      {formatLastActive(user.lastLogin, user.currentStatus)}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => {
                          navigate(`/admin/users/edit/${user.id}`);
                        }}
                        title="Edit User"
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          <i className="bi bi-three-dots-vertical"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleToggleUserStatus(user.id, user.status === 'INACTIVE')}>
                            <i className={`bi bi-${user.status === 'INACTIVE' ? 'check' : 'x'}-circle me-2`}></i>
                            {user.status === 'INACTIVE' ? 'Activate' : 'Deactivate'}
                          </Dropdown.Item>
                          <Dropdown.Item href={`mailto:${user.email}`}>
                            <i className="bi bi-envelope me-2"></i>
                            Send Email
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <i className="bi bi-arrow-repeat me-2"></i>
                            Change Role
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item className="text-danger">
                            <i className="bi bi-trash me-2"></i>
                            Delete User
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {}
        {totalPages > 1 && (
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <Button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <Button
                    className="page-link"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <Button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </li>
            </ul>
          </nav>
        )}
      </>
    );
  };

  return (
    <div className="user-management-container">

      {error && (
        <Card bg="danger" text="white" className="mb-3">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>{error}</div>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setError(null)}
            >
              <i className="bi bi-x"></i>
            </Button>
          </Card.Body>
        </Card>
      )}

      {success && (
        <Card bg="success" text="white" className="mb-3">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>{success}</div>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setSuccess(null)}
            >
              <i className="bi bi-x"></i>
            </Button>
          </Card.Body>
        </Card>
      )}

      {renderAllUsers()}
    </div>
  );
};

export default UserManagement;
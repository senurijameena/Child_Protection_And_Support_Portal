import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Spinner,
  Dropdown,
} from 'react-bootstrap'
import {
  getAllUsersForManagement,
  getUsersByRoleForManagement,
  approveUser,
  rejectUser,
  adminDeactivateUser,
  adminActivateUser,
} from '../../services/adminApi'
import type { UserManagementDTO } from '../../types/admin'
import { ROLE_LABELS } from '../../types/auth'

const ROLE_OPTIONS = ['PU', 'PO', 'SW', 'ADMIN']

export function UserManagementPage() {
  const [users, setUsers] = useState<UserManagementDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showLockModal, setShowLockModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserManagementDTO | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadUsers = () => {
    setLoading(true)
    if (filterRole) {
      getUsersByRoleForManagement(filterRole)
        .then(setUsers)
        .catch(() => setUsers([]))
        .finally(() => setLoading(false))
    } else {
      getAllUsersForManagement()
        .then(setUsers)
        .catch(() => setUsers([]))
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    loadUsers()
  }, [filterRole])

  const filtered = users.filter((u) => {
    if (filterStatus === 'active' && !u.active) return false
    if (filterStatus === 'inactive' && u.active) return false
    return true
  })

  const handleApprove = async (userId: string) => {
    setActionLoading(true)
    try {
      await approveUser(userId)
      loadUsers()
      setShowApproveModal(false)
      setSelectedUser(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to approve')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (userId: string) => {
    setActionLoading(true)
    try {
      await rejectUser(userId)
      loadUsers()
      setShowRejectModal(false)
      setSelectedUser(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to reject')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (u: UserManagementDTO) => {
    if (u.role === 'ADMIN') {
      alert('Cannot deactivate admin users')
      return
    }
    setActionLoading(true)
    try {
      if (u.active) {
        await adminDeactivateUser(u.userId)
      } else {
        await adminActivateUser(u.userId)
      }
      loadUsers()
      setShowLockModal(false)
      setSelectedUser(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">User Management</h1>
        <p className="text-muted mb-0">
          Manage Public Users, Police, and Social Workers. Admin sees full identity for anonymous submissions.
        </p>
      </div>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Label className="small text-muted">Role</Form.Label>
              <Form.Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r as keyof typeof ROLE_LABELS]}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Label className="small text-muted">Status</Form.Label>
              <Form.Select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')
                }
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive / Locked</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Approved</th>
                <th>Registered</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.userId}>
                    <td><code className="small">{u.userId || '-'}</code></td>
                    <td className="fw-medium">{u.fullName || '-'}</td>
                    <td>{u.email || '-'}</td>
                    <td>
                      <Badge bg="secondary">
                        {ROLE_LABELS[(u.role as keyof typeof ROLE_LABELS) || 'PU']}
                      </Badge>
                    </td>
                    <td>
                      {u.active ? (
                        <Badge bg="success">Active</Badge>
                      ) : (
                        <Badge bg="danger">Locked</Badge>
                      )}
                    </td>
                    <td>
                      {u.approved ? (
                        <Badge bg="success">Approved</Badge>
                      ) : (
                        <Badge bg="warning">Pending</Badge>
                      )}
                    </td>
                    <td className="text-muted small">
                      {u.registrationDate
                        ? new Date(u.registrationDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="text-end">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-primary"
                          size="sm"
                          id={`actions-${u.userId}`}
                        >
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                          {!u.approved && (
                            <>
                              <Dropdown.Item
                                onClick={() => {
                                  setSelectedUser(u)
                                  setShowApproveModal(true)
                                }}
                                disabled={actionLoading}
                              >
                                Approve
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  setSelectedUser(u)
                                  setShowRejectModal(true)
                                }}
                                className="text-danger"
                              >
                                Reject
                              </Dropdown.Item>
                            </>
                          )}
                          {u.approved && u.role !== 'ADMIN' && (
                            <Dropdown.Item
                              onClick={() => {
                                setSelectedUser(u)
                                setShowLockModal(true)
                              }}
                              disabled={actionLoading}
                            >
                              {u.active ? 'Lock / Deactivate' : 'Activate'}
                            </Dropdown.Item>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <p>
              Are you sure you want to reject <strong>{selectedUser.fullName}</strong> (
              {selectedUser.email})? They will not be able to access the platform.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => selectedUser && handleReject(selectedUser.userId)}
            disabled={actionLoading}
          >
            {actionLoading ? 'Rejecting...' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <p>
              Are you sure you want to approve <strong>{selectedUser.fullName}</strong> (
              {selectedUser.email})? They will be able to access the platform.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => selectedUser && handleApprove(selectedUser.userId)}
            disabled={actionLoading}
          >
            {actionLoading ? 'Approving...' : 'Approve'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showLockModal} onHide={() => setShowLockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedUser?.active ? 'Lock Account' : 'Activate Account'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <p>
              Are you sure you want to {selectedUser.active ? 'lock' : 'activate'} the account for{' '}
              <strong>{selectedUser.fullName}</strong> ({selectedUser.email})?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLockModal(false)}>
            Cancel
          </Button>
          <Button
            variant={selectedUser?.active ? 'danger' : 'success'}
            onClick={() => selectedUser && handleToggleActive(selectedUser)}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : selectedUser?.active ? 'Lock' : 'Activate'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

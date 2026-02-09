import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Spinner,
} from 'react-bootstrap'
import {
  getActiveAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../services/adminApi'
import type { AnnouncementDTO } from '../../types/admin'

const ANNOUNCEMENT_TYPES = ['GENERAL', 'MAINTENANCE', 'FEATURE', 'WORKSHOP']

export function SystemAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AnnouncementDTO | null>(null)
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'GENERAL',
    active: true,
    expiresAt: '',
  })
  const [submitLoading, setSubmitLoading] = useState(false)

  const loadAnnouncements = () => {
    setLoading(true)
    getActiveAnnouncements()
      .then(setAnnouncements)
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      title: '',
      message: '',
      type: 'GENERAL',
      active: true,
      expiresAt: '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      if (editing) {
        await updateAnnouncement(editing.id, {
          title: form.title,
          message: form.message,
          type: form.type as AnnouncementDTO['type'],
          active: form.active,
          expiresAt: form.expiresAt || undefined,
        })
      } else {
        await createAnnouncement({
          title: form.title,
          message: form.message,
          type: form.type as AnnouncementDTO['type'],
          active: form.active,
          expiresAt: form.expiresAt || undefined,
        })
      }
      loadAnnouncements()
      setShowModal(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await deleteAnnouncement(id)
      loadAnnouncements()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
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
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">System Announcements</h1>
          <p className="text-muted mb-0">
            Send system-wide notifications to users (approval, rejection, assignment, etc.)
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + New Announcement
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
                <th>Created</th>
                <th>Expires</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No announcements yet
                  </td>
                </tr>
              ) : (
                announcements.map((a) => (
                  <tr key={a.id}>
                    <td className="fw-medium">{a.title || '-'}</td>
                    <td>
                      <Badge bg="secondary">{a.type || 'GENERAL'}</Badge>
                    </td>
                    <td className="text-muted" style={{ maxWidth: 250 }}>
                      {a.message?.slice(0, 60) || '-'}
                      {a.message && a.message.length > 60 ? '...' : ''}
                    </td>
                    <td>
                      {a.active ? (
                        <Badge bg="success">Active</Badge>
                      ) : (
                        <Badge bg="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="text-muted small">
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="text-muted small">
                      {a.expiresAt
                        ? new Date(a.expiresAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(a.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? 'Edit Announcement' : 'New Announcement'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Announcement title"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Details..."
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {ANNOUNCEMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Expires At (optional)</Form.Label>
              <Form.Control
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitLoading}>
              {submitLoading ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

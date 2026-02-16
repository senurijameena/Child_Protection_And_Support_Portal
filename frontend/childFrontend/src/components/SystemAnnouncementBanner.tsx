import { useEffect, useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { getActiveAnnouncements } from '../services/adminApi'
import type { AnnouncementDTO } from '../types/admin'

export function SystemAnnouncementBanner() {
  const [ann, setAnn] = useState<AnnouncementDTO | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let mounted = true
    getActiveAnnouncements()
      .then((list) => {
        if (!mounted) return
        if (Array.isArray(list) && list.length > 0) {
          setAnn(list[0])
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  if (!ann || hidden) return null

  return (
    <div className="px-3 px-lg-4">
      <Alert
        variant={ann.type === 'MAINTENANCE' ? 'warning' : ann.type === 'FEATURE' ? 'info' : 'primary'}
        className="d-flex align-items-start justify-content-between mb-3 shadow-sm rounded-3"
      >
        <div>
          <div className="fw-bold mb-1">{ann.title}</div>
          <div className="small text-muted">{ann.message}</div>
        </div>
        <div className="ms-3 text-end">
          {ann.link && (
            <Button
              size="sm"
              variant="outline-light"
              className="me-2"
              href={ann.link}
            >
              Details
            </Button>
          )}
          <Button size="sm" variant="outline-secondary" onClick={() => setHidden(true)}>
            Dismiss
          </Button>
        </div>
      </Alert>
    </div>
  )
}

export default SystemAnnouncementBanner

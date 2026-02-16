import { Container, Row, Col } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { getPublicStatistics } from '../services/api'

export function AboutSection() {
  const [stats, setStats] = useState({
    totalCasesReported: 0,
    activeCases: 0,
    casesSaved: 0,
    caseResolutionRate: 0,
    helpRequestsCompleted: 0,
    childrenSupported: 0,
    publicUsersCount: 0,
    socialWorkersCount: 0,
    policeOfficersCount: 0,
    lastUpdated: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicStatistics()
      .then((data) => setStats((prev) => ({ ...prev, ...data })))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    {
      label: 'Total Cases Reported',
      value: stats.totalCasesReported,
      icon: '📋',
    },
    {
      label: 'Active Cases',
      value: stats.activeCases,
      icon: '🟠',
    },
    {
      label: 'Cases Resolved',
      value: stats.casesSaved,
      icon: '✅',
    },
    {
      label: 'Resolution Rate (%)',
      value: stats.caseResolutionRate,
      icon: '📈',
    },
    {
      label: 'Help Requests Completed',
      value: stats.helpRequestsCompleted,
      icon: '🤝',
    },
    {
      label: 'Children Supported',
      value: stats.childrenSupported,
      icon: '🧒',
    },
    {
      label: 'Public Users',
      value: stats.publicUsersCount,
      icon: '👥',
    },
    {
      label: 'Social Workers',
      value: stats.socialWorkersCount,
      icon: '👩‍⚕️',
    },
    {
      label: 'Police Officers',
      value: stats.policeOfficersCount,
      icon: '👮',
    },
  ]

  const impactCards = statCards.slice(0, 3)
  const supportCards = statCards.slice(3)

  const formatStatValue = (label: string, value: number) => {
    if (loading) return '...'
    if (label.includes('Rate')) return `${Number(value ?? 0).toFixed(1)}%`
    return Number(value ?? 0).toLocaleString()
  }

  return (
    <section id="about" className="py-5 my-5 landing-about-section position-relative overflow-hidden">
      <div className="landing-about-glow" aria-hidden="true" />
      <Container>
        <Row className="align-items-center g-4">
          <Col lg={6}>
            <div className="landing-section-pill mb-2">About The Platform</div>
            <h2 className="display-5 fw-bold text-dark mb-3">About Our Portal</h2>
            <p className="lead text-secondary mb-3">
              The Child Protection and Support Portal is a unified platform designed to strengthen
              the safety net for children and families.
            </p>
            <p className="text-secondary mb-0">
              We bring together public users, administrators, police, and social workers to ensure
              timely reporting, coordination, and follow-up. Our mission is to make every child
              feel safe and supported.
            </p>
          </Col>
          <Col lg={6}>
            <div className="rounded-4 p-4 landing-stats-panel">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div>
                  <div className="landing-stats-title">Live Impact Snapshot</div>
                  <div className="landing-stats-subtitle">Real-time indicators from active records</div>
                </div>
                <div className="landing-stats-badge">Realtime</div>
              </div>

              <div className="landing-impact-grid mb-3">
                {impactCards.map((card, idx) => (
                  <div
                    key={card.label}
                    className="landing-impact-card"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="landing-impact-icon">{card.icon}</div>
                    <div>
                      <div className="landing-impact-value">{formatStatValue(card.label, card.value)}</div>
                      <div className="landing-impact-label">{card.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="landing-mini-stats-grid">
                {supportCards.map((card, idx) => (
                  <div
                    key={card.label}
                    className="landing-stat-card"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    <div className="landing-stat-card-top">
                      <span className="landing-stat-icon">{card.icon}</span>
                      <span className="landing-stat-value">{formatStatValue(card.label, card.value)}</span>
                    </div>
                    <small className="landing-stat-label">{card.label}</small>
                  </div>
                ))}
              </div>

              {stats.lastUpdated && (
                <div className="text-center text-secondary small mt-3 landing-updated-time">
                  Last updated: {stats.lastUpdated}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

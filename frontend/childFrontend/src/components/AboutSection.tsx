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
      .then(setStats)
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

  return (
    <section id="about" className="py-5 my-5">
      <Container>
        <Row className="align-items-center g-4">
          <Col lg={6}>
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
            <div className="rounded-4 p-4" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #d1fae5 100%)' }}>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {statCards.map((card) => (
                  <div key={card.label} className="text-center px-3 py-3 bg-white rounded-3 shadow-sm" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '140px' }}>
                    <div className="fs-3 mb-2">{card.icon}</div>
                    <div className="fw-bold text-primary fs-5">{loading ? '...' : card.value.toLocaleString()}</div>
                    <small className="text-secondary d-block" style={{ fontSize: '0.8rem' }}>{card.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

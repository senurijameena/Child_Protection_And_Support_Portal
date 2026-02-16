import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Form, Spinner } from 'react-bootstrap'

const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api')

// Static sample data for locations not in backend
const SAMPLE_LOCATIONS = {
  social_service: [
    { name: 'District Social Services Office', district: 'Central', address: '123 Welfare Ave', phone: '+1 (555) 100-2000', hours: 'Mon–Fri 8am–5pm', type: 'Social Service Office' },
    { name: 'Regional Child Welfare Center', district: 'North', address: '456 Care St', phone: '+1 (555) 100-2001', hours: 'Mon–Sat 9am–4pm', type: 'Social Service Office' },
  ],
  childcare: [
    { name: 'Sunrise Child Care Center', district: 'Central', address: '789 Family Lane', phone: '+1 (555) 200-3000', hours: 'Mon–Fri 7am–6pm', type: 'Child Care Center' },
    { name: 'Hope Children\'s Shelter', district: 'South', address: '321 Safe Haven Rd', phone: '+1 (555) 200-3001', hours: '24/7', type: 'Child Care Center' },
  ],
  hospital: [
    { name: 'Central General Hospital – Pediatrics', district: 'Central', address: '555 Med Center Dr', phone: '+1 (555) 300-4000', hours: '24/7 Emergency', type: 'Hospital / Clinic' },
    { name: 'Community Health Clinic', district: 'East', address: '777 Wellness Blvd', phone: '+1 (555) 300-4001', hours: 'Mon–Fri 8am–8pm', type: 'Hospital / Clinic' },
  ],
}

interface PoliceStation {
  id: string
  stationName?: string
  district?: string
  city?: string
  address?: string
  contactNumber?: string
  email?: string
}

export function SupportLocationsPage() {
  const [stations, setStations] = useState<PoliceStation[]>([])
  const [loading, setLoading] = useState(true)
  const [districtFilter, setDistrictFilter] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/stations`)
      .then((r) => r.ok ? r.json() : [])
      .then(setStations)
      .catch(() => setStations([]))
      .finally(() => setLoading(false))
  }, [])

  const districts = [...new Set([...stations.map((s) => s.district).filter(Boolean), 'Central', 'North', 'South', 'East', 'West'])]
  const filteredStations = districtFilter
    ? stations.filter((s) => (s.district || '').toLowerCase().includes(districtFilter.toLowerCase()))
    : stations

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark mb-2">Available Support Locations</h1>
        <p className="text-muted mb-0">
          Find police stations, social service offices, child care centers, and hospitals. Filter by district.
        </p>
      </div>

      <Form.Group className="mb-4">
        <Form.Label>Filter by District</Form.Label>
        <Form.Select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Row className="g-4">
        <Col xs={12}>
          <h5 className="mb-3">Police Stations</h5>
          {loading ? (
            <Spinner animation="border" />
          ) : filteredStations.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-muted">No police stations found. Stations are added when police register.</Card.Body>
            </Card>
          ) : (
            <Row className="g-3">
              {filteredStations.map((s) => (
                <Col key={s.id} md={6} lg={4}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <h6 className="text-primary">{s.stationName || 'Police Station'}</h6>
                      <p className="small mb-1">{s.address || s.city || '-'}</p>
                      <p className="small mb-1">{s.district && `District: ${s.district}`}</p>
                      {s.contactNumber && (
                        <a href={`tel:${s.contactNumber}`} className="d-inline-block btn btn-sm btn-outline-primary mt-1">
                          📞 {s.contactNumber}
                        </a>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {Object.entries(SAMPLE_LOCATIONS).map(([key, locs]) => (
          <Col xs={12} key={key}>
            <h5 className="mb-3">{locs[0]?.type || key}</h5>
            <Row className="g-3">
              {locs
                .filter((l) => !districtFilter || (l.district || '').toLowerCase().includes(districtFilter.toLowerCase()))
                .map((l, i) => (
                  <Col key={i} md={6} lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body>
                        <h6 className="text-primary">{l.name}</h6>
                        <p className="small mb-1">{l.address}</p>
                        <p className="small mb-1 text-muted">{l.hours}</p>
                        <a href={`tel:${l.phone}`} className="d-inline-block btn btn-sm btn-outline-primary mt-1">
                          📞 {l.phone}
                        </a>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

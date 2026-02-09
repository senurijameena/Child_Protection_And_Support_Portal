import { Container, Row, Col, Card } from 'react-bootstrap'

const CASE_TYPES = [
  {
    type: 'Abuse',
    desc: 'Physical, emotional, or sexual harm to a child.',
    examples: ['Bruises, burns, or unexplained injuries', 'Fear of a caregiver', 'Age-inappropriate sexual knowledge'],
    signs: ['Withdrawal, aggression, or sudden behavior changes', 'Avoiding certain people or places'],
    when: 'Report immediately when you suspect harm.',
  },
  {
    type: 'Neglect',
    desc: 'Lack of care, food, shelter, education, or medical attention.',
    examples: ['Child left alone unsupervised', 'Malnourishment, poor hygiene', 'Missing school regularly'],
    signs: ['Unsuitable clothing, hunger', 'Untreated medical conditions'],
    when: 'Report when basic needs are not being met.',
  },
  {
    type: 'Medical',
    desc: 'Urgent health needs requiring intervention.',
    examples: ['Unpaid medical bills affecting care', 'Denial of necessary treatment', 'Substance exposure'],
    signs: ['Visible illness without care', 'Lack of necessary medications'],
    when: 'Report when a child\'s health is at risk.',
  },
  {
    type: 'Financial',
    desc: 'Poverty, lack of essentials affecting child wellbeing.',
    examples: ['Homelessness', 'Unable to afford food, school supplies', 'Utilities disconnected'],
    signs: ['Housing instability', 'Child missing meals or school'],
    when: 'Report when poverty puts the child at risk.',
  },
  {
    type: 'Education',
    desc: 'School dropout, abuse in school, or barriers to education.',
    examples: ['Chronic absenteeism', 'Bullying or abuse at school', 'Lack of enrollment'],
    signs: ['Repeated absences', 'Fear of school', 'Dropping out'],
    when: 'Report when education is being denied or child is at risk.',
  },
]

export function CaseTypesGuidePage() {
  return (
    <Container className="py-5">
      <div className="mb-5">
        <h1 className="h2 fw-bold text-dark mb-2">Case Types & Identification Guide</h1>
        <p className="text-muted mb-0 lead">
          How each case type is identified, with examples, warning signs, and when to report.
        </p>
      </div>

      <Row className="g-4">
        {CASE_TYPES.map((c) => (
          <Col key={c.type} xs={12} lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-3">
                <h5 className="text-primary mb-0">{c.type}</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-3">{c.desc}</p>
                <h6 className="small fw-bold">Examples</h6>
                <ul className="small text-muted mb-2">
                  {c.examples.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
                <h6 className="small fw-bold">Warning signs</h6>
                <ul className="small text-muted mb-2">
                  {c.signs.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                <p className="small mb-0">
                  <strong>When to report:</strong> {c.when}
                </p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

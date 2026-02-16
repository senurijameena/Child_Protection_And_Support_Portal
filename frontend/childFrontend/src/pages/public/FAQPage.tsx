import { Container, Accordion } from 'react-bootstrap'

const FAQS = [
  { q: 'Can I report anonymously?', a: 'Yes. You can submit both cases and help requests anonymously. Your identity is protected and only visible to admin when necessary for safety or legal reasons.' },
  { q: 'What happens after I submit a case?', a: 'Your submission is reviewed by our admin team. Cases are assigned to police for investigation; help requests go to social workers for support. You receive a tracking ID to follow progress.' },
  { q: 'How long does it take?', a: 'Urgent cases are prioritized. Most submissions are reviewed within 24–48 hours. Investigation or support timelines depend on the nature of the case.' },
  { q: 'Who will contact me?', a: 'If you provide contact details (and did not report anonymously), police or social workers may reach out as needed. For anonymous reports, updates are available via your tracking ID.' },
  { q: 'Can I track my request?', a: 'Yes. Use your tracking ID to check status in the portal. Log in to your account to see updates on your cases and help requests.' },
  { q: 'What if I need to add more information?', a: 'You can submit additional information through the portal using your tracking ID, or contact us via the Contact Us form.' },
  { q: 'Is my information secure?', a: 'Yes. All data is encrypted and stored securely. We follow strict privacy and data protection standards.' },
]

export function FAQPage() {
  return (
    <Container className="py-5">
      <div className="mb-5">
        <h1 className="h2 fw-bold text-dark mb-2">Frequently Asked Questions</h1>
        <p className="text-muted mb-0 lead">
          Common questions before you report or request help.
        </p>
      </div>

      <Accordion defaultActiveKey="0">
        {FAQS.map((faq, i) => (
          <Accordion.Item key={i} eventKey={String(i)}>
            <Accordion.Header>{faq.q}</Accordion.Header>
            <Accordion.Body>{faq.a}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  )
}

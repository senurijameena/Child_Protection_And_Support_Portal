import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, ListGroup, Form, Button, Spinner } from 'react-bootstrap'
import { getConversations, getMessages, sendMessage } from '../../services/dashboardApi'
import { useAuth } from '../../hooks/useAuth'
import type { ConversationDTO, MessageDTO } from '../../types/dashboard'

export function MessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('case')
  const requestId = searchParams.get('request')
  const [conversations, setConversations] = useState<ConversationDTO[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selected) {
      getMessages(selected).then(setMessages).catch(() => setMessages([]))
    } else {
      setMessages([])
    }
  }, [selected])

  const handleSend = async () => {
    if (!newMessage.trim() || !selected) return
    setSending(true)
    try {
      const msg = await sendMessage(selected, newMessage.trim(), caseId || undefined, requestId || undefined)
      setMessages((prev) => [...prev, msg])
      setNewMessage('')
    } catch {
      // ignore
    } finally {
      setSending(false)
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
      <h2 className="h4 fw-bold mb-4">Messages</h2>
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="row g-0" style={{ minHeight: 400 }}>
          <div className="col-md-4 border-end">
            <ListGroup variant="flush">
              {conversations.length === 0 ? (
                <ListGroup.Item className="text-center text-muted py-4">
                  No conversations yet.
                </ListGroup.Item>
              ) : (
                conversations.map((conv) => (
                  <ListGroup.Item
                    key={conv.participantId}
                    action
                    active={selected === conv.participantId}
                    onClick={() => setSelected(conv.participantId)}
                  >
                    <strong>{conv.participantName || conv.participantId}</strong>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <span className="badge bg-primary ms-2">{conv.unreadCount}</span>
                    )}
                    {conv.lastMessage && (
                      <p className="mb-0 small text-muted text-truncate">{conv.lastMessage}</p>
                    )}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </div>
          <div className="col-md-8 d-flex flex-column">
            {selected ? (
              <>
                <div className="flex-grow-1 overflow-auto p-3" style={{ maxHeight: 350 }}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`mb-2 ${m.fromUserId === user?.userId ? 'text-end' : ''}`}
                    >
                      <div
                        className={`d-inline-block p-2 rounded-3 ${
                          m.fromUserId === user?.userId ? 'bg-primary text-white' : 'bg-light'
                        }`}
                      >
                        {m.message}
                      </div>
                      <small className="text-muted d-block">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                      </small>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-top">
                  <Form.Group className="d-flex gap-2">
                    <Form.Control
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    />
                    <Button variant="primary" onClick={handleSend} disabled={sending || !newMessage.trim()}>
                      Send
                    </Button>
                  </Form.Group>
                </div>
              </>
            ) : (
              <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

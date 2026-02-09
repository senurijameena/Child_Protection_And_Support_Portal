import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, ListGroup, Form, Button, Spinner } from 'react-bootstrap'
import { getConversations, getMessages, sendMessage } from '../../services/socialWorkerApi'
import { useAuth } from '../../hooks/useAuth'
import type { ConversationDTO, MessageDTO } from '../../types/dashboard'

export function SocialWorkerMessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
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
      .catch(() => setConversations([]))
      .finally(() => setLoading(false))
  }, [])

  const participantParam = searchParams.get('participant')
  useEffect(() => {
    if (participantParam) setSelected(participantParam)
  }, [participantParam])

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
      const msg = await sendMessage(selected, newMessage.trim(), requestId || undefined)
      setMessages((prev) => [...prev, msg])
      setNewMessage('')
    } catch {
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: '#2d6a4f' }} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Messages</h1>
        <p className="text-muted mb-0">Internal messaging with public users. Message history linked to each help request. Evidence is handled separately.</p>
      </div>
      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="row g-0" style={{ minHeight: 400 }}>
          <div className="col-md-4 border-end">
            <ListGroup variant="flush">
              {conversations.length === 0 ? (
                <ListGroup.Item className="text-center text-muted py-4">No conversations yet.</ListGroup.Item>
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
                      <span className="badge rounded-pill ms-2" style={{ backgroundColor: '#2d6a4f' }}>{conv.unreadCount}</span>
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
                    <div key={m.id} className={`mb-2 ${m.fromUserId === user?.userId ? 'text-end' : ''}`}>
                      <div
                        className={`d-inline-block p-2 rounded-3 ${
                          m.fromUserId === user?.userId ? 'text-white' : 'bg-light'
                        }`}
                        style={m.fromUserId === user?.userId ? { backgroundColor: '#2d6a4f' } : {}}
                      >
                        {m.message}
                      </div>
                      <div className="small text-muted">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-top">
                  <Form className="d-flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                    <Form.Control
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button className="sw-btn-primary" onClick={handleSend} disabled={!newMessage.trim() || sending}>
                      Send
                    </Button>
                  </Form>
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

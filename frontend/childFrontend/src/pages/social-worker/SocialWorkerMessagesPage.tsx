import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getConversations, getMessages, sendMessage } from '../../services/socialWorkerApi'
import type { ConversationDTO, MessageDTO } from '../../types/dashboard'
import './SocialWorkerMessagesPage.css'

type ConversationFilter = 'all' | 'public' | 'admin' | 'sw' | 'unread'

const FILTERS: Array<{ id: ConversationFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public Users' },
  { id: 'admin', label: 'Admin' },
  { id: 'sw', label: 'Social Workers' },
  { id: 'unread', label: 'Unread' },
]

export function SocialWorkerMessagesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ConversationDTO[]>([])
  const [loadingConvos, setLoadingConvos] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ConversationFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null)
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Get userId from URL query parameter (for deep-linking from request cards)
  const userIdFromUrl = searchParams.get('userId')

  useEffect(() => {
    let mounted = true
    setLoadingConvos(true)
    getConversations()
      .then((items) => {
        if (!mounted) return
        setConversations(items)
        // Auto-select conversation if userId is provided in URL
        if (userIdFromUrl) {
          const existingConvo = items.find((c) => c.participantId === userIdFromUrl)
          if (existingConvo) {
            setSelectedId(userIdFromUrl)
          } else {
            // Create a placeholder conversation for this user so we can start messaging
            setSelectedId(userIdFromUrl)
            // Add a temporary conversation entry if not found
            setConversations((prev) => {
              if (prev.find((c) => c.participantId === userIdFromUrl)) return prev
              return [
                ...prev,
                {
                  participantId: userIdFromUrl,
                  participantName: 'Public User',
                  lastMessage: '',
                  unreadCount: 0,
                },
              ]
            })
          }
          // Clear the URL parameter after processing
          setSearchParams({}, { replace: true })
        }
      })
      .catch(() => mounted && setConversations([]))
      .finally(() => mounted && setLoadingConvos(false))
    return () => {
      mounted = false
    }
  }, [userIdFromUrl, setSearchParams])

  useEffect(() => {
    if (!selectedId) {
      setSelectedConversation(null)
      setMessages([])
      return
    }
    const selected = conversations.find((c) => c.participantId === selectedId) ?? null
    setSelectedConversation(selected)
    setLoadingMessages(true)
    getMessages(selectedId)
      .then((items) => setMessages(items))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false))
  }, [selectedId, conversations])

  useEffect(() => {
    const el = messageListRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loadingMessages, selectedId])

  const resolveRole = (name?: string): 'Public User' | 'Admin' | 'Social Worker' => {
    if (!name) return 'Public User'
    const normalized = name.toLowerCase()
    if (normalized.includes('admin')) return 'Admin'
    if (normalized.includes('social worker') || normalized.includes('social-worker') || normalized.includes('sw')) {
      return 'Social Worker'
    }
    return 'Public User'
  }

  const extractRequestId = (value?: string) => value?.match(/REQ-?\w+/i)?.[0] ?? null

  const resolveRequestStatus = (value?: string): 'Active' | 'Closed' => {
    if (!value) return 'Active'
    return /closed|cancelled|rejected|completed/i.test(value) ? 'Closed' : 'Active'
  }

  const formatTime = (value?: string) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const selectedRequestId = extractRequestId(selectedConversation?.lastMessage)
  const requestStatus = resolveRequestStatus(selectedConversation?.lastMessage)
  const isClosed = requestStatus === 'Closed'

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase()
    return conversations.filter((conv) => {
      const role = resolveRole(conv.participantName)
      if (filter === 'unread' && (conv.unreadCount ?? 0) < 1) return false
      if (filter === 'public' && role !== 'Public User') return false
      if (filter === 'admin' && role !== 'Admin') return false
      if (filter === 'sw' && role !== 'Social Worker') return false
      if (!q) return true
      const requestId = extractRequestId(conv.lastMessage) ?? ''
      return `${conv.participantName ?? ''} ${conv.participantId} ${conv.lastMessage ?? ''} ${requestId}`
        .toLowerCase()
        .includes(q)
    })
  }, [conversations, filter, search])

  const onSend = async () => {
    if (!selectedId || !messageText.trim() || isClosed) return
    setIsSending(true)
    try {
      const attachmentLabel = uploadFile
        ? `[Attachment: ${uploadFile.name}${uploadFile.size ? ` • ${Math.ceil(uploadFile.size / 1024)} KB` : ''}]`
        : ''
      const payload = attachmentLabel
        ? `${messageText.trim()}\n${attachmentLabel}`
        : messageText.trim()
      const sent = await sendMessage(selectedId, payload, selectedRequestId ?? undefined)
      setMessages((prev) => [...prev, sent])
      setMessageText('')
      setUploadFile(null)
    } finally {
      setIsSending(false)
    }
  }

  const onOpenHelpDetails = () => {
    if (!selectedConversation) return
    if (selectedRequestId) {
      navigate(`/social-worker/requests/${selectedRequestId}`)
      return
    }
    navigate('/social-worker/requests')
  }

  return (
    <Container fluid className="messages-page py-4">
      <div className="mb-3">
        <h1 className="h3 fw-700 mb-1">Messages</h1>
      </div>
      <Row className="g-3">
        <Col md={4} lg={4} className="messages-left">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <div className="mb-3">
                <div className="fw-700 mb-2">Conversation List</div>
                <div className="filter-row">
                  {FILTERS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`filter-pill ${filter === option.id ? 'active' : ''}`}
                      onClick={() => setFilter(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <InputGroup className="mb-3">
                <Form.Control
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or request ID"
                />
              </InputGroup>
              <div className="conversation-list flex-grow-1">
                {loadingConvos ? (
                  <div className="text-muted text-center py-4">Loading conversations...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-muted text-center py-4">No conversations found</div>
                ) : (
                  filteredConversations.map((conv) => {
                    const role = resolveRole(conv.participantName)
                    const reqId = extractRequestId(conv.lastMessage)
                    const time = formatTime((conv as { lastMessageAt?: string }).lastMessageAt)
                    return (
                      <button
                        key={conv.participantId}
                        type="button"
                        className={`conversation-item ${selectedId === conv.participantId ? 'active' : ''}`}
                        onClick={() => setSelectedId(conv.participantId)}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div className="text-start min-w-0">
                            <div className="fw-600 text-truncate">{conv.participantName || conv.participantId}</div>
                            <div className="small text-muted text-truncate">{role}</div>
                          </div>
                          <div className="small text-muted">{time || '-'}</div>
                        </div>
                        <div className="d-flex justify-content-between align-items-end gap-2 mt-2">
                          <div className="text-start min-w-0">
                            {reqId && <div className="request-id">Request ID: {reqId}</div>}
                            <div className="small text-muted text-truncate">{conv.lastMessage || 'No messages yet'}</div>
                          </div>
                          {(conv.unreadCount ?? 0) > 0 && (
                            <Badge bg="danger" pill>
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8} lg={8} className="messages-right">
          <Card className="h-100 d-flex flex-column">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-700">{selectedConversation?.participantName || 'Select a conversation'}</div>
                <div className="small text-muted">
                  {selectedConversation ? `Request ID: ${selectedRequestId ?? '-'}` : 'No conversation selected'}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                {selectedConversation && (
                  <Badge bg={isClosed ? 'secondary' : 'success'}>{requestStatus}</Badge>
                )}
                <Button size="sm" variant="outline-secondary" onClick={onOpenHelpDetails} disabled={!selectedConversation}>
                  View Help Details
                </Button>
              </div>
            </Card.Header>

            <Card.Body ref={messageListRef} className="message-area">
              {loadingMessages ? (
                <div className="text-muted text-center py-4">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-muted text-center py-4">No messages in this conversation</div>
              ) : (
                messages.map((msg) => {
                  const mine = msg.fromUserId === user?.userId
                  return (
                    <div key={msg.id} className={`message-row ${mine ? 'mine' : 'other'}`}>
                      <div className="message-bubble">
                        <div className="message-text">{msg.message}</div>
                        <div className="message-meta">
                          {formatTime(msg.createdAt) || '-'} {msg.read ? 'Read' : 'Delivered'}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </Card.Body>

            <Card.Footer>
              {isClosed && selectedConversation && (
                <div className="closed-note">Request Closed. Chat is read-only.</div>
              )}
              <div className="input-row">
                <Form.Control
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={selectedConversation ? 'Type your message' : 'Select a conversation to start chatting'}
                  disabled={!selectedConversation || isClosed}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="d-none"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  disabled={!selectedConversation || isClosed}
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={!selectedConversation || isClosed}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Attach file
                </Button>
                <Button variant="primary" size="sm" onClick={onSend} disabled={!selectedConversation || isClosed || isSending || !messageText.trim()}>
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </div>
              {uploadFile && (
                <div className="small text-muted mt-2">
                  Selected: {uploadFile.name}
                  {uploadFile.size ? ` • ${Math.ceil(uploadFile.size / 1024)} KB` : ''}
                  <Button
                    variant="link"
                    size="sm"
                    className="ps-2"
                    onClick={() => setUploadFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

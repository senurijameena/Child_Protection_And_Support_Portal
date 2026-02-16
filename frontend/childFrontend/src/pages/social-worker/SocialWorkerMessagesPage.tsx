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
      <div
        className="mb-4 p-4 rounded-3 shadow-sm position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white'
        }}
      >
        {/* Decorative pattern */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        <div className="d-flex align-items-center gap-3 position-relative">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span style={{ fontSize: '2rem' }}>💬</span>
          </div>
          <div>
            <h1 className="h2 fw-bold mb-1">Messages</h1>
            <p className="mb-0" style={{ opacity: 0.95, fontSize: '0.95rem' }}>
              Communicate with public users, administrators, and social workers
            </p>
          </div>
        </div>
      </div>

      <Row className="g-4">
        <Col md={4} lg={4} className="messages-left">
          <Card
            className="h-100 border-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
          >
            <Card.Body className="d-flex flex-column">
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span style={{ fontSize: '1.5rem' }}>📋</span>
                  <div className="fw-bold" style={{ color: '#1e40af' }}>Conversations</div>
                </div>
                <div className="filter-row">
                  {FILTERS.map((option) => {
                    const isActive = filter === option.id
                    const filterIcons: Record<ConversationFilter, string> = {
                      all: '📊',
                      public: '👥',
                      admin: '👔',
                      sw: '🤝',
                      unread: '🔔'
                    }
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`filter-pill ${isActive ? 'active' : ''}`}
                        onClick={() => setFilter(option.id)}
                        style={{
                          background: isActive ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255, 255, 255, 0.6)',
                          color: isActive ? 'white' : '#1e40af',
                          border: `2px solid ${isActive ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'}`,
                          fontWeight: '600',
                          boxShadow: isActive ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span className="me-1">{filterIcons[option.id]}</span>
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <InputGroup className="mb-3">
                <Form.Control
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search by name or request ID"
                  style={{
                    border: '2px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                  }}
                />
              </InputGroup>
              <div className="conversation-list flex-grow-1">
                {loadingConvos ? (
                  <div
                    className="text-center py-5 rounded-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      color: '#1e40af'
                    }}
                  >
                    <div className="spinner-border" style={{ color: '#3b82f6' }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 mb-0 fw-semibold">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div
                    className="text-center py-5 rounded-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      border: '2px dashed rgba(59, 130, 246, 0.3)',
                      color: '#1e40af'
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
                    <p className="mb-0 fw-semibold">No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const role = resolveRole(conv.participantName)
                    const reqId = extractRequestId(conv.lastMessage)
                    const time = formatTime((conv as { lastMessageAt?: string }).lastMessageAt)
                    const isActive = selectedId === conv.participantId
                    const hasUnread = (conv.unreadCount ?? 0) > 0

                    const getRoleIcon = (role: string) => {
                      if (role === 'Admin') return '👔'
                      if (role === 'Social Worker') return '🤝'
                      return '👤'
                    }

                    return (
                      <button
                        key={conv.participantId}
                        type="button"
                        className={`conversation-item ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedId(conv.participantId)}
                        style={{
                          background: isActive
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)'
                            : 'rgba(255, 255, 255, 0.7)',
                          border: `2px solid ${isActive ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'}`,
                          transition: 'all 0.3s ease',
                          boxShadow: isActive ? '0 4px 8px rgba(59, 130, 246, 0.2)' : 'none'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div className="text-start min-w-0 flex-grow-1">
                            <div className="d-flex align-items-center gap-2">
                              <span style={{ fontSize: '1.2rem' }}>{getRoleIcon(role)}</span>
                              <div className="fw-600 text-truncate" style={{ color: '#1e40af' }}>
                                {conv.participantName || conv.participantId}
                              </div>
                            </div>
                            <Badge
                              className="rounded-pill mt-1"
                              style={{
                                backgroundColor: role === 'Admin' ? '#f59e0b' : role === 'Social Worker' ? '#3b82f6' : '#10b981',
                                fontSize: '0.7rem',
                                padding: '0.25rem 0.5rem'
                              }}
                            >
                              {role}
                            </Badge>
                          </div>
                          <div className="small fw-semibold" style={{ color: '#2563eb' }}>
                            {time || '-'}
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-end gap-2 mt-2">
                          <div className="text-start min-w-0 flex-grow-1">
                            {reqId && (
                              <Badge
                                className="rounded-pill mb-1"
                                style={{
                                  backgroundColor: 'rgba(6, 182, 212, 0.2)',
                                  color: '#0891b2',
                                  fontSize: '0.7rem',
                                  padding: '0.25rem 0.5rem'
                                }}
                              >
                                📋 {reqId}
                              </Badge>
                            )}
                            <div className="small text-muted text-truncate" style={{ color: '#60a5fa' }}>
                              {conv.lastMessage || 'No messages yet'}
                            </div>
                          </div>
                          {hasUnread && (
                            <Badge
                              pill
                              className="ms-2"
                              style={{
                                backgroundColor: '#ef4444',
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.6rem',
                                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                                animation: 'pulse 2s ease-in-out infinite'
                              }}
                            >
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
          <Card
            className="h-100 d-flex flex-column border-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
          >
            <Card.Header
              className="d-flex justify-content-between align-items-center"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                borderRadius: '8px 8px 0 0',
                padding: '1rem'
              }}
            >
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.5rem' }}>
                    {selectedConversation ? '💬' : '📭'}
                  </span>
                  <div>
                    <div className="fw-bold">{selectedConversation?.participantName || 'Select a conversation'}</div>
                    <div className="small" style={{ opacity: 0.9 }}>
                      {selectedConversation ? (
                        <>
                          <span className="me-2">📋 Request: {selectedRequestId ?? 'N/A'}</span>
                        </>
                      ) : (
                        'No conversation selected'
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                {selectedConversation && (
                  <Badge
                    className="rounded-pill"
                    style={{
                      backgroundColor: isClosed ? '#6b7280' : '#10b981',
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.8rem',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {isClosed ? '🔒 Closed' : '✅ Active'}
                  </Badge>
                )}
                <Button
                  size="sm"
                  onClick={onOpenHelpDetails}
                  disabled={!selectedConversation}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    fontWeight: '600'
                  }}
                >
                  📄 View Details
                </Button>
              </div>
            </Card.Header>

            <Card.Body
              ref={messageListRef}
              className="message-area"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.02) 25%, transparent 25%),
                                  linear-gradient(225deg, rgba(59, 130, 246, 0.02) 25%, transparent 25%),
                                  linear-gradient(45deg, rgba(59, 130, 246, 0.02) 25%, transparent 25%),
                                  linear-gradient(315deg, rgba(59, 130, 246, 0.02) 25%, transparent 25%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 0, 10px -10px, 0px 10px',
                minHeight: '400px'
              }}
            >
              {loadingMessages ? (
                <div
                  className="text-center py-5 rounded-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    color: '#1e40af'
                  }}
                >
                  <div className="spinner-border" style={{ color: '#3b82f6' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 mb-0 fw-semibold">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div
                  className="text-center py-5 rounded-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '2px dashed rgba(59, 130, 246, 0.3)',
                    color: '#1e40af'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
                  <p className="mb-0 fw-semibold">No messages yet</p>
                  <p className="mb-0 small" style={{ color: '#2563eb' }}>Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const mine = msg.fromUserId === user?.userId
                  return (
                    <div key={msg.id} className={`message-row ${mine ? 'mine' : 'other'}`}>
                      <div
                        className="message-bubble"
                        style={{
                          background: mine
                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            : 'white',
                          color: mine ? 'white' : '#1e293b',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          border: mine ? 'none' : '1px solid rgba(59, 130, 246, 0.2)'
                        }}
                      >
                        <div className="message-text">{msg.message}</div>
                        <div
                          className="message-meta"
                          style={{
                            color: mine ? 'rgba(255, 255, 255, 0.8)' : '#64748b',
                            fontSize: '0.7rem',
                            marginTop: '0.5rem'
                          }}
                        >
                          {formatTime(msg.createdAt) || '-'} • {msg.read ? '✓✓ Read' : '✓ Delivered'}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </Card.Body>

            <Card.Footer
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderTop: '2px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '0 0 8px 8px'
              }}
            >
              {isClosed && selectedConversation && (
                <div
                  className="closed-note mb-3"
                  style={{
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    border: '2px solid rgba(107, 114, 128, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#4b5563',
                    fontWeight: '600'
                  }}
                >
                  🔒 Request Closed. Chat is read-only.
                </div>
              )}
              <div className="input-row">
                <Form.Control
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={selectedConversation ? '💬 Type your message...' : 'Select a conversation to start chatting'}
                  disabled={!selectedConversation || isClosed}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      onSend()
                    }
                  }}
                  style={{
                    border: '2px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    backgroundColor: 'white'
                  }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="d-none"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  disabled={!selectedConversation || isClosed}
                />
                <Button
                  size="sm"
                  disabled={!selectedConversation || isClosed}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    color: '#4b5563',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  📎 Attach
                </Button>
                <Button
                  size="sm"
                  onClick={onSend}
                  disabled={!selectedConversation || isClosed || isSending || !messageText.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    minWidth: '80px'
                  }}
                >
                  {isSending ? '📤 Sending...' : '📤 Send'}
                </Button>
              </div>
              {uploadFile && (
                <div
                  className="mt-2 p-2 rounded-3"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}
                >
                  <span className="small fw-semibold" style={{ color: '#1e40af' }}>
                    📎 Selected: {uploadFile.name}
                    {uploadFile.size ? ` • ${Math.ceil(uploadFile.size / 1024)} KB` : ''}
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    className="ps-2"
                    onClick={() => setUploadFile(null)}
                    style={{ color: '#ef4444', textDecoration: 'none', fontWeight: '600' }}
                  >
                    ✕ Remove
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

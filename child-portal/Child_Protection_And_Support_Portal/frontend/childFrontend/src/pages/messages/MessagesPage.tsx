import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, InputGroup, Form, Alert, Spinner } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { messageService } from '../../services/messageService';
import { authService } from '../../services/authService';
import './MessagesPage.css';

interface Conversation {
  participantId: string;
  participantName: string;
  participantRole?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  relatedCaseId?: string;
  relatedRequestId?: string;
  relatedCaseTrackingId?: string;
  relatedRequestTrackingId?: string;
}

interface Message {
  id: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  toUserName?: string;
  message: string;
  relatedCaseId?: string;
  relatedRequestId?: string;
  sentAt: string;
  read: boolean;
}

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = authService.getCurrentUser();
  const selectedParticipantId = searchParams.get('userId') || searchParams.get('participantId');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedParticipantId) {
      const conversation = conversations.find(c => c.participantId === selectedParticipantId);
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversation.participantId);
      }
    }
  }, [selectedParticipantId, conversations]);

  useEffect(() => {
    filterConversations();
  }, [searchQuery, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.getConversations();
      const conversationsData = Array.isArray(response.data) ? response.data : [];
      setConversations(conversationsData);
      setFilteredConversations(conversationsData);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (participantId: string) => {
    try {
      setMessagesLoading(true);
      const response = await messageService.getConversationMessages(participantId);
      const messagesData = Array.isArray(response.data) ? response.data : [];
      setMessages(messagesData);
      
      // Mark messages as read
      const unreadMessages = messagesData.filter((m: Message) => !m.read && m.toUserId === currentUser?.id);
      for (const msg of unreadMessages) {
        try {
          await messageService.markAsRead(msg.id);
        } catch (err) {
          console.error('Error marking message as read:', err);
        }
      }
      
      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setMessagesLoading(false);
    }
  };

  const filterConversations = () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(c => 
      c.participantName.toLowerCase().includes(query) ||
      c.lastMessage?.toLowerCase().includes(query) ||
      c.relatedCaseTrackingId?.toLowerCase().includes(query) ||
      c.relatedRequestTrackingId?.toLowerCase().includes(query)
    );
    setFilteredConversations(filtered);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSearchParams({ userId: conversation.participantId });
    fetchMessages(conversation.participantId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;
    
    try {
      setSending(true);
      await messageService.sendConversationMessage(selectedConversation.participantId, {
        message: newMessage,
        relatedCaseId: selectedConversation.relatedCaseId,
        relatedRequestId: selectedConversation.relatedRequestId
      });
      
      setNewMessage('');
      await fetchMessages(selectedConversation.participantId);
      await fetchConversations();
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Start a "new message" flow by clearing selection and letting user pick a conversation
  const handleNewMessage = () => {
    // Clear any selected participant in the URL
    setSearchParams({});
    // Clear current selection and draft
    setSelectedConversation(null);
    setMessages([]);
    setNewMessage('');
    // Optional: clear search so user sees all possible conversations
    setSearchQuery('');
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatMessageTime = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return dateString;
    }
  };

  const getParticipantIcon = (role?: string): string => {
    if (!role) return '👤';
    const roleUpper = role.toUpperCase();
    if (roleUpper.includes('POLICE') || roleUpper.includes('OFFICER')) return '👮';
    if (roleUpper.includes('SOCIAL') || roleUpper.includes('WORKER')) return '👩⚕️';
    if (roleUpper.includes('ADMIN')) return '👨💼';
    return '👤';
  };

  const isMyMessage = (message: Message): boolean => {
    return message.fromUserId === currentUser?.id;
  };

  if (loading) {
    return (
      <Container className="messages-page">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <div className="messages-page">
      <Container fluid>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">💬 MESSAGES</h2>
          <div className="d-flex gap-2">
            <InputGroup style={{ width: '250px' }}>
              <Form.Control
                placeholder="🔍 Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Button variant="primary" onClick={handleNewMessage}>
              ✉️ New Message
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        <Row className="g-3">
          {/* Conversations List */}
          <Col lg={4} xl={3}>
            <Card className="conversations-list-card h-100">
              <Card.Header>
                <strong>CONVERSATIONS</strong>
              </Card.Header>
              <Card.Body className="p-0">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p>No conversations found</p>
                  </div>
                ) : (
                  <div className="conversations-list">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.participantId}
                        className={`conversation-item ${selectedConversation?.participantId === conversation.participantId ? 'active' : ''}`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="d-flex align-items-start">
                          <div className="conversation-avatar me-2">
                            {getParticipantIcon(conversation.participantRole)}
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <div className="conversation-name">
                                {getParticipantIcon(conversation.participantRole)} {conversation.participantName}
                              </div>
                              {conversation.unreadCount && conversation.unreadCount > 0 && (
                                <Badge bg="primary" pill>{conversation.unreadCount}</Badge>
                              )}
                            </div>
                            {conversation.relatedCaseTrackingId && (
                              <div className="conversation-context text-muted small mb-1">
                                📍 Case: {conversation.relatedCaseTrackingId}
                              </div>
                            )}
                            {conversation.relatedRequestTrackingId && (
                              <div className="conversation-context text-muted small mb-1">
                                📍 Request: {conversation.relatedRequestTrackingId}
                              </div>
                            )}
                            {conversation.lastMessage && (
                              <div className="conversation-last-message text-muted small">
                                Last: "{conversation.lastMessage}"
                              </div>
                            )}
                            {conversation.lastMessageTime && (
                              <div className="conversation-time text-muted small mt-1">
                                {formatDate(conversation.lastMessageTime)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Chat Area */}
          <Col lg={8} xl={9}>
            <Card className="chat-area-card h-100">
              {selectedConversation ? (
                <>
                  <Card.Header className="chat-header">
                    <div>
                      <strong>Chat with:</strong> {getParticipantIcon(selectedConversation.participantRole)} {selectedConversation.participantName}
                      {selectedConversation.relatedCaseTrackingId && (
                        <Badge bg="info" className="ms-2">Case: {selectedConversation.relatedCaseTrackingId}</Badge>
                      )}
                      {selectedConversation.relatedRequestTrackingId && (
                        <Badge bg="info" className="ms-2">Request: {selectedConversation.relatedRequestTrackingId}</Badge>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body className="chat-body p-0" ref={chatAreaRef}>
                    {messagesLoading ? (
                      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading messages...</span>
                        </Spinner>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="messages-container">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`message-item ${isMyMessage(message) ? 'message-sent' : 'message-received'}`}
                          >
                            <div className="message-content">
                              <div className="message-sender">
                                {isMyMessage(message) ? 'You' : message.fromUserName || 'Unknown'}
                              </div>
                              <div className="message-text">{message.message}</div>
                              <div className="message-time">{formatMessageTime(message.sentAt)}</div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </Card.Body>
                  <Card.Footer className="chat-footer">
                    <div className="d-flex gap-2">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="✏️ Type message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                      />
                      <div className="d-flex flex-column gap-2">
                        <Button variant="outline-secondary" size="sm">
                          📎 Attach
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                        >
                          {sending ? <Spinner animation="border" size="sm" /> : '🚀 Send'}
                        </Button>
                      </div>
                    </div>
                  </Card.Footer>
                </>
              ) : (
                <Card.Body className="text-center py-5 text-muted">
                  <p>Select a conversation to start messaging</p>
                </Card.Body>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MessagesPage;

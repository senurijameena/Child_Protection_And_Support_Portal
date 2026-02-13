import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Form, InputGroup } from 'react-bootstrap'
import type { HelpRequestDTO } from '../../types/dashboard'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import './SmartRequestTable.css'

interface SmartRequestTableProps {
    requests: HelpRequestDTO[]
    maskUserId: (id: string | undefined, anonymous: boolean) => string
    hideControls?: boolean
    onSelect?: (id: string) => void
}

type ViewMode = 'all' | 'active'

export function SmartRequestTable({ requests, maskUserId, hideControls = false, onSelect }: SmartRequestTableProps) {
    const [viewMode, setViewMode] = useState<ViewMode>(hideControls ? 'all' : 'active')
    const [searchQuery, setSearchQuery] = useState('')

    // Smart ordering logic
    const orderedRequests = useMemo(() => {
        // Filter based on view mode
        let filtered = requests
        if (viewMode === 'active') {
            filtered = requests.filter(
                (r) => r.status !== 'COMPLETED' && r.status !== 'REJECTED' && r.status !== 'CANCELLED'
            )
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (r) =>
                    r.trackingId?.toLowerCase().includes(query) ||
                    r.id?.toLowerCase().includes(query) ||
                    HELP_TYPE_LABELS[r.helpType || 'OTHER']?.toLowerCase().includes(query) ||
                    r.description?.toLowerCase().includes(query)
            )
        }

        // Sort by priority and status
        return filtered.sort((a, b) => {
            const getStatusRank = (status: string | undefined) => {
                if (status === 'ASSIGNED') return 1
                if (status === 'IN_PROGRESS') return 2
                if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(status || '')) return 4
                return 3 // Other statuses
            }

            const rankA = getStatusRank(a.status)
            const rankB = getStatusRank(b.status)

            if (rankA !== rankB) return rankA - rankB

            // Within same rank sorting

            // Rank 1: ASSIGNED - Newest first (Newly assigned at top)
            if (rankA === 1) {
                const dateA = new Date(a.requestDate || 0).getTime()
                const dateB = new Date(b.requestDate || 0).getTime()
                return dateB - dateA
            }

            // Rank 2: IN_PROGRESS - Priority then Date
            if (rankA === 2) {
                const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
                const pA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1
                const pB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1

                if (pA !== pB) return pA - pB

                // Secondary sort: Date
                const dateA = new Date(a.requestDate || 0).getTime()
                const dateB = new Date(b.requestDate || 0).getTime()
                return dateA - dateB // Earliest first (Oldest active request)
            }

            // Default (Rank 3 & 4): Newest first
            const dateA = new Date(a.requestDate || 0).getTime()
            const dateB = new Date(b.requestDate || 0).getTime()
            return dateB - dateA
        })
    }, [requests, viewMode, searchQuery])

    // Get status badge variant
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ASSIGNED':
                return { bg: 'warning', text: 'Pending Acceptance', className: 'status-pending' }
            case 'IN_PROGRESS':
                return { bg: 'info', text: 'In Progress', className: 'status-active' }
            case 'COMPLETED':
                return { bg: 'secondary', text: 'Completed', className: 'status-completed' }
            case 'REJECTED':
                return { bg: 'danger', text: 'Rejected', className: 'status-rejected' }
            case 'CANCELLED':
                return { bg: 'secondary', text: 'Cancelled', className: 'status-completed' }
            default:
                return { bg: 'secondary', text: status, className: '' }
        }
    }

    // Get priority badge
    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return { bg: 'danger', icon: '🔴' }
            case 'MEDIUM':
                return { bg: 'warning', icon: '🟡' }
            case 'LOW':
                return { bg: 'secondary', icon: '🟢' }
            default:
                return { bg: 'secondary', icon: '⚪' }
        }
    }

    // Get row class based on status
    const getRowClass = (request: HelpRequestDTO) => {
        if (request.status === 'ASSIGNED') return 'row-pending-acceptance'
        if (request.status === 'IN_PROGRESS') return 'row-active'
        if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(request.status || ''))
            return 'row-deprioritized'
        return ''
    }

    const emptyState = (
        <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h5 className="empty-state-title">
                {viewMode === 'active' ? 'No active requests at the moment' : 'No requests found'}
            </h5>
            <p className="empty-state-text">
                {viewMode === 'active'
                    ? 'All your assigned requests are either completed or closed.'
                    : searchQuery
                        ? 'Try adjusting your search query.'
                        : 'You have no assigned requests yet.'}
            </p>
        </div>
    )

    return (
        <div className="smart-request-table-container">
            {/* Controls */}
            {!hideControls && (
                <div className="table-controls">
                    <div className="view-mode-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'active' ? 'active' : ''}`}
                            onClick={() => setViewMode('active')}
                        >
                            Show Active Only
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
                            onClick={() => setViewMode('all')}
                        >
                            Show All Requests
                        </button>
                    </div>

                    <InputGroup className="search-input-group">
                        <InputGroup.Text>
                            <span className="search-icon">🔍</span>
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search by ID, type, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                                ✕
                            </button>
                        )}
                    </InputGroup>
                </div>
            )}

            {/* Table */}
            {orderedRequests.length === 0 ? (
                emptyState
            ) : (
                <div className="table-wrapper">
                    <table className="smart-request-table">
                        <thead className="table-header">
                            <tr>
                                <th className="col-id">Request ID</th>
                                <th className="col-category">Category</th>
                                <th className="col-priority">Priority</th>
                                <th className="col-status">Status</th>
                                <th className="col-date">Assigned Date</th>
                                <th className="col-requester">Requester</th>
                                <th className="col-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {orderedRequests.map((request) => {
                                const statusBadge = getStatusBadge(request.status || 'REQUESTED')
                                const priorityBadge = getPriorityBadge(request.priority || 'MEDIUM')
                                const rowClass = getRowClass(request)

                                return (
                                    <tr
                                        key={request.id}
                                        className={`table-row ${rowClass}`}
                                        onClick={() => onSelect?.(request.id || '')}
                                        style={{ cursor: onSelect ? 'pointer' : 'default' }}
                                    >
                                        <td className="col-id">
                                            <Link
                                                to={`/social-worker/requests/${request.id}`}
                                                className="request-id-link"
                                            >
                                                <span className="id-badge">
                                                    {request.trackingId || request.id?.slice(0, 8)}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="col-category">
                                            <span className="category-text">
                                                {HELP_TYPE_LABELS[request.helpType || 'OTHER']}
                                            </span>
                                        </td>
                                        <td className="col-priority">
                                            <Badge bg={priorityBadge.bg} className="priority-badge">
                                                <span className="priority-icon">{priorityBadge.icon}</span>
                                                {request.priority || 'MEDIUM'}
                                            </Badge>
                                        </td>
                                        <td className="col-status">
                                            <Badge bg={statusBadge.bg} className={`status-badge ${statusBadge.className}`}>
                                                {statusBadge.text}
                                            </Badge>
                                        </td>
                                        <td className="col-date">
                                            <span className="date-text">
                                                {request.requestDate
                                                    ? new Date(request.requestDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })
                                                    : '-'}
                                            </span>
                                        </td>
                                        <td className="col-requester">
                                            <span className="requester-text">
                                                {maskUserId(request.requesterUserId, request.anonymous || false)}
                                            </span>
                                        </td>
                                        <td className="col-actions">
                                            <div className="action-buttons">
                                                {onSelect ? (
                                                    <button
                                                        className="action-btn view-btn border-0 bg-transparent p-0 text-primary text-decoration-underline"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onSelect(request.id)
                                                        }}
                                                        title="View Details"
                                                    >
                                                        View
                                                    </button>
                                                ) : (
                                                    <Link
                                                        to={`/social-worker/requests/${request.id}`}
                                                        className="action-btn view-btn"
                                                        title="View Details"
                                                    >
                                                        View
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Results count */}
            {!hideControls && orderedRequests.length > 0 && (
                <div className="table-footer">
                    <span className="results-count">
                        Showing {orderedRequests.length} of {requests.length} request
                        {requests.length !== 1 ? 's' : ''}
                    </span>
                </div>
            )}
        </div>
    )
}

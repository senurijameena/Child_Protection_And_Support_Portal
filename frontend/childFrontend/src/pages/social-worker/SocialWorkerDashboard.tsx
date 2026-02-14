import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, Container, Row, Col, Badge, Form, Modal, Button, Spinner } from "react-bootstrap"
import { useAuth } from "../../hooks/useAuth"
import {
  getAssignedRequests,
  getMyFollowUps,
  getAvailableSocialWorkers,
  requestHelpRequestTransfer,
  getActiveAnnouncements,
  type FollowUpDTO,
} from "../../services/socialWorkerApi"
import {
  type HelpRequestDTO,
  type AnnouncementDTO,
  REQUEST_STATUS_BADGE_VARIANTS,
  REQUEST_STATUS_LABELS,
} from "../../types/dashboard"
import "./SocialWorkerDashboard.css"
import { SystemAnnouncementCard } from "../../components/social-worker/SystemAnnouncementCard"

interface CaseStats {
  active: number
  pending: number
  completed: number
  followUp: number
}

export function SocialWorkerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [caseStats, setCaseStats] = useState<CaseStats | null>(null)
  const [recentRequests, setRecentRequests] = useState<HelpRequestDTO[]>([])
  const [assignedRequestsState, setAssignedRequestsState] = useState<HelpRequestDTO[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestSearch, setRequestSearch] = useState("")
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [availableSW, setAvailableSW] = useState<
    Array<{ userId: string; fullName: string; availabilityStatus?: string; specializations?: string[]; serviceArea?: string }>
  >([])
  const [transferRequestId, setTransferRequestId] = useState("")
  const [transferReason, setTransferReason] = useState("")
  const [selectedTransferSwId, setSelectedTransferSwId] = useState("")
  const [transferSubmitting, setTransferSubmitting] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [loadingSW, setLoadingSW] = useState(false)

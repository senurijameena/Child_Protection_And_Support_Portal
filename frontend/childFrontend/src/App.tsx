import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicUserLayout } from './layouts/PublicUserLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { PoliceLayout } from './layouts/PoliceLayout'
import { SocialWorkerLayout } from './layouts/SocialWorkerLayout'
import { PublicUserDashboard } from './pages/dashboard/PublicUserDashboard'
import { ReportCasePage } from './pages/dashboard/ReportCasePage'
import { RequestHelpPage } from './pages/dashboard/RequestHelpPage'
import { MyCasesPage } from './pages/dashboard/MyCasesPage'
import { MyRequestsPage } from './pages/dashboard/MyRequestsPage'
import { CaseDetailsPage } from './pages/dashboard/CaseDetailsPage'
import { RequestDetailsPage } from './pages/dashboard/RequestDetailsPage'
import { MessagesPage } from './pages/dashboard/MessagesPage'
import { NotificationsPage } from './pages/dashboard/NotificationsPage'
import { ServiceOffersPage } from './pages/dashboard/ServiceOffersPage'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AllCasesPage } from './pages/admin/AllCasesPage'
import { AdminCaseDetailsPage } from './pages/admin/AdminCaseDetailsPage'
import { HelpRequestManagementPage } from './pages/admin/HelpRequestManagementPage'
import { AdminHelpRequestDetailsPage } from './pages/admin/AdminHelpRequestDetailsPage'
import { UserManagementPage } from './pages/admin/UserManagementPage'
import { TransferRequestManagementPage } from './pages/admin/TransferRequestManagementPage'
import { DuplicateDetectionPage } from './pages/admin/DuplicateDetectionPage'
import { SystemAnnouncementsPage } from './pages/admin/SystemAnnouncementsPage'
import { FeedbackManagementPage } from './pages/admin/FeedbackManagementPage'
import { PoliceDashboard } from './pages/police/PoliceDashboard'
import { PoliceCasesPage } from './pages/police/PoliceCasesPage'
import { PoliceCaseDetailsPage } from './pages/police/PoliceCaseDetailsPage'
import { PoliceMessagesPage } from './pages/police/PoliceMessagesPage'
import { PoliceReportsPage } from './pages/police/PoliceReportsPage'
import { PoliceProfilePage } from './pages/police/PoliceProfilePage'
import { SocialWorkerDashboard } from './pages/social-worker/SocialWorkerDashboard'
import { SocialWorkerRequestsPage } from './pages/social-worker/SocialWorkerRequestsPage'
import { SocialWorkerRequestDetailsPage } from './pages/social-worker/SocialWorkerRequestDetailsPage'
import { SocialWorkerMessagesPage } from './pages/social-worker/SocialWorkerMessagesPage'
import { SocialWorkerPackagesPage } from './pages/social-worker/SocialWorkerPackagesPage'
import { SocialWorkerReportsPage } from './pages/social-worker/SocialWorkerReportsPage'
import { SocialWorkerProfilePage } from './pages/social-worker/SocialWorkerProfilePage'
import { SocialWorkerCalendarPage } from './pages/social-worker/SocialWorkerCalendarPage'
import { SocialWorkerLibraryPage } from './pages/social-worker/SocialWorkerLibraryPage'
import { SocialWorkerTransfersPage } from './pages/social-worker/SocialWorkerTransfersPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/report-case" element={<PlaceholderPage title="Report a Case" />} />
      <Route path="/request-help" element={<PlaceholderPage title="Request Help" />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PU']}>
            <PublicUserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PublicUserDashboard />} />
        <Route path="report-case" element={<ReportCasePage />} />
        <Route path="request-help" element={<RequestHelpPage />} />
        <Route path="my-cases" element={<MyCasesPage />} />
        <Route path="my-requests" element={<MyRequestsPage />} />
        <Route path="cases/:caseId" element={<CaseDetailsPage />} />
        <Route path="requests/:requestId" element={<RequestDetailsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="service-offers" element={<ServiceOffersPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="cases" element={<AllCasesPage />} />
        <Route path="cases/:caseId" element={<AdminCaseDetailsPage />} />
        <Route path="help-requests" element={<HelpRequestManagementPage />} />
        <Route path="help-requests/:requestId" element={<AdminHelpRequestDetailsPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="transfers" element={<TransferRequestManagementPage />} />
        <Route path="duplicates" element={<DuplicateDetectionPage />} />
        <Route path="announcements" element={<SystemAnnouncementsPage />} />
        <Route path="feedback" element={<FeedbackManagementPage />} />
      </Route>
      <Route
        path="/police"
        element={
          <ProtectedRoute allowedRoles={['PO']}>
            <PoliceLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PoliceDashboard />} />
        <Route path="cases" element={<PoliceCasesPage />} />
        <Route path="cases/:caseId" element={<PoliceCaseDetailsPage />} />
        <Route path="messages" element={<PoliceMessagesPage />} />
        <Route path="reports" element={<PoliceReportsPage />} />
        <Route path="profile" element={<PoliceProfilePage />} />
      </Route>
      <Route
        path="/social-worker"
        element={
          <ProtectedRoute allowedRoles={['SW']}>
            <SocialWorkerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SocialWorkerDashboard />} />
        <Route path="requests" element={<SocialWorkerRequestsPage />} />
        <Route path="requests/:requestId" element={<SocialWorkerRequestDetailsPage />} />
        <Route path="calendar" element={<SocialWorkerCalendarPage />} />
        <Route path="messages" element={<SocialWorkerMessagesPage />} />
        <Route path="library" element={<SocialWorkerLibraryPage />} />
        <Route path="transfers" element={<SocialWorkerTransfersPage />} />
        <Route path="packages" element={<SocialWorkerPackagesPage />} />
        <Route path="reports" element={<SocialWorkerReportsPage />} />
        <Route path="profile" element={<SocialWorkerProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h1 className="text-primary mb-3">{title}</h1>
        <p className="text-secondary">This page will be implemented with full functionality.</p>
      </div>
    </div>
  )
}

export default App

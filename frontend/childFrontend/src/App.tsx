import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { PublicLayout } from './layouts/PublicLayout'
import { SupportLocationsPage } from './pages/public/SupportLocationsPage'
import { ContactDirectoryPage } from './pages/public/ContactDirectoryPage'
import { HowItWorksPage } from './pages/public/HowItWorksPage'
import { CaseTypesGuidePage } from './pages/public/CaseTypesGuidePage'
import { ReportVsRequestPage } from './pages/public/ReportVsRequestPage'
import { AnonymousReportingPage } from './pages/public/AnonymousReportingPage'
import { PrivacySafetyPage } from './pages/public/PrivacySafetyPage'
import { AwarenessEducationPage } from './pages/public/AwarenessEducationPage'
import { FAQPage } from './pages/public/FAQPage'
import { ContactUsPage } from './pages/public/ContactUsPage'
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
import { FeedbackPage } from './pages/dashboard/FeedbackPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AllCasesPage } from './pages/admin/AllCasesPage'
import { AdminCaseDetailsPage } from './pages/admin/AdminCaseDetailsPage'
import { HelpRequestManagementPage } from './pages/admin/HelpRequestManagementPage'
import { AdminHelpRequestDetailsPage } from './pages/admin/AdminHelpRequestDetailsPage'
import { UserManagementPage } from './pages/admin/UserManagementPage'
import { TransferRequestManagementPage } from './pages/admin/TransferRequestManagementPage'
import { SystemAnnouncementsPage } from './pages/admin/SystemAnnouncementsPage'
import { FeedbackManagementPage } from './pages/admin/FeedbackManagementPage'
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { PoliceDashboard } from './pages/police/PoliceDashboard'
import { PoliceCasesPage } from './pages/police/PoliceCasesPage'
import { PoliceCaseDetailsPage } from './pages/police/PoliceCaseDetailsPage'
import { PoliceMessagesPage } from './pages/police/PoliceMessagesPage'
import { PoliceReportsPage } from './pages/police/PoliceReportsPage'
import { PoliceProfilePage } from './pages/police/PoliceProfilePage'
import { SocialWorkerDashboard } from './pages/social-worker/SocialWorkerDashboard'
import { SocialWorkerAnalyticsPage } from './pages/social-worker/SocialWorkerAnalytics'
import { SocialWorkerFeedbackPage } from './pages/social-worker/SocialWorkerFeedbackPage'
import { SocialWorkerFeedbackViewPage } from './pages/social-worker/SocialWorkerFeedbackViewPage'
import {
  SocialWorkerRequestsPage,
  SocialWorkerRequestDetailsPage,
  SocialWorkerCalendarPage,
  SocialWorkerFollowUpsPage,
  SocialWorkerMessagesPage,
  SocialWorkerLibraryPage,
  SocialWorkerTransfersPage,
  SocialWorkerReportsPage,
  SocialWorkerProfilePage,
  SocialWorkerCompletedReportPage,
} from './pages/social-worker/SocialWorkerPages'
import { SocialWorkerCollaborationPage } from './pages/social-worker/SocialWorkerCollaborationPage'
import { ServicePackageListingPage } from './pages/social-worker/ServicePackageListingPage'
import { ServicePackageFormPage } from './pages/social-worker/ServicePackageFormPage'


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/support-locations" element={<PublicLayout />}>
        <Route index element={<SupportLocationsPage />} />
      </Route>
      <Route path="/contact-directory" element={<PublicLayout />}>
        <Route index element={<ContactDirectoryPage />} />
      </Route>
      <Route path="/how-it-works" element={<PublicLayout />}>
        <Route index element={<HowItWorksPage />} />
      </Route>
      <Route path="/case-types" element={<PublicLayout />}>
        <Route index element={<CaseTypesGuidePage />} />
      </Route>
      <Route path="/report-vs-request" element={<PublicLayout />}>
        <Route index element={<ReportVsRequestPage />} />
      </Route>
      <Route path="/anonymous-reporting" element={<PublicLayout />}>
        <Route index element={<AnonymousReportingPage />} />
      </Route>
      <Route path="/privacy-safety" element={<PublicLayout />}>
        <Route index element={<PrivacySafetyPage />} />
      </Route>
      <Route path="/awareness" element={<PublicLayout />}>
        <Route index element={<AwarenessEducationPage />} />
      </Route>
      <Route path="/faq" element={<PublicLayout />}>
        <Route index element={<FAQPage />} />
      </Route>
      <Route path="/contact-us" element={<PublicLayout />}>
        <Route index element={<ContactUsPage />} />
      </Route>
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
        <Route path="feedback" element={<FeedbackPage />} />
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
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="cases" element={<AllCasesPage />} />
        <Route path="cases/:caseId" element={<AdminCaseDetailsPage />} />
        <Route path="help-requests" element={<HelpRequestManagementPage />} />
        <Route path="help-requests/:requestId" element={<AdminHelpRequestDetailsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="transfers" element={<TransferRequestManagementPage />} />
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
        <Route path="analytics" element={<SocialWorkerAnalyticsPage />} />
        <Route path="requests" element={<SocialWorkerRequestsPage />} />
        <Route path="requests/:requestId" element={<SocialWorkerRequestDetailsPage />} />
        <Route path="requests/:requestId/report" element={<SocialWorkerCompletedReportPage />} />
        <Route path="calendar" element={<SocialWorkerCalendarPage />} />
        <Route path="follow-ups" element={<SocialWorkerFollowUpsPage />} />
        <Route path="messages" element={<SocialWorkerMessagesPage />} />
        <Route path="collaboration" element={<SocialWorkerCollaborationPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="library" element={<SocialWorkerLibraryPage />} />
        <Route path="transfers" element={<SocialWorkerTransfersPage />} />
        <Route path="packages" element={<ServicePackageListingPage />} />
        <Route path="packages/create" element={<ServicePackageFormPage />} />
        <Route path="packages/:packageId/edit" element={<ServicePackageFormPage />} />
        <Route path="reports" element={<SocialWorkerReportsPage />} />
        <Route path="feedback" element={<SocialWorkerFeedbackPage />} />
        <Route path="feedback/:requestId" element={<SocialWorkerFeedbackViewPage />} />
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

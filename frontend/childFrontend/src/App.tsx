import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ModernTemplatePage from './pages/ModernTemplatePage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import PoliceRegistrationPage from './pages/registration/PoliceRegistrationPage';
import SocialWorkerRegistrationPage from './pages/registration/SocialWorkerRegistrationPage';
import PublicRegistrationPage from './pages/registration/PublicRegistrationPage';
import RegistrationOptionsPage from './pages/registration/RegistrationOptionsPage';
import RegistrationSuccessPage from './pages/registration/RegistrationSuccessPage';
import PoliceRegistrationSuccessPage from './pages/registration/PoliceRegistrationSuccessPage';
import SocialWorkerRegistrationSuccessPage from './pages/registration/SocialWorkerRegistrationSuccessPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminLayout from './layouts/AdminLayout';
import PoliceDashboard from './pages/dashboard/PoliceDashboard';
import PoliceLayout from './layouts/PoliceLayout';
import PublicUserDashboard from './pages/dashboard/PublicUserDashboard';
import PublicUserLayout from './layouts/PublicUserLayout';
import SocialWorkerLayout from './layouts/SocialWorkerLayout';
import SocialWorkerDashboardMain from './pages/dashboard/social-worker/SocialWorkerDashboardMain';

import ReportCasePage from './pages/cases/ReportCasePage';
import MyCasesPage from './pages/cases/MyCasesPage';
import CaseDetailsPage from './pages/cases/CaseDetailsPage';
import RequestHelpPage from './pages/help-requests/RequestHelpPage';
import MyHelpRequestsPage from './pages/help-requests/MyHelpRequestsPage';
import HelpRequestDetailsPage from './pages/help-requests/HelpRequestDetailsPage';
import MessagesPage from './pages/messages/MessagesPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import FeedbackPage from './pages/feedback/FeedbackPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationCenterPage from './pages/notifications/NotificationCenterPage';
import UserManagement from './pages/admin/UserManagement';
import AllCasesPage from './pages/admin/AllCasesPage';
import HelpRequestManagement from './pages/admin/HelpRequestManagement';
import TransferRequestManagement from './pages/admin/TransferRequestManagement';
import FeedbackManagement from './pages/admin/FeedbackManagement';
import SystemAnnouncements from './pages/admin/SystemAnnouncements';
import DuplicateDetection from './pages/admin/DuplicateDetection';
import RequestTransferPage from './pages/transfers/RequestTransferPage';
import ManageTransfersPage from './pages/transfers/ManageTransfersPage';
import TransferRequestsPage from './pages/transfers/TransferRequestsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotificationToast from './components/NotificationToast';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './hooks/useAuth';

function App() {
    const { user } = useAuth();

    return (
        <Router>
            <ScrollToTop />
            <NotificationToast />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/modern-template" element={<ModernTemplatePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/register" element={<RegistrationOptionsPage />} />
                <Route path="/register/public" element={<PublicRegistrationPage />} />
                <Route path="/register/public/success" element={<RegistrationSuccessPage />} />
                <Route path="/register/police" element={<PoliceRegistrationPage />} />
                <Route path="/register/police/success" element={<PoliceRegistrationSuccessPage />} />
                <Route path="/register/social-worker" element={<SocialWorkerRegistrationPage />} />
                <Route path="/register/social-worker/success" element={<SocialWorkerRegistrationSuccessPage />} />

                {/* Dashboard Route - Redirects based on role */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            {user?.role === 'ADMIN' ? <Navigate to="/dashboard/admin" replace /> :
                                user?.role === 'POLICE' ? <Navigate to="/dashboard/officer" replace /> :
                                    user?.role === 'SOCIAL_WORKER' ? <Navigate to="/dashboard/social-worker" replace /> :
                                        user?.role === 'PUBLIC' ? <Navigate to="/dashboard/user" replace /> :
                                            <Navigate to="/login" replace />}
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    element={
                        <ProtectedRoute requiredRole="ADMIN">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/system-status" element={<AdminDashboard />} />
                    <Route path="/admin/health" element={<AdminDashboard />} />
                    <Route path="/admin/audit-logs" element={<AdminDashboard />} />
                    <Route path="/admin/email-logs" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/users/all" element={<UserManagement />} />
                    <Route path="/admin/users/public" element={<UserManagement />} />
                    <Route path="/admin/users/pending" element={<UserManagement />} />
                    <Route path="/admin/users/police" element={<UserManagement />} />
                    <Route path="/admin/users/social-workers" element={<UserManagement />} />
                    <Route path="/admin/users/deactivated" element={<UserManagement />} />
                    <Route path="/admin/cases" element={<AllCasesPage />} />
                    <Route path="/admin/cases/all" element={<AllCasesPage />} />
                    <Route path="/admin/cases/emergency" element={<AllCasesPage />} />
                    <Route path="/admin/cases/pending-review" element={<AllCasesPage />} />
                    <Route path="/admin/cases/assigned" element={<AllCasesPage />} />
                    <Route path="/admin/cases/resolved" element={<AllCasesPage />} />
                    <Route path="/admin/cases/closed" element={<AllCasesPage />} />
                    <Route path="/admin/cases/anonymous" element={<AllCasesPage />} />
                    <Route path="/admin/cases/:caseId" element={<CaseDetailsPage />} />
                    <Route path="/admin/cases/duplicate-detection" element={<DuplicateDetection />} />
                    <Route path="/admin/help-requests" element={<HelpRequestManagement />} />
                    <Route path="/admin/help-requests/all" element={<HelpRequestManagement />} />
                    <Route path="/admin/help-requests/pending-review" element={<HelpRequestManagement />} />
                    <Route path="/admin/help-requests/in-progress" element={<HelpRequestManagement />} />
                    <Route path="/admin/help-requests/marketplace" element={<HelpRequestManagement />} />
                    <Route path="/admin/help-requests/assigned" element={<HelpRequestManagement />} />
                    <Route path="/admin/help-requests/completed" element={<HelpRequestManagement />} />
                    <Route path="/admin/help-requests/:requestId" element={<HelpRequestDetailsPage />} />
                    <Route path="/admin/transfers" element={<TransferRequestManagement />} />
                    <Route path="/admin/transfers/pending" element={<TransferRequestManagement />} />
                    <Route path="/admin/transfers/approved" element={<TransferRequestManagement />} />
                    <Route path="/admin/transfers/rejected" element={<TransferRequestManagement />} />
                    <Route path="/admin/analytics" element={<AnalyticsPage />} />
                    <Route path="/admin/analytics/dashboard" element={<AnalyticsPage />} />
                    <Route path="/admin/analytics/custom-reports" element={<AnalyticsPage />} />
                    <Route path="/admin/feedback" element={<FeedbackManagement />} />
                    <Route path="/admin/announcements" element={<SystemAnnouncements />} />
                    <Route path="/admin/settings" element={<SystemAnnouncements />} />
                </Route>

                {/* Public User Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <PublicUserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard/user" element={<PublicUserDashboard />} />
                    <Route path="/report-case" element={<ReportCasePage />} />
                    <Route path="/request-help" element={<RequestHelpPage />} />
                    <Route path="/cases/my-cases" element={<MyCasesPage />} />
                    <Route path="/cases/:caseId" element={<CaseDetailsPage />} />
                    <Route path="/help-requests/my-requests" element={<MyHelpRequestsPage />} />
                    <Route path="/help-requests/:requestId" element={<HelpRequestDetailsPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/feedback" element={<FeedbackPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<NotificationCenterPage />} />
                    <Route path="/change-password" element={<ChangePasswordPage />} />
                    {/* Other public user routes will be added as pages are created */}
                </Route>

                {/* Police Routes */}
                <Route
                    element={
                        <ProtectedRoute requiredRole="POLICE">
                            <PoliceLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard/officer" element={<PoliceDashboard />} />
                    <Route path="/police/assignments/active" element={<MyCasesPage />} />
                    <Route path="/police/assignments/emergency" element={<MyCasesPage />} />
                    <Route path="/police/assignments/history" element={<MyCasesPage />} />
                    <Route path="/police/cases/search" element={<MyCasesPage />} />
                    {/* Add more specific routes as needed */}
                </Route>

                {/* Social Worker Routes */}
                <Route
                    element={
                        <ProtectedRoute requiredRole="SOCIAL_WORKER">
                            <SocialWorkerLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard/social-worker" element={<SocialWorkerDashboardMain />} />
                    <Route path="/social-worker/assigned" element={<SocialWorkerDashboardMain />} /> {/* Placeholder */}
                    <Route path="/social-worker/offers" element={<SocialWorkerDashboardMain />} /> {/* Placeholder */}
                    <Route path="/social-worker/follow-ups" element={<SocialWorkerDashboardMain />} /> {/* Placeholder */}
                    <Route path="/social-worker/transfers" element={<SocialWorkerDashboardMain />} /> {/* Placeholder */}
                    <Route path="/social-worker/messages" element={<SocialWorkerDashboardMain />} /> {/* Placeholder */}
                    <Route path="/social-worker/notifications" element={<SocialWorkerDashboardMain />} /> {/* Placeholder */}
                    <Route path="/social-worker/analytics" element={<SocialWorkerDashboardMain />} /> {/* Placeholder */}
                    <Route path="/social-worker/profile" element={<SocialWorkerDashboardMain />} /> {/* Placeholder */}
                </Route>

                {/* Other Protected Routes */}
                <Route
                    path="/transfers/request"
                    element={
                        <ProtectedRoute>
                            <RequestTransferPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/transfers/manage"
                    element={
                        <ProtectedRoute>
                            <ManageTransfersPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/transfers/requests"
                    element={
                        <ProtectedRoute>
                            <TransferRequestsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MemberAuthProvider } from "@/contexts/MemberAuthContext";
import { TrainerAuthProvider } from "@/contexts/TrainerAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardErrorBoundary from "@/components/DashboardErrorBoundary";
import MemberProtectedRoute from "@/components/member/MemberProtectedRoute";
import MemberLayout from "@/components/member/MemberLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterGymPage from "./pages/RegisterGymPage";
import DashboardOverview from "./pages/DashboardOverview";
import MembersPage from "./pages/MembersPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import MemberProgressPage from "./pages/MemberProgressPage";
import AttendancePage from "./pages/AttendancePage";
import TrainersPage from "./pages/TrainersPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import GymPlansPage from "./pages/PlansPage";
import BranchesPage from "./pages/BranchesPage";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import GymsPage from "./pages/superadmin/GymsPage";
import SuperAdminPlansPage from "./pages/superadmin/PlansPage";
import SubscriptionsPage from "./pages/superadmin/SubscriptionsPage";
import AnnouncementsPage from "./pages/superadmin/AnnouncementsPage";
import MemberLoginPage from "./pages/member/MemberLoginPage";
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberAttendancePage from "./pages/member/MemberAttendancePage";
import MemberWorkoutsPage from "./pages/member/MemberWorkoutsPage";
import MemberWorkoutDetailPage from "./pages/member/MemberWorkoutDetailPage";
import MemberChatPage from "./pages/member/MemberChatPage";
import MemberChatThreadPage from "./pages/member/MemberChatThreadPage";
import MemberPaymentsPage from "./pages/member/MemberPaymentsPage";
import MemberProfilePage from "./pages/member/MemberProfilePage";
import MemberPortalProgressPage from "./pages/member/MemberProgressPage";
import TrainerLoginPage from "./pages/trainer/TrainerLoginPage";
import TrainerRegisterPage from "./pages/trainer/TrainerRegisterPage";
import TrainerLayout from "./components/trainer/TrainerLayout";
import TrainerProtectedRoute from "./components/trainer/TrainerProtectedRoute";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import TrainerMembersPage from "./pages/trainer/TrainerMembersPage";
import TrainerWorkoutsPage from "./pages/trainer/TrainerWorkoutsPage";
import TrainerWorkoutNewPage from "./pages/trainer/TrainerWorkoutNewPage";
import TrainerWorkoutDetailPage from "./pages/trainer/TrainerWorkoutDetailPage";
import TrainerExercisesPage from "./pages/trainer/TrainerExercisesPage";
import TrainerReportsPage from "./pages/trainer/TrainerReportsPage";
import TrainerProfilePage from "./pages/trainer/TrainerProfilePage";
import TrainerMemberProgressPage from "./pages/trainer/TrainerMemberProgressPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-gym" element={<RegisterGymPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardErrorBoundary><DashboardOverview /></DashboardErrorBoundary></ProtectedRoute>} />
            <Route path="/dashboard/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
            <Route path="/dashboard/members/:memberId/progress" element={<ProtectedRoute><MemberProgressPage /></ProtectedRoute>} />
            <Route path="/dashboard/trainers" element={<ProtectedRoute><TrainersPage /></ProtectedRoute>} />
            <Route path="/dashboard/workouts" element={<ProtectedRoute><WorkoutsPage /></ProtectedRoute>} />
            <Route path="/dashboard/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
            <Route path="/dashboard/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/dashboard/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/dashboard/branches" element={<ProtectedRoute><BranchesPage /></ProtectedRoute>} />
            <Route path="/dashboard/plans" element={<ProtectedRoute><GymPlansPage /></ProtectedRoute>} />
            <Route path="/dashboard/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            <Route path="/dashboard/roles" element={<ProtectedRoute><RolesPage /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute requireSuperAdmin><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/super-admin/gyms" element={<ProtectedRoute requireSuperAdmin><GymsPage /></ProtectedRoute>} />
            <Route path="/super-admin/plans" element={<ProtectedRoute requireSuperAdmin><SuperAdminPlansPage /></ProtectedRoute>} />
            <Route path="/super-admin/subscriptions" element={<ProtectedRoute requireSuperAdmin><SubscriptionsPage /></ProtectedRoute>} />
            <Route path="/super-admin/announcements" element={<ProtectedRoute requireSuperAdmin><AnnouncementsPage /></ProtectedRoute>} />
            <Route path="/member" element={<MemberAuthProvider><Outlet /></MemberAuthProvider>}>
              <Route path="login" element={<MemberLoginPage />} />
              <Route element={<MemberProtectedRoute><MemberLayout /></MemberProtectedRoute>}>
                <Route index element={<MemberDashboard />} />
                <Route path="attendance" element={<MemberAttendancePage />} />
                <Route path="workouts" element={<MemberWorkoutsPage />} />
                <Route path="workouts/:id" element={<MemberWorkoutDetailPage />} />
                <Route path="progress" element={<MemberPortalProgressPage />} />
                <Route path="chat" element={<MemberChatPage />} />
                <Route path="chat/:trainerId" element={<MemberChatThreadPage />} />
                <Route path="payments" element={<MemberPaymentsPage />} />
                <Route path="profile" element={<MemberProfilePage />} />
              </Route>
            </Route>
            <Route path="/trainer" element={<TrainerAuthProvider><Outlet /></TrainerAuthProvider>}>
              <Route path="login" element={<TrainerLoginPage />} />
              <Route path="register" element={<TrainerRegisterPage />} />
              <Route element={<TrainerProtectedRoute><TrainerLayout /></TrainerProtectedRoute>}>
                <Route index element={<TrainerDashboard />} />
                <Route path="members" element={<TrainerMembersPage />} />
                <Route path="members/:memberId/progress" element={<TrainerMemberProgressPage />} />
                <Route path="workouts" element={<TrainerWorkoutsPage />} />
                <Route path="workouts/new" element={<TrainerWorkoutNewPage />} />
                <Route path="workouts/:id" element={<TrainerWorkoutDetailPage />} />
                <Route path="exercises" element={<TrainerExercisesPage />} />
                <Route path="reports" element={<TrainerReportsPage />} />
                <Route path="profile" element={<TrainerProfilePage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Settings from "./pages/settings/Settings";
import Profile from "./pages/user/Profile";
import NotFound from "./pages/NotFound";
import Landing from "./pages/landing/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import Admin from "./pages/admin/Admin";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/user/UserManagement";
import UserCreate from "./pages/user/UserCreate";
import UserEdit from "./pages/user/UserEdit";
import UserDetail from "./pages/user/UserDetail";
import TasksPage from "./pages/task/TasksPage";
import GroupsPage from "./pages/group/GroupsPage";
import CreateGroupPage from "./pages/group/CreateGroupPage";
import GroupAnalyzePage from "./pages/group/GroupAnalyzePage";
import GroupManagePage from "./pages/group/GroupManagePage";
import AdminAnalyzePage from "./pages/admin/AdminAnalyzePage";
import ProjectCreate from "./pages/project/ProjectCreate";
import ProjectDetails from "./pages/project/ProjectDetails";
import ProjectEdit from "./pages/project/ProjectEdit";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectAnalyzePage from "./pages/project/ProjectAnalyzePage";
import FreeRiderDetectionPage from "./pages/project/FreeRiderDetectionPage";
import FreeRiderEvidenceDetailPage from "./pages/project/FreeRiderEvidenceDetailPage";
import FinalAssessmentPage from "./pages/project/FinalAssessmentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/">
            <Routes>
              {/* Landing page */}
              <Route path="/" element={<Landing />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />
              
              {/* Dashboard and main routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <Layout>
                    <Admin />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* User Management Routes */}
              <Route path="/admin/users" element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users/create" element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <Layout>
                    <UserCreate />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users/:id" element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <Layout>
                    <UserDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users/:id/edit" element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <Layout>
                    <UserEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* Project Management Routes */}
              <Route path="/projects/create" element={
                <ProtectedRoute roles={["INSTRUCTOR", "ADMIN"]}>
                  <Layout>
                    <ProjectCreate />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/details" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectDetails />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/edit" element={
                <ProtectedRoute roles={["INSTRUCTOR", "ADMIN"]}>
                  <Layout>
                    <ProjectEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/groups" element={
                <ProtectedRoute>
                  <Layout>
                    <GroupsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/groups/:groupId" element={
                <ProtectedRoute>
                  <Layout>
                    <GroupsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/groups/:groupId/manage" element={
                <ProtectedRoute>
                  <Layout>
                    <GroupManagePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/create-group" element={
                <ProtectedRoute>
                  <Layout>
                    <CreateGroupPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/tasks" element={
                <ProtectedRoute>
                  <Layout>
                    <TasksPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/groups/:groupId/analyze" element={
                <ProtectedRoute>
                  <Layout>
                    <GroupAnalyzePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/project-analyze" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectAnalyzePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/free-rider-detection" element={
                <ProtectedRoute roles={["ADMIN", "INSTRUCTOR", "STUDENT"]}>
                  <Layout>
                    <FreeRiderDetectionPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/admin-analyze" element={
                <ProtectedRoute roles={["ADMIN", "INSTRUCTOR"]}>
                  <Layout>
                    <AdminAnalyzePage />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* Final Assessment Route */}
              <Route path="/projects/:projectId/final-assessment" element={
                <ProtectedRoute roles={["INSTRUCTOR", "ADMIN"]}>
                  <Layout>
                    <FinalAssessmentPage />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* Global Free-Rider Detection Route */}
              <Route path="/freerider-detection" element={
                <ProtectedRoute roles={["INSTRUCTOR", "ADMIN"]}>
                  <Layout>
                    <FreeRiderDetectionPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/freerider-detection/evidence/:projectId/:userId" element={
                <ProtectedRoute roles={["INSTRUCTOR", "ADMIN"]}>
                  <Layout>
                    <FreeRiderEvidenceDetailPage />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* Fallback and 404 */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

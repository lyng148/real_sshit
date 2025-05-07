import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import UserManagement from "./pages/UserManagement";
import UserCreate from "./pages/UserCreate";
import UserEdit from "./pages/UserEdit";
import UserDetail from "./pages/UserDetail";
import TasksPage from "./pages/TasksPage";
import GroupsPage from "./pages/GroupsPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import GroupAnalyzePage from "./pages/GroupAnalyzePage";
import AdminAnalyzePage from "./pages/AdminAnalyzePage";
import ProjectCreate from "./pages/ProjectCreate";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectEdit from "./pages/ProjectEdit";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectAnalyzePage from "./pages/ProjectAnalyzePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Admin />
              </ProtectedRoute>
            } />
            {/* User Management Routes */}
            <Route path="/admin/users" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/users/create" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <UserCreate />
              </ProtectedRoute>
            } />
            <Route path="/admin/users/:id" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <UserDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/users/:id/edit" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <UserEdit />
              </ProtectedRoute>
            } />
            {/* Project Management Routes */}
            <Route path="/projects/create" element={
              <ProtectedRoute roles={["INSTRUCTOR", "ADMIN"]}>
                <ProjectCreate />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/details" element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/edit" element={
              <ProtectedRoute roles={["INSTRUCTOR", "ADMIN"]}>
                <ProjectEdit />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/groups" element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/create-group" element={
              <ProtectedRoute>
                <CreateGroupPage />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/tasks" element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/group-analyze" element={
              <ProtectedRoute>
                <GroupAnalyzePage />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/project-analyze" element={
              <ProtectedRoute>
                <ProjectAnalyzePage />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/admin-analyze" element={
              <ProtectedRoute roles={["ADMIN", "INSTRUCTOR"]}>
                <AdminAnalyzePage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Landing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PlanDetailPage from '../pages/plans/PlanDetailPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import SetupOperatorPage from '../pages/admin/SetupOperatorPage';
import DepartmentSetupPage from '../pages/admin/DepartmentSetupPage';
import SetupTeamPage from '../pages/admin/SetupTeamPage';
import SetupStatusPage from '../pages/admin/SetupStatusPage';
import SetupBucketPage from '../pages/admin/SetupBucketPage';
import SetupHealthPage from '../pages/admin/SetupHealthPage';
import TaskOverviewTeamPage from '../pages/overview/TaskOverviewTeamPage';
import TaskOverviewDepartmentPage from '../pages/overview/TaskOverviewDepartmentPage';
import TaskOverviewBucketPage from '../pages/overview/TaskOverviewBucketPage';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/plans" replace />} />
        <Route path="plans" element={<DashboardPage />} />
        <Route path="plans/:id" element={<PlanDetailPage />} />
        <Route path="admin/users" element={
          <ProtectedRoute roles={['it_manager']}><UserManagementPage /></ProtectedRoute>
        } />
        <Route path="admin/operators" element={
          <ProtectedRoute roles={['it_manager', 'pmo']}><SetupOperatorPage /></ProtectedRoute>
        } />
        <Route path="admin/departments" element={
          <ProtectedRoute roles={['it_manager', 'pmo']}><DepartmentSetupPage /></ProtectedRoute>
        } />
        <Route path="admin/teams" element={
          <ProtectedRoute roles={['it_manager', 'pmo']}><SetupTeamPage /></ProtectedRoute>
        } />
        <Route path="admin/statuses" element={
          <ProtectedRoute roles={['it_manager', 'pmo']}><SetupStatusPage /></ProtectedRoute>
        } />
        <Route path="admin/buckets" element={
          <ProtectedRoute roles={['it_manager', 'pmo']}><SetupBucketPage /></ProtectedRoute>
        } />
        <Route path="admin/health" element={
          <ProtectedRoute roles={['it_manager', 'pmo']}><SetupHealthPage /></ProtectedRoute>
        } />
        <Route path="overview/team"       element={<TaskOverviewTeamPage />} />
        <Route path="overview/department" element={<TaskOverviewDepartmentPage />} />
        <Route path="overview/bucket"     element={<TaskOverviewBucketPage />} />
        <Route path="*" element={<Navigate to="/plans" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;

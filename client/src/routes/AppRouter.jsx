import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PlanDetailPage from '../pages/plans/PlanDetailPage';
import UserManagementPage from '../pages/admin/UserManagementPage';

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
        <Route path="*" element={<Navigate to="/plans" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useAuthStore } from '@store/authStore';

// Layout
import AdminLayout from '@components/layout/AdminLayout';

// Pages
import LoginPage from '@pages/auth/LoginPage';
import DashboardPage from '@pages/dashboard/DashboardPage';
import UsersListPage from '@pages/users/UsersListPage';
import UserDetailsPage from '@pages/users/UserDetailsPage';
import ShopItemsPage from '@pages/rewards/ShopItemsPage';
import RedemptionsPage from '@pages/rewards/RedemptionsPage';
import CoinRulesPage from '@pages/rewards/CoinRulesPage';
import NewsContentPage from '@pages/content/NewsContentPage';
import SurveysPage from '@pages/content/SurveysPage';
import AuditLogsPage from '@pages/audit/AuditLogsPage';
import NotFoundPage from '@pages/NotFoundPage';

// API
import { fetchCurrentAdmin } from '@api/auth';

function App() {
  const { admin, setAdmin, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário admin está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminData = await fetchCurrentAdmin();
        if (adminData) {
          setAdmin(adminData);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setAdmin]);

  // Rota Protegida
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" tip="Carregando..." />
        </div>
      );
    }
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Carregando..." />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout>
              <DashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <AdminLayout>
              <UsersListPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users/:id" element={
          <ProtectedRoute>
            <AdminLayout>
              <UserDetailsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/rewards/shop" element={
          <ProtectedRoute>
            <AdminLayout>
              <ShopItemsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/rewards/redemptions" element={
          <ProtectedRoute>
            <AdminLayout>
              <RedemptionsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/rewards/coin-rules" element={
          <ProtectedRoute>
            <AdminLayout>
              <CoinRulesPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/content/news" element={
          <ProtectedRoute>
            <AdminLayout>
              <NewsContentPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/content/surveys" element={
          <ProtectedRoute>
            <AdminLayout>
              <SurveysPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/audit" element={
          <ProtectedRoute>
            <AdminLayout>
              <AuditLogsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={
          <ProtectedRoute>
            <AdminLayout>
              <NotFoundPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
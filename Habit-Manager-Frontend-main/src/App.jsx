import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './features/auth/authSlice';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ReminderListener from './components/ReminderListener';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HabitsPage = lazy(() => import('./pages/HabitsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AiCoachPage = lazy(() => import('./pages/AiCoachPage'));

function App() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const [theme, setTheme] = useState(() => localStorage.getItem('habit-manager-theme') === 'dark' ? 'dark' : 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('habit-manager-sidebar-collapsed') === 'true');

  useEffect(() => {
    const onThemeChange = (event) => setTheme(event.detail === 'dark' ? 'dark' : 'light');
    window.addEventListener('habit-manager:theme', onThemeChange);
    return () => window.removeEventListener('habit-manager:theme', onThemeChange);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  useEffect(() => {
    const onExpired = () => dispatch(logout());
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [dispatch]);

  return (
    <BrowserRouter>
      
      <div className={`app-shell${isAuthenticated ? ' has-sidebar' : ''}${sidebarCollapsed ? ' sidebar-collapsed' : ''}`} data-theme={theme}>
        {isAuthenticated && <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((value) => {
          const next = !value;
          localStorage.setItem('habit-manager-sidebar-collapsed', String(next));
          return next;
        })} />}
        <main className="main-content">
          <Suspense fallback={<div className="text-center py-5" role="status">Loading page…</div>}>
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
              <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
              <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/habits" element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/ai-coach" element={<ProtectedRoute><AiCoachPage /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
              <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      {isAuthenticated && <ReminderListener />}
    </BrowserRouter>
  );
}

export default App;

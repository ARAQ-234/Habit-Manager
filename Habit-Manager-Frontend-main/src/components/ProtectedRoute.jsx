import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();
  return authenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

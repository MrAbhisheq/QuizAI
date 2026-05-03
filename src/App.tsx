import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { QuizGenerator } from './components/QuizGenerator';
import { QuizAttempt } from './components/QuizAttempt';
import { QuizSuccess } from './components/QuizSuccess';
import { QuizManage } from './components/QuizManage';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Profile } from './components/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { trackPageView } from './services/analytics';

// Track page views on route changes
const PageViewTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
};

// Layout wrapper for authenticated routes
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

// Home redirect - redirects to generate if logged in, landing if not
const HomeRedirect: React.FC = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return null; // Loading handled by AuthProvider
  }
  
  return currentUser ? <Navigate to="/generate" replace /> : <LandingPage />;
};

function App() {
  return (
    <Router>
      <PageViewTracker />
      <AuthProvider>
        <Routes>
          {/* Public Routes - No Navbar */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/quiz/:quizId" element={<QuizAttempt />} />
          
          {/* Protected Routes - With Navbar */}
          <Route
            path="/generate"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <QuizGenerator />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-success"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <QuizSuccess />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/:quizId"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <QuizManage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Settings />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Profile />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GalleryDashboard from './pages/GalleryDashboard';
import FolderDetails from './pages/FolderDetails';
import GiftCardBuilder from './pages/GiftCardBuilder';
import TemplateSelectionPage from './pages/TemplateSelectionPage';
import GiftCardViewer from './pages/GiftCardViewer';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import UserFiles from './pages/UserFiles';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import ReportedContent from './pages/ReportedContent';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If the logged‑in user is an admin, send them to the admin dashboard
  if (user && user.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-pink-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-gray-600">Manage your photos and account settings</p>
            </div>
            <div className="h-16 w-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/gallery"
            className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-pink-100 hover:shadow-2xl transition-all transform hover:scale-[1.02]"
          >
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
                  My Photo Albums
                </h3>
                <p className="text-gray-600 text-sm">Organize your photo albums</p>
              </div>
            </div>
          </Link>

          <button
            onClick={logout}
            className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-pink-100 hover:shadow-2xl transition-all transform hover:scale-[1.02] text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 bg-gradient-to-br from-rose-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-rose-600 transition-colors">
                  Logout
                </h3>
                <p className="text-gray-600 text-sm">Sign out of your account</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Component to conditionally render Navbar
const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/view/');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <PrivateRoute>
              <GalleryDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/gallery/:folderId"
          element={
            <PrivateRoute>
              <FolderDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/gallery/:folderId/select-template"
          element={
            <PrivateRoute>
              <TemplateSelectionPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/gallery/:folderId/create-gift-card"
          element={
            <PrivateRoute>
              <GiftCardBuilder />
            </PrivateRoute>
          }
        />
        <Route
          path="/gallery/:folderId/gift-card/:giftCardId/edit"
          element={
            <PrivateRoute>
              <GiftCardBuilder />
            </PrivateRoute>
          }
        />
        {/* Public route - no authentication */}
        <Route path="/view/:slug" element={<GiftCardViewer />} />
        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:id/files"
          element={
            <AdminRoute>
              <AdminLayout>
                <UserFiles />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reported"
          element={
            <AdminRoute>
              <AdminLayout>
                <ReportedContent />
              </AdminLayout>
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;

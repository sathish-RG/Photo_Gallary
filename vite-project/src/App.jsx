import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GalleryDashboard from './pages/GalleryDashboard';
import FolderDetails from './pages/FolderDetails';
import GiftCardBuilder from './pages/GiftCardBuilder';
import TemplateSelectionPage from './pages/TemplateSelectionPage';
import GiftCardViewer from './pages/GiftCardViewer';
import ClaimGift from './pages/ClaimGift';
import GiftCards from './pages/GiftCards';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import UserFiles from './pages/UserFiles';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import ReportedContent from './pages/ReportedContent';
import AdminCreateTemplate from './pages/AdminCreateTemplate';
import AdminTemplates from './pages/AdminTemplates';
import AdminSettings from './pages/AdminSettings';
import AdminBatchGenerator from './pages/AdminBatchGenerator';
import NotFound from './pages/NotFound';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If the logged‑in user is an admin, send them to the admin dashboard
  if (user && user.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-slate-500 mt-2">Manage your photos and account settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/gallery"
          className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                My Photo Albums
              </h3>
              <p className="text-slate-500 text-sm mt-1">Organize your photo albums</p>
            </div>
          </div>
        </Link>

        <Link
          to="/gift-cards"
          className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                Gift Cards
              </h3>
              <p className="text-slate-500 text-sm mt-1">Manage your gift cards</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

const AppContent = () => {
  return (
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
        path="/gift-cards"
        element={
          <PrivateRoute>
            <GiftCards />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
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
      <Route path="/claim/:qrCodeId" element={<ClaimGift />} />
      {/* Admin routes */}
      <Route
        path="/admin/templates"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminTemplates />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/templates/create"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminCreateTemplate />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/templates/edit/:id"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminCreateTemplate />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/batch-generator"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminBatchGenerator />
            </AdminLayout>
          </AdminRoute>
        }
      />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4f46e5',
              secondary: 'black',
            },
          },
        }} />
      </AuthProvider>
    </Router>
  );
}

export default App;

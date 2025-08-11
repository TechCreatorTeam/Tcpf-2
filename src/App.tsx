import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminProjectRequestsPage from './pages/admin/AdminProjectRequestsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminDownloadRequestsPage from './pages/admin/AdminDownloadRequestsPage';
import EmailChangeExamplePage from './pages/admin/EmailChangeExamplePage';
import AdminEmailChangeAuditPage from './pages/admin/AdminEmailChangeAuditPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import EmailChangeVerificationPage from './pages/EmailChangeVerificationPage';
import SecureDownloadPage from './pages/SecureDownloadPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProjectProvider>
          <ThemeProvider>
            <SettingsProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/checkout/:id" element={<CheckoutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/secure-download/:token" element={<SecureDownloadPage />} />
                    <Route path="/admin/login/verify-email-change" element={<EmailChangeVerificationPage />} />
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute>
                          <AdminDashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/project-requests" 
                      element={
                        <ProtectedRoute>
                          <AdminProjectRequestsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/projects" 
                      element={
                        <ProtectedRoute>
                          <AdminProjectsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/orders" 
                      element={
                        <ProtectedRoute>
                          <AdminOrdersPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/download-requests" 
                      element={
                        <ProtectedRoute>
                          <AdminDownloadRequestsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/settings" 
                      element={
                        <ProtectedRoute>
                          <AdminSettingsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/email-change-example" 
                      element={
                        <ProtectedRoute>
                          <EmailChangeExamplePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/email-change-audit" 
                      element={
                        <ProtectedRoute>
                          <AdminEmailChangeAuditPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/payments" 
                      element={
                        <ProtectedRoute>
                          <AdminPaymentsPage />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </SettingsProvider>
          </ThemeProvider>
        </ProjectProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
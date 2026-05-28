import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OperationProvider } from './context/OperationContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import History from './pages/History';
import Settings from './pages/Settings';
import { Menu, Cpu } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Router guard for authenticated routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-purple"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const { loading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col md:flex-row">
      
      {/* Mobile Top bar header */}
      <header className="md:hidden h-16 shrink-0 bg-[#07070b] border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 bg-gradient-to-tr from-accent-purple to-accent-blue rounded">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-100 to-accent-purple bg-clip-text text-transparent font-semibold tracking-wide text-sm">
            CalcMaster <span className="text-accent-blue font-bold">AI</span>
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main scrolling viewport content */}
      <main className="flex-1 min-w-0 md:h-screen md:overflow-y-auto px-4 sm:px-8 py-6 md:py-8">
        <div className="max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workspace/:workspaceId" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <OperationProvider>
          <AppContent />
        </OperationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

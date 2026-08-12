import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Transfers from './pages/Transfers';
import History from './pages/History';
import Airtime from './pages/Airtime';
import Notifications from './pages/Notifications';
import PaymentMethods from './pages/PaymentMethods';
import Support from './pages/Support';
import { Toast } from './components/common';
import { useSession, useToast } from './hooks';

const ProtectedRoute = ({ children, session }) => {
  if (session === undefined) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [session, setSession] = useSession();
  const { toast, notify } = useToast();

  return (
    <>
      {toast && <Toast message={toast.message} variant={toast.variant} />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth session={session} onSessionUpdate={setSession} notify={notify} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <Dashboard session={session} notify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transfers"
          element={
            <ProtectedRoute session={session}>
              <Transfers session={session} notify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute session={session}>
              <History session={session} notify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/airtime"
          element={
            <ProtectedRoute session={session}>
              <Airtime session={session} notify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-methods"
          element={
            <ProtectedRoute session={session}>
              <PaymentMethods session={session} notify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute session={session}>
              <Notifications session={session} notify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/support"
          element={
            <ProtectedRoute session={session}>
              <Support session={session} notify={notify} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;

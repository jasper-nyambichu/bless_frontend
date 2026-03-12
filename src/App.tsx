import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./routes/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/auth/AuthPage";
import AdminLogin from "./pages/auth/AdminLogin";
import Dashboard from "./pages/member/Dashboard";
import Payment from "./pages/member/Payment";
import Transactions from "./pages/member/Transactions";
import Profile from "./pages/member/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Members from "./pages/admin/Members";
import AdminTransactions from "./pages/admin/AdminTransactions";
import Reports from "./pages/admin/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Member Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/members" element={<AdminRoute><Members /></AdminRoute>} />
            <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

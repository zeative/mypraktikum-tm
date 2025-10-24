import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import MuridDashboard from "./pages/murid/Dashboard";
import MuridLaporanForm from "./pages/murid/LaporanForm";
import MuridLaporanList from "./pages/murid/LaporanList";
import GuruDashboard from "./pages/guru/Dashboard";
import GuruLaporanList from "./pages/guru/LaporanList";
import GuruLaporanDetail from "./pages/guru/LaporanDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Murid Routes */}
            <Route
              path="/murid/dashboard"
              element={
                <ProtectedRoute requiredRole="MURID">
                  <MuridDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/murid/laporan"
              element={
                <ProtectedRoute requiredRole="MURID">
                  <MuridLaporanList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/murid/laporan/form"
              element={
                <ProtectedRoute requiredRole="MURID">
                  <MuridLaporanForm />
                </ProtectedRoute>
              }
            />
            
            {/* Guru Routes */}
            <Route
              path="/guru/dashboard"
              element={
                <ProtectedRoute requiredRole="GURU">
                  <GuruDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guru/laporan"
              element={
                <ProtectedRoute requiredRole="GURU">
                  <GuruLaporanList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guru/laporan/:id"
              element={
                <ProtectedRoute requiredRole="GURU">
                  <GuruLaporanDetail />
                </ProtectedRoute>
              }
            />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

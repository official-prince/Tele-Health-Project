import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Appointments from "./pages/Appointments";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Doctor from "./pages/Doctor";
import Admin from "./pages/Admin";
import Patient from "./pages/Patient";
import PaymentStatus from "./pages/PaymentStatus";
import LayoutOutlet from "@/components/LayoutOutlet";
import { AuthProvider } from "@/components/AuthProvider";
import { RequireRole } from "@/components/auth-guards";

const queryClient = new QueryClient();

const DoctorGuard = () => (
  <RequireRole role="doctor">
    <Doctor />
  </RequireRole>
);

const AdminGuard = () => (
  <RequireRole role="admin">
    <Admin />
  </RequireRole>
);

const PatientGuard = () => (
  <RequireRole role="patient">
    <Patient />
  </RequireRole>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<LayoutOutlet />}>
              <Route path="/" element={<Index />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/payment-status" element={<PaymentStatus />} />
            </Route>
            <Route element={<LayoutOutlet />}>
              <Route path="/doctor" element={<DoctorGuard />} />
              <Route path="/patient" element={<PatientGuard />} />
              <Route path="/admin" element={<AdminGuard />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

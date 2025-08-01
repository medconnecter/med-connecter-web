import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import FindDoctorsPage from "./pages/FindDoctorsPage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import AboutPage from "./pages/AboutPage";
import ReimbursementAndCostsPage from "./pages/ReimbursementAndCostsPage";
import WhyMedConnecterPage from "./pages/WhyMedConnecterPage";
import NotFound from "./pages/NotFound";
import VerifyAccountPage from "./pages/VerifyAccountPage";
import AccountCreatedPage from "./pages/AccountCreatedPage";
import PatientDashboard from "./components/dashboard/PatientDashboard";
import DoctorDashboard from "./components/dashboard/DoctorDashboard";
import AdditionalDetailsPage from "./pages/AdditionalDetailsPage";
import AdditionalDetailsMessagePage from "./pages/AdditionalDetailsMessagePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/find-doctors" element={<FindDoctorsPage />} />
              <Route path="/doctor/:id" element={<DoctorProfilePage />} />
              <Route path="/book-appointment/:id" element={<BookAppointmentPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/reimbursement-and-costs" element={<ReimbursementAndCostsPage />} />
              <Route path="/why-medconnecter" element={<WhyMedConnecterPage />} />
              <Route path="/verify-account" element={<VerifyAccountPage />} />
              <Route path="/account-created" element={<AccountCreatedPage />} />
              <Route path="/patient-dashboard" element={<PatientDashboard />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/additional-details" element={<AdditionalDetailsPage />} />
              <Route path="/additional-details-message" element={<AdditionalDetailsMessagePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

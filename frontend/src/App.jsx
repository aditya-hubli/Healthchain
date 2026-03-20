import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context";
import Navbar from "./components/layout/Navbar";
import RoleGuard from "./components/layout/RoleGuard";
import Landing from "./pages/Landing";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Web3Provider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/admin"
              element={
                <RoleGuard requiredRole="admin">
                  <AdminDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/doctor"
              element={
                <RoleGuard requiredRole="doctor">
                  <DoctorDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/patient"
              element={
                <RoleGuard requiredRole="patient">
                  <PatientDashboard />
                </RoleGuard>
              }
            />
          </Routes>
        </div>
      </Web3Provider>
    </BrowserRouter>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import PatientList from "../components/doctor/PatientList";
import CreateRecord from "../components/doctor/CreateRecord";
import ViewRecords from "../components/doctor/ViewRecords";
import AuditLog from "../components/shared/AuditLog";

export default function DoctorDashboard() {
  const { account } = useWeb3();
  const location = useLocation();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Reset selected patient when Dashboard button is clicked
  useEffect(() => {
    setSelectedPatient(null);
  }, [location.state]);

  return (
    <div className="min-h-[calc(100vh-68px)] bg-gradient-to-br from-gray-50 to-blue-50/20">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
            🩺
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Doctor Dashboard</h1>
            <p className="text-sm text-gray-500 font-mono">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <PatientList onSelectPatient={setSelectedPatient} selected={selectedPatient} />
          </div>
          <div className="md:col-span-2 space-y-6">
            {selectedPatient ? (
              <>
                <CreateRecord
                  patient={selectedPatient}
                  onCreated={() => setRefreshKey((k) => k + 1)}
                />
                <ViewRecords patient={selectedPatient} key={refreshKey} />
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-4">📂</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Patient Selected</h3>
                <p className="text-gray-400 text-sm">
                  Select a patient from the list to view or create medical records.
                </p>
              </div>
            )}
          </div>
        </div>
        <AuditLog title="My Audit Log" />
      </div>
    </div>
  );
}

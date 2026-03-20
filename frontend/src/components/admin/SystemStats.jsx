import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";

export default function SystemStats() {
  const { contracts } = useWeb3();
  const [stats, setStats] = useState({ doctors: 0, patients: 0, records: 0, audits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contracts) return;
    const load = async () => {
      try {
        const [doctors, patients, records, audits] = await Promise.all([
          contracts.roleManager.getDoctorCount(),
          contracts.roleManager.getPatientCount(),
          contracts.recordStorage.getTotalRecords(),
          contracts.auditTrail.getTotalEntries(),
        ]);
        setStats({
          doctors: Number(doctors),
          patients: Number(patients),
          records: Number(records),
          audits: Number(audits),
        });
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [contracts]);

  const items = [
    { label: "Doctors", value: stats.doctors, icon: "🩺", gradient: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
    { label: "Patients", value: stats.patients, icon: "👥", gradient: "from-green-500 to-green-600", bg: "bg-green-50" },
    { label: "Records", value: stats.records, icon: "📋", gradient: "from-purple-500 to-purple-600", bg: "bg-purple-50" },
    { label: "Audit Logs", value: stats.audits, icon: "🔍", gradient: "from-orange-500 to-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-lg">
          📊
        </div>
        <h2 className="text-lg font-bold text-gray-800">System Stats</h2>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={`${item.bg} rounded-xl p-4 text-center border border-transparent hover:border-gray-200 transition-colors`}
            >
              <span className="text-lg">{item.icon}</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{item.value}</p>
              <p className="text-xs font-medium text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

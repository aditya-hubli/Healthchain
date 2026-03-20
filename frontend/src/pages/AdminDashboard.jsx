import { useWeb3 } from "../context/Web3Context";
import RegisterDoctor from "../components/admin/RegisterDoctor";
import SystemStats from "../components/admin/SystemStats";
import AuditLog from "../components/shared/AuditLog";

export default function AdminDashboard() {
  const { account } = useWeb3();

  return (
    <div className="min-h-[calc(100vh-68px)] bg-gradient-to-br from-gray-50 to-red-50/20">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
            ⚙
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 font-mono">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <RegisterDoctor />
          <SystemStats />
        </div>
        <AuditLog title="System Audit Log" showAll={true} />
      </div>
    </div>
  );
}

import { Navigate } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";

export default function RoleGuard({ requiredRole, children }) {
  const { account, role, loading } = useWeb3();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading your account...</p>
      </div>
    );
  }

  if (!account) return <Navigate to="/" replace />;
  if (role !== requiredRole) return <Navigate to="/" replace />;

  return <div className="animate-fade-in">{children}</div>;
}

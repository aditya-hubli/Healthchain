import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";

const ROLE_COLORS = {
  admin: "from-red-500 to-orange-500",
  doctor: "from-blue-500 to-cyan-500",
  patient: "from-green-500 to-emerald-500",
  none: "from-gray-500 to-gray-500",
};

export default function Navbar() {
  const { account, role, connectWallet } = useWeb3();
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-lg flex items-center justify-center text-lg font-bold shadow-md group-hover:shadow-blue-500/30 transition-shadow">
            H
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            HealthChain
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {role && role !== "none" && (
            <button
              type="button"
              onClick={() => navigate(`/${role}`, { state: { reset: Date.now() } })}
              className="text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all border border-white/10"
            >
              Dashboard
            </button>
          )}

          {account ? (
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${
                  ROLE_COLORS[role] || ROLE_COLORS.none
                } capitalize shadow-sm`}
              >
                {role}
              </span>
              <span className="text-sm text-gray-300 font-mono">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={connectWallet}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

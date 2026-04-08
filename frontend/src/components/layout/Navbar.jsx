import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Plug } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";

const ROLE_ACCENT = {
  admin:   { bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.45)", text: "#fda4af" },
  doctor:  { bg: "rgba(94,234,212,0.12)",  border: "rgba(94,234,212,0.45)",  text: "#5eead4" },
  patient: { bg: "rgba(134,239,172,0.12)", border: "rgba(134,239,172,0.45)", text: "#86efac" },
  none:    { bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.30)", text: "#94a3b8" },
};

export default function Navbar() {
  const { account, role, connectWallet } = useWeb3();
  const navigate = useNavigate();
  const accent = ROLE_ACCENT[role] || ROLE_ACCENT.none;

  return (
    <nav className="relative z-30 border-b border-[var(--hc-border)] bg-[#050b15]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* logo with node pulse */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl border border-teal-300/40 bg-gradient-to-br from-teal-400/20 to-emerald-400/10 flex items-center justify-center">
            <span className="font-display text-base font-bold text-teal-200">H</span>
            <span className="absolute -top-0.5 -right-0.5 hc-dot" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-bold tracking-tight bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-300 bg-clip-text text-transparent">
              HEALTHCHAIN
            </p>
            <p className="font-mono-data text-[9px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)]">
              Protocol · v1.0
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {role && role !== "none" && (
            <button
              type="button"
              onClick={() => navigate(`/${role}`, { state: { reset: Date.now() } })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--hc-border)] bg-white/[0.03] hover:bg-white/[0.07] hover:border-[var(--hc-border-strong)] transition-all font-mono-data text-[11px] uppercase tracking-[0.14em] text-[var(--hc-text-dim)] hover:text-teal-200"
            >
              <LayoutDashboard size={13} />
              Dashboard
            </button>
          )}

          {account ? (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[var(--hc-border)] bg-black/30">
              <span
                className="px-2 py-0.5 rounded-md font-mono-data text-[10px] uppercase tracking-[0.16em] border"
                style={{ background: accent.bg, borderColor: accent.border, color: accent.text }}
              >
                {role}
              </span>
              <span className="hc-dot" />
              <span className="font-mono-data text-[11px] text-teal-100">
                {account.slice(0, 6)}…{account.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={connectWallet}
              className="hc-btn !py-2.5 !px-5 !text-[11px]"
            >
              <Plug size={14} /> Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

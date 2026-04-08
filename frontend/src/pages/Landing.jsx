import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  FileLock2,
  ScrollText,
  Database,
  Plug,
  ArrowRight,
  Hand,
  Network,
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";

const FEATURES = [
  { icon: ShieldCheck, code: "F/01", title: "Patient-Controlled Access", desc: "Grant or revoke clinician access at any time, enforced by smart contract." },
  { icon: FileLock2,   code: "F/02", title: "On-Chain Records",         desc: "Every record hash committed to Ethereum. Tamper-evident by design." },
  { icon: ScrollText,  code: "F/03", title: "Immutable Audit Trail",    desc: "Append-only ledger of every access, grant, and modification." },
  { icon: Database,    code: "F/04", title: "IPFS File Storage",        desc: "Documents stored content-addressed on IPFS via Pinata." },
];

export default function Landing() {
  const { account, role, contracts, refreshRole, connectWallet, addSepoliaNetwork, loading } = useWeb3();
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (role && role !== "none") {
      navigate(`/${role}`, { replace: true });
    }
  }, [role, navigate]);

  const handleRegisterPatient = async () => {
    setRegistering(true);
    const tid = toast.loading("Broadcasting registration…");
    try {
      const tx = await contracts.roleManager.registerPatient();
      await tx.wait();
      await refreshRole();
      toast.success("Welcome to Healthchain", { id: tid });
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error(err?.reason || err?.data?.message || "Registration failed", { id: tid });
    }
    setRegistering(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-68px)] overflow-hidden">
      <div className="hc-aurora" />
      <div className="hc-aurora-grid" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* ============ HERO ============ */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* LEFT */}
          <div className="lg:col-span-7 hc-rise hc-d-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--hc-border)] bg-white/[0.02]">
                <span className="hc-dot" />
                <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                  Live · Sepolia Testnet
                </span>
              </div>
              <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)]">
                · Protocol v1.0
              </span>
            </div>

            <h1 className="font-display text-[58px] md:text-[78px] leading-[0.9] font-bold">
              <span className="bg-gradient-to-br from-white via-teal-100 to-teal-300 bg-clip-text text-transparent">
                Medical
              </span>
              <br />
              <span className="bg-gradient-to-br from-teal-300 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                Records,
              </span>
              <br />
              <span className="font-display italic text-white/80">re-engineered.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[var(--hc-text-dim)] leading-relaxed">
              A protocol for patient-sovereign health data. Records are committed to Ethereum,
              files stored on IPFS, access governed by signed transactions — not gatekeepers.
            </p>

            <div className="mt-9">
              {loading ? (
                <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-wider text-[var(--hc-text-dim)]">
                  <span className="w-4 h-4 border border-teal-300/30 border-t-teal-300 rounded-full animate-spin" />
                  Detecting wallet…
                </div>
              ) : !account ? (
                <button onClick={connectWallet} className="hc-btn">
                  <Plug size={15} /> Connect MetaMask <ArrowRight size={15} />
                </button>
              ) : role === "none" ? null : (
                <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-wider text-emerald-300">
                  <span className="w-4 h-4 border border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
                  Routing to dashboard…
                </div>
              )}
              {!account && (
                <p className="mt-3 font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--hc-text-mute)]">
                  Wallet = Identity · No passwords · No emails
                </p>
              )}

              <button
                onClick={addSepoliaNetwork}
                className="mt-5 flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--hc-border)] bg-white/[0.03] hover:bg-white/[0.07] hover:border-[var(--hc-border-strong)] transition-all font-mono-data text-[10px] uppercase tracking-[0.16em] text-teal-200"
              >
                <Network size={12} />
                Add Reliable Sepolia RPC
              </button>
              <p className="mt-2 font-mono-data text-[9px] uppercase tracking-[0.16em] text-[var(--hc-text-mute)]">
                Run this once if registration fails with "RPC too many errors"
              </p>
            </div>
          </div>

          {/* RIGHT — registration card / status panel */}
          <div className="lg:col-span-5 hc-rise hc-d-2">
            {role === "none" && account ? (
              <div className="hc-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl border border-emerald-300/30 bg-emerald-400/10 flex items-center justify-center text-emerald-200">
                    <Hand size={18} />
                  </div>
                  <div>
                    <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)]">
                      Onboarding · 01
                    </p>
                    <h2 className="font-display text-xl text-white">Claim Your Identity</h2>
                  </div>
                </div>

                <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--hc-text-dim)] mb-2">
                  Connected Wallet
                </p>
                <div className="px-4 py-3 rounded-xl border border-[var(--hc-border)] bg-black/40 font-mono-data text-[12px] text-teal-200 mb-6">
                  {account}
                </div>

                <button
                  onClick={handleRegisterPatient}
                  disabled={registering}
                  className="hc-btn w-full"
                >
                  {registering ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                      Broadcasting
                    </>
                  ) : (
                    <>Register as Patient <ArrowRight size={15} /></>
                  )}
                </button>
                <p className="mt-4 font-mono-data text-[10px] uppercase tracking-[0.16em] text-[var(--hc-text-mute)] leading-relaxed">
                  Doctors are provisioned by the protocol admin. Send your address to be added.
                </p>
              </div>
            ) : (
              <div className="hc-card p-8 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-teal-400/10 blur-3xl" />
                <div className="relative">
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)] mb-3">
                    Protocol Status
                  </p>
                  <div className="space-y-3 font-mono-data text-[11px]">
                    {[
                      ["Network",      "Ethereum Sepolia"],
                      ["Chain ID",     "11155111"],
                      ["Contracts",    "4 / 4 deployed"],
                      ["Storage",      "IPFS · Pinata"],
                      ["Audit Mode",   "Append-only"],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between border-b border-[var(--hc-border)] pb-2.5"
                      >
                        <span className="uppercase tracking-[0.16em] text-[var(--hc-text-mute)]">{k}</span>
                        <span className="text-teal-200">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <span className="hc-dot" />
                    <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                      All systems nominal
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============ FEATURES GRID ============ */}
        <div className="mt-24">
          <div className="flex items-end justify-between mb-8 hc-rise hc-d-3">
            <div>
              <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)] mb-2">
                Capabilities · 04
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-white">
                Built for trust, by design.
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--hc-text-dim)]">
              <span>scroll</span>
              <span className="w-8 h-px bg-teal-300/40" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.code} className={`hc-card p-6 hc-rise hc-d-${i + 3}`}>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg border border-teal-300/30 bg-teal-400/5 flex items-center justify-center text-teal-200">
                    <f.icon size={16} />
                  </div>
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--hc-text-mute)]">
                    {f.code}
                  </span>
                </div>
                <h3 className="font-display text-lg text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--hc-text-dim)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ============ FOOTER ============ */}
        <footer className="mt-20 border-t border-[var(--hc-border)] pt-5 flex flex-wrap items-center justify-between gap-4 font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)]">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2"><span className="hc-dot" /> RPC Healthy</span>
            <span>Chain · 11155111</span>
          </div>
          <span className="text-teal-300">Healthchain Protocol · 2026</span>
        </footer>
      </div>
    </div>
  );
}

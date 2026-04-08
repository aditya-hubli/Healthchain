import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Stethoscope, ShieldOff } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";

export default function ManageAccess() {
  const { account, contracts } = useWeb3();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  const loadDoctors = async () => {
    if (!contracts || !account) return;
    setLoading(true);
    try {
      const list = await contracts.accessControl.getPatientDoctors(account);
      setDoctors([...list]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDoctors();
  }, [contracts, account]);

  const handleRevoke = async (doctor) => {
    setRevoking(doctor);
    const tid = toast.loading("Revoking access...");
    try {
      const tx = await contracts.accessControl.revokeAccess(doctor);
      await tx.wait();
      await loadDoctors();
      toast.success("Access revoked", { id: tid });
    } catch (err) {
      console.error(err);
      toast.error(err?.reason || err?.data?.message || "Failed to revoke access", { id: tid });
    }
    setRevoking(null);
  };

  return (
    <div className="hc-card p-7 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl border border-teal-300/30 bg-teal-400/10 flex items-center justify-center text-teal-200">
            <Stethoscope size={18} />
          </div>
          <div>
            <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)]">
              Roster · 02
            </p>
            <h2 className="font-display text-xl text-white">My Doctors</h2>
          </div>
        </div>
        <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-teal-200 px-2.5 py-1 rounded-md border border-teal-300/30 bg-teal-400/5">
          {doctors.length} active
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/[0.03] border border-[var(--hc-border)] animate-pulse" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-[var(--hc-border)] rounded-xl">
          <ShieldOff size={28} className="mx-auto mb-3 text-[var(--hc-text-mute)]" />
          <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--hc-text-mute)]">
            No clinicians authorized
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {doctors.map((doc) => (
            <li
              key={doc}
              className="flex justify-between items-center px-4 py-3 rounded-xl border border-[var(--hc-border)] bg-black/30 hover:border-[var(--hc-border-strong)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border border-teal-300/30 bg-teal-400/10 flex items-center justify-center font-mono-data text-[10px] text-teal-200">
                  DR
                </div>
                <span className="font-mono-data text-[12px] text-teal-100">
                  {doc.slice(0, 6)}…{doc.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => handleRevoke(doc)}
                disabled={revoking === doc}
                className="font-mono-data text-[10px] uppercase tracking-[0.16em] px-3 py-1.5 rounded-md border border-rose-400/30 text-rose-300 hover:bg-rose-400/10 hover:border-rose-400/60 transition-all disabled:opacity-50"
              >
                {revoking === doc ? "Revoking…" : "Revoke"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

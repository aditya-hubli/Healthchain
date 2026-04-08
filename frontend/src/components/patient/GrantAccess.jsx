import { useState } from "react";
import toast from "react-hot-toast";
import { Unlock, ArrowRight } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";

export default function GrantAccess({ onGranted }) {
  const { contracts } = useWeb3();
  const [doctorAddr, setDoctorAddr] = useState("");
  const [duration, setDuration] = useState("0");
  const [status, setStatus] = useState("");

  const handleGrant = async (e) => {
    e.preventDefault();
    setStatus("pending");
    const tid = toast.loading("Granting access...");
    try {
      const tx = await contracts.accessControl.grantAccess(doctorAddr, duration);
      await tx.wait();
      setStatus("success");
      setDoctorAddr("");
      onGranted?.();
      toast.success("Access granted!", { id: tid });
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      toast.error(err?.reason || err?.data?.message || "Failed to grant access", { id: tid });
    }
  };

  return (
    <div className="hc-card p-7 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl border border-emerald-300/30 bg-emerald-400/10 flex items-center justify-center text-emerald-200">
          <Unlock size={18} />
        </div>
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)]">
            Action · 01
          </p>
          <h2 className="font-display text-xl text-white">Grant Access</h2>
        </div>
      </div>

      <form onSubmit={handleGrant} className="space-y-5">
        <div>
          <label className="block font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--hc-text-dim)] mb-2">
            Doctor Address
          </label>
          <input
            type="text"
            placeholder="0x…"
            value={doctorAddr}
            onChange={(e) => setDoctorAddr(e.target.value)}
            className="hc-input"
            required
          />
        </div>
        <div>
          <label className="block font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--hc-text-dim)] mb-2">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="hc-input appearance-none cursor-pointer"
          >
            <option value="0">Permanent</option>
            <option value="3600">1 Hour</option>
            <option value="86400">1 Day</option>
            <option value="604800">1 Week</option>
            <option value="2592000">30 Days</option>
          </select>
        </div>
        <button type="submit" disabled={status === "pending"} className="hc-btn w-full">
          {status === "pending" ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              Broadcasting
            </>
          ) : (
            <>Grant Access <ArrowRight size={15} /></>
          )}
        </button>
        {status === "success" && (
          <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-emerald-300 flex items-center gap-2">
            <span className="hc-dot" /> Access granted on-chain
          </div>
        )}
      </form>
    </div>
  );
}

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { UserPlus, ShieldCheck, AlertCircle, ChevronRight } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";

const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

export default function RegisterDoctor() {
  const { contracts } = useWeb3();
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");

  const validity = useMemo(() => {
    if (!address) return "empty";
    if (ETH_RE.test(address)) return "valid";
    if (address.startsWith("0x") && address.length <= 42) return "typing";
    return "invalid";
  }, [address]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (validity !== "valid") return;
    setStatus("pending");
    const tid = toast.loading("Broadcasting transaction…");
    try {
      const tx = await contracts.roleManager.registerDoctor(address);
      await tx.wait();
      setStatus("success");
      setAddress("");
      toast.success("Doctor registered on-chain", { id: tid });
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      toast.error(err?.reason || err?.data?.message || "Registration failed", { id: tid });
    }
  };

  const inputClass =
    "hc-input " +
    (validity === "valid" ? "is-valid" : validity === "invalid" ? "is-invalid" : "");

  return (
    <div className="hc-card p-7 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400/20 to-emerald-400/10 border border-teal-300/30 flex items-center justify-center text-teal-200">
            <UserPlus size={18} />
          </div>
          <div>
            <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)]">
              Action · 01
            </p>
            <h2 className="font-display text-xl text-white">Provision Clinician</h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-dim)]">
              EVM Address
            </label>
            <div className="flex items-center gap-1.5">
              {validity === "valid" && (
                <>
                  <ShieldCheck size={11} className="text-emerald-300" />
                  <span className="font-mono-data text-[10px] uppercase tracking-wider text-emerald-300">
                    Checksum OK
                  </span>
                </>
              )}
              {validity === "invalid" && (
                <>
                  <AlertCircle size={11} className="text-rose-300" />
                  <span className="font-mono-data text-[10px] uppercase tracking-wider text-rose-300">
                    Invalid Format
                  </span>
                </>
              )}
              {validity === "typing" && (
                <span className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--hc-text-mute)]">
                  Awaiting…
                </span>
              )}
            </div>
          </div>
          <input
            type="text"
            placeholder="0x0000000000000000000000000000000000000000"
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
          />
          <p className="mt-2 font-mono-data text-[10px] text-[var(--hc-text-mute)]">
            42-char hex · prefixed with 0x · validated client-side
          </p>
        </div>

        <button
          type="submit"
          disabled={status === "pending" || validity !== "valid"}
          className="hc-btn w-full"
        >
          {status === "pending" ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              Broadcasting
            </>
          ) : (
            <>
              Sign & Register
              <ChevronRight size={16} />
            </>
          )}
        </button>

        {status === "success" && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-400/30 bg-emerald-400/5 animate-slide-down">
            <span className="hc-dot" />
            <span className="font-mono-data text-[11px] text-emerald-200 uppercase tracking-wider">
              Transaction confirmed
            </span>
          </div>
        )}
      </form>
    </div>
  );
}

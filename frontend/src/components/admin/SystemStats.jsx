import { useState, useEffect, useRef } from "react";
import { Stethoscope, Users, FileText, ScrollText, BarChart3 } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";

function useCountUp(target, duration = 1100) {
  const [val, setVal] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    let raf;
    startRef.current = null;
    const tick = (t) => {
      if (!startRef.current) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function StatCard({ label, value, icon: Icon, accent, code }) {
  const display = useCountUp(value);
  return (
    <div
      className="relative rounded-2xl border bg-black/30 p-5 overflow-hidden group transition-transform hover:-translate-y-0.5"
      style={{ borderColor: `${accent}33` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 60%)` }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--hc-text-mute)]">
            {code}
          </p>
          <p className="font-display text-4xl text-white mt-1 tabular-nums">{display}</p>
          <p className="font-mono-data text-[11px] uppercase tracking-wider text-[var(--hc-text-dim)] mt-1">
            {label}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-lg border flex items-center justify-center"
          style={{ borderColor: `${accent}55`, color: accent, background: `${accent}10` }}
        >
          <Icon size={16} />
        </div>
      </div>
      <div className="hc-spark mt-4" />
    </div>
  );
}

export default function SystemStats() {
  const { contracts } = useWeb3();
  const [stats, setStats] = useState({ doctors: 0, patients: 0, records: 0, audits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contracts) return;
    (async () => {
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
    })();
  }, [contracts]);

  const items = [
    { code: "S/01", label: "Clinicians",  value: stats.doctors,  icon: Stethoscope, accent: "#5eead4" },
    { code: "S/02", label: "Patients",    value: stats.patients, icon: Users,       accent: "#86efac" },
    { code: "S/03", label: "Records",     value: stats.records,  icon: FileText,    accent: "#a78bfa" },
    { code: "S/04", label: "Audit Logs",  value: stats.audits,   icon: ScrollText,  accent: "#fbbf24" },
  ];

  return (
    <div className="hc-card p-7 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400/15 to-teal-400/10 border border-violet-300/25 flex items-center justify-center text-violet-200">
            <BarChart3 size={18} />
          </div>
          <div>
            <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)]">
              Telemetry · Live
            </p>
            <h2 className="font-display text-xl text-white">Protocol Vitals</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hc-dot" />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-emerald-300">
            Streaming
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <StatCard key={item.code} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

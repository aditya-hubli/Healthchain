import { useState, useEffect } from "react";
import { ScrollText, Inbox, Terminal } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";

const ACTION_LABELS = [
  "Doctor Registered",
  "Patient Registered",
  "Access Granted",
  "Access Revoked",
  "Record Created",
  "Record Viewed",
];

const ACTION_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-emerald-100 text-emerald-700",
  "bg-red-100 text-red-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
];

export default function AuditLog({ title = "Audit Log", showAll = false, variant = "default" }) {
  const isTerminal = variant === "terminal";
  const { account, contracts } = useWeb3();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contracts || !account) return;
    const load = async () => {
      setLoading(true);
      try {
        let logs = [];

        if (showAll) {
          // Admin view: fetch ALL entries in the system
          const total = await contracts.auditTrail.getTotalEntries();
          const count = Number(total);
          for (let i = 0; i < count; i++) {
            const entry = await contracts.auditTrail.getEntry(i);
            logs.push(entry);
          }
        } else {
          // User view: fetch only entries involving this address
          const ids = await contracts.auditTrail.getUserAuditIds(account);
          for (const id of ids) {
            const entry = await contracts.auditTrail.getEntry(id);
            logs.push(entry);
          }
        }

        logs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        setEntries(logs);
      } catch (err) {
        console.error("Failed to load audit log:", err);
      }
      setLoading(false);
    };
    load();
  }, [contracts, account, showAll]);

  if (isTerminal) {
    return (
      <div className="hc-terminal p-6 relative">
        <div className="hc-scanline" />
        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-teal-300/30 bg-teal-400/5 flex items-center justify-center text-teal-200">
              <Terminal size={16} />
            </div>
            <div>
              <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--hc-text-mute)]">
                Action · 02 · Immutable Ledger
              </p>
              <h2 className="font-display text-xl text-white">{title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--hc-text-dim)]">
            <span><span className="text-teal-300">{entries.length}</span> entries</span>
            <span className="flex items-center gap-2">
              <span className="hc-dot" /> tail -f
            </span>
          </div>
        </div>

        <div className="relative font-mono-data text-[12px]">
          <div className="text-teal-300/80 mb-3">
            <span className="text-emerald-300">root@healthchain</span>
            <span className="text-[var(--hc-text-mute)]">:</span>
            <span className="text-teal-200">~/audit</span>
            <span className="text-[var(--hc-text-mute)]">$ </span>
            <span className="hc-cursor">cat audit.ledger</span>
          </div>

          {loading ? (
            <div className="space-y-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-5 rounded bg-teal-300/5 animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10 text-[var(--hc-text-mute)]">
              <Inbox size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-[11px] uppercase tracking-wider">No entries · stream idle</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.16em] text-[var(--hc-text-mute)]">
                    <th className="pb-3 px-3 font-normal">#</th>
                    <th className="pb-3 px-3 font-normal">Action</th>
                    <th className="pb-3 px-3 font-normal">Performer</th>
                    <th className="pb-3 px-3 font-normal">Subject</th>
                    <th className="pb-3 px-3 font-normal">Details</th>
                    <th className="pb-3 px-3 font-normal">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-[12px]">
                  {entries.map((e, i) => {
                    const idx = entries.length - i;
                    return (
                      <tr
                        key={i}
                        className="border-t border-teal-300/5 hover:bg-teal-300/[0.03] transition-colors"
                      >
                        <td className="py-2.5 px-3 text-[var(--hc-text-mute)]">
                          {String(idx).padStart(4, "0")}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-emerald-300">
                            {ACTION_LABELS[Number(e.actionType)] || "UNKNOWN"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-teal-200">
                          {e.performer.slice(0, 6)}…{e.performer.slice(-4)}
                        </td>
                        <td className="py-2.5 px-3 text-teal-200">
                          {e.subject.slice(0, 6)}…{e.subject.slice(-4)}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--hc-text-dim)] max-w-[260px] truncate">
                          {e.details || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--hc-text-mute)] whitespace-nowrap">
                          {new Date(Number(e.timestamp) * 1000).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-[var(--hc-text-mute)]">
            <span className="text-emerald-300">root@healthchain</span>
            <span className="text-[var(--hc-text-mute)]">:</span>
            <span className="text-teal-200">~/audit</span>
            <span className="text-[var(--hc-text-mute)]">$</span>
            <span className="hc-cursor" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
          <ScrollText size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <p className="text-xs text-gray-400">{entries.length} entries</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8">
          <Inbox size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-400 text-sm">No audit entries found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-3 px-2 font-medium">Action</th>
                <th className="pb-3 px-2 font-medium">Performer</th>
                <th className="pb-3 px-2 font-medium">Subject</th>
                <th className="pb-3 px-2 font-medium">Details</th>
                <th className="pb-3 px-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-2">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        ACTION_COLORS[Number(e.actionType)] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ACTION_LABELS[Number(e.actionType)] || "Unknown"}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-gray-600">
                    {e.performer.slice(0, 6)}...{e.performer.slice(-4)}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-gray-600">
                    {e.subject.slice(0, 6)}...{e.subject.slice(-4)}
                  </td>
                  <td className="py-3 px-2 text-gray-500 text-xs">{e.details}</td>
                  <td className="py-3 px-2 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(Number(e.timestamp) * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

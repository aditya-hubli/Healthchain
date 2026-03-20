import { useState, useEffect } from "react";
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

export default function AuditLog({ title = "Audit Log", showAll = false }) {
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-lg">
          🔍
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
          <span className="text-3xl block mb-2">📭</span>
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

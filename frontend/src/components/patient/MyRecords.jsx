import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import RecordCard from "../shared/RecordCard";

export default function MyRecords() {
  const { account, contracts } = useWeb3();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contracts || !account) return;
    const load = async () => {
      setLoading(true);
      try {
        const ids = await contracts.recordStorage.getPatientRecordIds(account);
        const recs = [];
        for (const id of ids) {
          const rec = await contracts.recordStorage.getRecord(id);
          recs.push(rec);
        }
        recs.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
        setRecords(recs);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [contracts, account]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-lg">
          📋
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">My Medical Records</h2>
          <p className="text-xs text-gray-400">{records.length} record(s)</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-4xl block mb-3">📂</span>
          <p className="text-gray-400 text-sm">No medical records found.</p>
          <p className="text-gray-300 text-xs mt-1">Records will appear here once a doctor creates them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec, i) => (
            <RecordCard key={i} record={rec} />
          ))}
        </div>
      )}
    </div>
  );
}

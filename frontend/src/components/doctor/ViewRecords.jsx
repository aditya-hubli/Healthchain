import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import RecordCard from "../shared/RecordCard";

export default function ViewRecords({ patient }) {
  const { contracts } = useWeb3();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contracts || !patient) return;
    const load = async () => {
      setLoading(true);
      try {
        const ids = await contracts.recordStorage.getPatientRecordIds(patient);
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
  }, [contracts, patient]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-lg">
          📂
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Patient Records</h2>
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
        <div className="text-center py-8">
          <span className="text-3xl block mb-2">📭</span>
          <p className="text-gray-400 text-sm">No records for this patient yet.</p>
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

import { getIPFSUrl } from "../../utils/ipfs";

export default function RecordCard({ record }) {
  const date = new Date(Number(record.createdAt) * 1000).toLocaleString();

  return (
    <div className="bg-gradient-to-r from-white to-blue-50/30 rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all hover:border-blue-200/50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <h3 className="font-bold text-gray-900">{record.diagnosis}</h3>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{date}</span>
      </div>
      <div className="ml-4 space-y-1.5">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Rx:</span>{" "}
          {record.prescription}
        </p>
        {record.notes && (
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-400 text-xs uppercase tracking-wider">Notes:</span>{" "}
            {record.notes}
          </p>
        )}
      </div>
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400 font-mono">
          Dr: {record.doctor.slice(0, 6)}...{record.doctor.slice(-4)}
        </span>
        {record.ipfsHash && (
          <a
            href={getIPFSUrl(record.ipfsHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            View File ↗
          </a>
        )}
      </div>
    </div>
  );
}

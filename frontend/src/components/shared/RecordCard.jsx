import { ExternalLink } from "lucide-react";
import { getIPFSUrl } from "../../utils/ipfs";

export default function RecordCard({ record }) {
  const date = new Date(Number(record.createdAt) * 1000).toLocaleString();

  return (
    <div className="rounded-xl border border-[var(--hc-border)] bg-black/30 hover:border-[var(--hc-border-strong)] hover:bg-black/40 transition-all p-5">
      <div className="flex justify-between items-start mb-3 gap-4">
        <div className="flex items-center gap-2.5">
          <span className="hc-dot" />
          <h3 className="font-display text-lg text-white">{record.diagnosis}</h3>
        </div>
        <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[var(--hc-text-mute)] px-2.5 py-1 rounded-md border border-[var(--hc-border)] bg-white/[0.02] whitespace-nowrap">
          {date}
        </span>
      </div>

      <div className="ml-4 space-y-2 mb-4">
        <p className="text-sm text-[var(--hc-text-dim)] leading-relaxed">
          <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-teal-300 mr-2">Rx</span>
          {record.prescription}
        </p>
        {record.notes && (
          <p className="text-sm text-[var(--hc-text-dim)] leading-relaxed">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--hc-text-mute)] mr-2">Notes</span>
            {record.notes}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-[var(--hc-border)]">
        <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[var(--hc-text-mute)]">
          Dr · {record.doctor.slice(0, 6)}…{record.doctor.slice(-4)}
        </span>
        {record.ipfsHash && (
          <a
            href={getIPFSUrl(record.ipfsHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono-data text-[10px] uppercase tracking-[0.16em] text-teal-200 px-3 py-1.5 rounded-md border border-teal-300/30 bg-teal-400/5 hover:bg-teal-400/10 hover:border-teal-300/60 transition-all"
          >
            View File <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

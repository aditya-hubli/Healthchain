import { useState } from "react";
import toast from "react-hot-toast";
import { FilePlus2 } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";
import FileUpload from "../shared/FileUpload";

export default function CreateRecord({ patient, onCreated }) {
  const { contracts } = useWeb3();
  const [form, setForm] = useState({ diagnosis: "", prescription: "", notes: "" });
  const [ipfsHash, setIpfsHash] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("pending");
    const tid = toast.loading("Creating record on-chain...");
    try {
      const tx = await contracts.recordStorage.createRecord(
        patient,
        form.diagnosis,
        form.prescription,
        form.notes,
        ipfsHash
      );
      await tx.wait();
      setStatus("success");
      setForm({ diagnosis: "", prescription: "", notes: "" });
      setIpfsHash("");
      onCreated?.();
      toast.success("Record created!", { id: tid });
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      toast.error(err?.reason || err?.data?.message || "Failed to create record", { id: tid });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          <FilePlus2 size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Create Record</h2>
          <p className="text-xs text-gray-400 font-mono">
            Patient: {patient.slice(0, 6)}...{patient.slice(-4)}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Diagnosis</label>
          <input
            type="text"
            placeholder="e.g. Common Cold, Hypertension..."
            value={form.diagnosis}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Prescription</label>
          <input
            type="text"
            placeholder="e.g. Paracetamol 500mg, Rest..."
            value={form.prescription}
            onChange={(e) => setForm({ ...form, prescription: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Notes (optional)</label>
          <textarea
            placeholder="Additional notes or observations..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
            rows={3}
          />
        </div>
        <FileUpload onUploaded={setIpfsHash} />
        {ipfsHash && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-2 rounded-lg font-mono break-all">
            IPFS CID: {ipfsHash}
          </div>
        )}
        <button
          type="submit"
          disabled={status === "pending"}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "pending" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Record...
            </span>
          ) : (
            "Create Record"
          )}
        </button>
        {status === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl animate-slide-down">
            Record created successfully!
          </div>
        )}
      </form>
    </div>
  );
}

import { useState } from "react";
import { uploadToIPFS } from "../../utils/ipfs";

export default function FileUpload({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    try {
      const cid = await uploadToIPFS(file);
      onUploaded(cid);
    } catch (err) {
      console.error("IPFS upload failed:", err);
      alert("File upload failed. Check Pinata API keys in .env");
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">
        Attach File (optional)
      </label>
      <div className="relative">
        <input
          type="file"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer file:transition-colors"
        />
      </div>
      {uploading && (
        <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
          <span className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          Uploading to IPFS...
        </div>
      )}
      {fileName && !uploading && (
        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
          <span>✓</span> Uploaded: {fileName}
        </p>
      )}
    </div>
  );
}

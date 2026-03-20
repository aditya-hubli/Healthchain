import axios from "axios";
import PINATA_CONFIG from "../config/pinata";

export async function uploadToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_CONFIG.API_KEY,
        pinata_secret_api_key: PINATA_CONFIG.API_SECRET,
      },
    }
  );

  return res.data.IpfsHash;
}

export function getIPFSUrl(cid) {
  if (!cid) return null;
  return `${PINATA_CONFIG.GATEWAY}${cid}`;
}

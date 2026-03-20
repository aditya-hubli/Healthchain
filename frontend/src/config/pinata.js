const PINATA_CONFIG = {
  API_KEY: import.meta.env.VITE_PINATA_API_KEY || "",
  API_SECRET: import.meta.env.VITE_PINATA_API_SECRET || "",
  GATEWAY: "https://gateway.pinata.cloud/ipfs/",
};

export default PINATA_CONFIG;

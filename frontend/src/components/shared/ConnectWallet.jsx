import { useWeb3 } from "../../context/Web3Context";

export default function ConnectWallet() {
  const { connectWallet, loading } = useWeb3();

  return (
    <button
      onClick={connectWallet}
      disabled={loading}
      className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Connecting...
        </span>
      ) : (
        "Connect MetaMask"
      )}
    </button>
  );
}

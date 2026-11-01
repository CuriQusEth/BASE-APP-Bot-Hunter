import React, { useState } from 'react';
import { useGameStore } from '../../lib/store';
import { motion } from 'motion/react';
import { useConnect, useAccount, useDisconnect, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { parseEther } from 'viem';
import { Target, Skull, Zap, ExternalLink, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { getBuilderCode } from '../../lib/builder-code';
import { useAttributedTransaction, CANONICAL_MULTICALL3 } from '../../lib/transactions';

export function TitleScreen() {
  const { setScreen } = useGameStore();
  const { connectors, connect, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, isConnecting, isReconnecting, address, chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { sendTransactionAsync, supportsBatching } = useAttributedTransaction();

  const [gmTxHash, setGmTxHash] = useState<`0x${string}` | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess: isGmConfirmed } = useWaitForTransactionReceipt({
    hash: gmTxHash || undefined,
  });

  const isWrongNetwork = isConnected && chainId !== base.id && chainId !== baseSepolia.id;

  const handleGM = async () => {
    if (!isConnected) {
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Multicall3 getBlockNumber() selector + "gm" string
      const calldata = '0x42c4c0d0676d'; 
      const hash = await sendTransactionAsync({
        to: CANONICAL_MULTICALL3,
        value: parseEther('0'),
        data: calldata as `0x${string}`
      });
      setGmTxHash(hash);
    } catch (err: any) {
      console.error("GM Transaction failed:", err);
      setErrorMessage(err?.shortMessage || err?.message || "Transaction cancelled or failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExplorerUrl = (hash: string) => {
    return chainId === baseSepolia.id
      ? `https://sepolia.basescan.org/tx/${hash}`
      : `https://basescan.org/tx/${hash}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative bg-[radial-gradient(circle_at_center,_#1a1a2e_0%,_#05050b_100%)] overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[30vw] md:h-[30vw] bg-cyan-600/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="text-center z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-2 text-cyan-400">
          <Target size={32} />
          <Zap size={32} />
          <Skull size={32} />
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 italic drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          BOT HUNTER
        </h1>
        <p className="mt-4 text-gray-400 font-mono tracking-widest text-sm md:text-lg">ELITE NEURO-TACTICAL COMBAT</p>
      </motion.div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
        className="mt-12 flex flex-col gap-4 z-10 w-72 md:w-88"
      >
        <button 
          onClick={() => setScreen('playing')}
          className="relative group overflow-hidden w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-400 text-black font-black text-lg uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <span className="relative">START HUNT</span>
        </button>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent my-1"></div>

        {/* Four-state wallet UI */}
        {isReconnecting ? (
          <div className="flex items-center justify-center gap-2 py-3 bg-[#0a0a1a] border border-cyan-500/20 text-cyan-300 font-mono text-xs rounded-lg">
            <Loader2 className="animate-spin w-4 h-4 text-cyan-400" />
            <span>Reconnecting wallet...</span>
          </div>
        ) : isConnecting || isConnectPending ? (
          <div className="flex items-center justify-center gap-2 py-3 bg-[#0a0a1a] border border-cyan-500/20 text-cyan-300 font-mono text-xs rounded-lg">
            <Loader2 className="animate-spin w-4 h-4 text-cyan-400" />
            <span>Connecting...</span>
          </div>
        ) : !isConnected ? (
          <div className="flex flex-col gap-2">
            {connectors.map((connector) => (
              <button 
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="w-full py-2.5 px-3 bg-[#0a0a1a] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-mono text-xs uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all flex items-center justify-between"
              >
                <span>Connect {connector.name}</span>
                <span className="text-[10px] text-cyan-500/60 font-sans">EIP-5792 ready</span>
              </button>
            ))}
          </div>
        ) : isWrongNetwork ? (
          <button 
            onClick={() => switchChain({ chainId: base.id })}
            disabled={isSwitching}
            className="w-full py-3 bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 font-mono text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSwitching ? 'animate-spin' : ''}`} />
            {isSwitching ? 'Switching Network...' : 'Switch to Base'}
          </button>
        ) : (
          <div className="flex flex-col gap-2 bg-black/40 border border-gray-800 p-3 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {address?.slice(0,6)}...{address?.slice(-4)}
              </span>
              <span className="text-[11px] text-cyan-400 font-bold">
                {chainId === baseSepolia.id ? 'Base Sepolia' : 'Base Mainnet'}
              </span>
            </div>

            {supportsBatching && (
              <div className="text-[10px] text-cyan-300/80 font-mono bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40 flex items-center justify-between">
                <span>⚡ Smart Wallet (EIP-5792 Atomic)</span>
                <span className="text-emerald-400">Active</span>
              </div>
            )}

            <button 
              onClick={handleGM}
              disabled={isSubmitting || isConfirming}
              className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 text-black font-black text-xs uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:brightness-110 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Confirm in Wallet...</span>
                </>
              ) : isConfirming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Confirming (200ms canonical)...</span>
                </>
              ) : isGmConfirmed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>GM Confirmed!</span>
                </>
              ) : (
                <span>Say GM On-Chain (Base)</span>
              )}
            </button>

            {gmTxHash && (
              <a 
                href={getExplorerUrl(gmTxHash)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 transition-colors"
              >
                <span>View on Basescan</span>
                <ExternalLink size={12} />
              </a>
            )}

            {errorMessage && (
              <div className="text-[10px] text-red-400 font-mono text-center">
                {errorMessage}
              </div>
            )}

            <button 
              onClick={() => disconnect()}
              className="py-1 text-gray-500 hover:text-gray-300 font-mono text-[11px] uppercase transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </motion.div>

      <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono font-bold flex flex-col gap-1 z-10">
        <div className="flex gap-2 items-center">
          <span className="text-cyan-400 font-black">BASE NATIVE 200MS BLOCKS</span>
          <span>|</span>
          <span className="text-gray-400">BUILDER: {getBuilderCode()}</span>
        </div>
        <div className="flex gap-2 text-cyan-500/80 items-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <span>ERC-8021 CALLED WITH MULTICALL3 & BASE MCP ACTIVE</span>
        </div>
      </div>
    </div>
  );
}


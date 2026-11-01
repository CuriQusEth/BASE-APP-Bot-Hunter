import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../lib/store';
import { motion } from 'motion/react';
import { Skull, ShieldAlert, Crosshair, ExternalLink, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAccount, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useAttributedTransaction, CANONICAL_MULTICALL3 } from '../../lib/transactions';

export function GameOverScreen() {
  const { setScreen, score, wave, kills, updateHighestWave } = useGameStore();
  const { isConnected, address, chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { sendTransactionAsync } = useAttributedTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  });

  const isWrongNetwork = isConnected && chainId !== base.id && chainId !== baseSepolia.id;

  useEffect(() => {
    updateHighestWave(wave);
  }, [wave, updateHighestWave]);

  const handleRecordScore = async () => {
    if (!isConnected || !address) {
      setErrorMessage("Connect wallet first to record your hunt on Base!");
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    
    // Create an on-chain record for the score via a call to Multicall3.getBlockNumber() (0x42c4c0d0)
    // We append the score data so it becomes arbitrary trailing data that EVM smart contracts natively ignore
    const scoreData = `SCORE:${score}:WAVE:${wave}:KILLS:${kills}`;
    const scoreHex = Array.from(new TextEncoder().encode(scoreData))
      .map(b => b.toString(16).padStart(2, '0')).join('');
      
    // The Base attribution (ERC-8021) is automatically appended by useAttributedTransaction
    try {
      const hash = await sendTransactionAsync({
        to: CANONICAL_MULTICALL3,
        value: 0n,
        data: `0x42c4c0d0${scoreHex}` as `0x${string}`,
      });
      setTxHash(hash);
      console.log("Recorded score on Base with tx:", hash);
    } catch (err: any) {
      console.error("Failed to record score:", err);
      setErrorMessage(err?.shortMessage || err?.message || "Transaction failed or was rejected");
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
    <div className="flex flex-col items-center justify-center h-full w-full relative bg-[radial-gradient(circle_at_center,_#2e1a1a_0%,_#0b0505_100%)] overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ff0055 1px, transparent 1px), linear-gradient(90deg, #ff0055 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="z-10 flex flex-col items-center p-8 bg-[#0a0a1a]/80 border border-red-500/30 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.15)] min-w-[320px] md:min-w-[420px]"
      >
        <Skull className="text-red-500 w-16 h-16 mb-4 animate-pulse" />
        <h2 className="text-4xl font-black text-red-500 mb-2 tracking-tighter">MISSION FAILED</h2>
        <div className="text-gray-400 font-mono text-xs mb-6 uppercase tracking-widest text-center">
          Hunter Unit Terminated · Base Combat Network
        </div>

        <div className="w-full space-y-3 mb-6">
          <div className="flex justify-between items-center bg-red-950/30 p-3 border border-red-900/50 rounded">
            <span className="text-gray-400 font-mono text-sm">FINAL SCORE</span>
            <span className="text-2xl font-bold text-white font-mono">{score}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded">
            <span className="text-gray-400 font-mono text-sm">WAVES SURVIVED</span>
            <span className="text-lg text-cyan-400 font-mono">{wave - 1}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded">
            <span className="text-gray-400 font-mono text-sm">BOTS SCRAPPED</span>
            <span className="text-lg text-fuchsia-400 font-mono">{kills}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => setScreen('playing')}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-400 text-black font-black text-sm uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Crosshair size={18} />
            DEPLOY AGAIN
          </button>
          
          {isWrongNetwork ? (
            <button
              onClick={() => switchChain({ chainId: base.id })}
              disabled={isSwitching}
              className="w-full py-3 bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 font-mono text-xs tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSwitching ? 'animate-spin' : ''}`} />
              {isSwitching ? 'Switching Network...' : 'Switch to Base'}
            </button>
          ) : (
            <button 
              onClick={handleRecordScore}
              disabled={isSubmitting || isConfirming || isConfirmed}
              className={`w-full py-3 border font-mono text-xs tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-all ${
                isConfirmed 
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 cursor-default" 
                : isConfirming || isSubmitting
                ? "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300 cursor-wait"
                : "bg-[#0a0a1a] border-fuchsia-500/30 hover:border-fuchsia-400 text-fuchsia-400 shadow-[0_0_15px_rgba(255,0,255,0.1)] active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-fuchsia-400" />
                  <span>Confirm in Wallet...</span>
                </>
              ) : isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-fuchsia-400" />
                  <span>Confirming on Base (200ms)...</span>
                </>
              ) : isConfirmed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SECURED ON BASE</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={16} />
                  <span>RECORD THIS HUNT ON-CHAIN</span>
                </>
              )}
            </button>
          )}

          {txHash && (
            <div className="flex flex-col items-center gap-1 mt-1">
              <a 
                href={getExplorerUrl(txHash)}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
              >
                <span>View transaction on Basescan</span>
                <ExternalLink size={13} />
              </a>
              <span className="text-[10px] text-gray-500 font-mono">
                Attributed via ERC-8021 & canonical 200ms block
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="text-xs text-red-400 font-mono text-center p-2 bg-red-950/40 border border-red-900/50 rounded">
              {errorMessage}
            </div>
          )}

          <button 
            onClick={() => setScreen('title')}
            className="w-full py-2 text-gray-500 hover:text-gray-300 font-mono text-xs uppercase mt-2 transition-colors"
          >
            Abort to Main Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
}


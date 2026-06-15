import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../lib/store';
import { motion } from 'motion/react';
import { Skull, ShieldAlert, Crosshair } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useAttributedTransaction } from '../../lib/transactions';

export function GameOverScreen() {
  const { setScreen, score, wave, kills, highestWave, updateHighestWave } = useGameStore();
  const { isConnected, address } = useAccount();
  const [txHash, setTxHash] = useState<string | null>(null);
  const { sendTransactionAsync } = useAttributedTransaction();

  useEffect(() => {
    updateHighestWave(wave);
  }, [wave, updateHighestWave]);

  const handleRecordScore = async () => {
    if (!isConnected || !address) {
      alert("Connect wallet to record score!");
      return;
    }
    
    // Create an on-chain record for the score via a call to Multicall3.getBlockNumber() (0x42c4c0d0)
    // We append the score data so it becomes arbitrary trailing data that EVM ignores
    const scoreData = `SCORE:${score}:WAVE:${wave}:KILLS:${kills}`;
    const scoreHex = Array.from(new TextEncoder().encode(scoreData))
      .map(b => b.toString(16).padStart(2, '0')).join('');
      
    // The attribution is automatically appended by useAttributedTransaction
    try {
      const hash = await sendTransactionAsync({
          to: '0xcA11bde05977b3631167028862bE2a173976CA11', // Multicall3
          value: 0n,
          data: `0x42c4c0d0${scoreHex}` as `0x${string}`,
      });
      setTxHash(hash);
      console.log("Recorded score with tx:", hash);
    } catch (err) {
      console.error("Failed to record score:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative bg-[radial-gradient(circle_at_center,_#2e1a1a_0%,_#0b0505_100%)] overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ff0055 1px, transparent 1px), linear-gradient(90deg, #ff0055 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="z-10 flex flex-col items-center p-8 bg-[#0a0a1a]/80 border border-red-500/30 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.15)] min-w-[320px] md:min-w-[400px]"
      >
        <Skull className="text-red-500 w-16 h-16 mb-4 animate-pulse" />
        <h2 className="text-4xl font-black text-red-500 mb-2 tracking-tighter">MISSION FAILED</h2>
        <div className="text-gray-400 font-mono text-sm mb-6 uppercase tracking-widest text-center">
          Hunter Unit Terminated
        </div>

        <div className="w-full space-y-3 mb-8">
          <div className="flex justify-between items-center bg-red-950/30 p-3 border border-red-900/50">
            <span className="text-gray-400 font-mono text-sm">FINAL SCORE</span>
            <span className="text-2xl font-bold text-white font-mono">{score}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900/50 p-3">
            <span className="text-gray-400 font-mono text-sm">WAVES SURVIVED</span>
            <span className="text-lg text-cyan-400 font-mono">{wave - 1}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900/50 p-3">
            <span className="text-gray-400 font-mono text-sm">BOTS SCRAPPED</span>
            <span className="text-lg text-fuchsia-400 font-mono">{kills}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => setScreen('playing')}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-400 text-black font-black text-sm uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Crosshair size={20} />
            DEPLOY AGAIN
          </button>
          
          <button 
            onClick={handleRecordScore}
            disabled={!!txHash}
            className={`w-full py-3 border font-mono text-xs tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-all ${
              txHash 
              ? "bg-green-500/10 border-green-500/30 text-green-400 cursor-default" 
              : "bg-[#0a0a1a] border-fuchsia-500/30 hover:border-fuchsia-400 text-fuchsia-400 shadow-[0_0_15px_rgba(255,0,255,0.1)] active:scale-95"
            }`}
          >
            <ShieldAlert size={16} />
            {txHash ? "RECORD SECURED ON-CHAIN" : "RECORD THIS HUNT ON-CHAIN"}
          </button>

          <button 
            onClick={() => setScreen('title')}
            className="w-full py-2 text-gray-500 hover:text-gray-300 font-mono text-xs uppercase mt-2"
          >
            Abort to Main Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
}

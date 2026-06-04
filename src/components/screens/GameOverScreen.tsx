import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../lib/store';
import { motion } from 'motion/react';
import { Skull, ShieldAlert, Crosshair } from 'lucide-react';
import { useAccount, useSignMessage } from 'wagmi';

export function GameOverScreen() {
  const { setScreen, score, wave, kills, highestWave, updateHighestWave } = useGameStore();
  const { isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    updateHighestWave(wave);
  }, [wave, updateHighestWave]);

  const handleRecordScore = () => {
    if (!isConnected) {
      alert("Connect wallet to record score!");
      return;
    }
    
    // SIWE-like score signature
    const message = `BOT HUNTER
Recording Hunt Results...
Score: ${score}
Wave: ${wave}
Kills: ${kills}
Highest Wave: ${Math.max(highestWave, wave)}
Nonce: ${Math.floor(Math.random() * 1000000)}
Verify Agent Action (ERC-8004 compatible)`;
    
    signMessage({ account: undefined as any, message }, {
      onSuccess: (sig) => {
        setSignature(sig);
        console.log("Recorded score with signature:", sig);
      }
    });
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
            disabled={!!signature}
            className={`w-full py-3 border font-mono text-xs tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-all ${
              signature 
              ? "bg-green-500/10 border-green-500/30 text-green-400 cursor-default" 
              : "bg-[#0a0a1a] border-fuchsia-500/30 hover:border-fuchsia-400 text-fuchsia-400 shadow-[0_0_15px_rgba(255,0,255,0.1)] active:scale-95"
            }`}
          >
            <ShieldAlert size={16} />
            {signature ? "RECORD SECURED ON-CHAIN" : "RECORD THIS HUNT ON-CHAIN"}
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

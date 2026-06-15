import React from 'react';
import { useGameStore } from '../../lib/store';
import { motion } from 'motion/react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { parseEther } from 'viem';
import { Target, Skull, Zap } from 'lucide-react';
import { getBuilderCode } from '../../lib/builder-code';
import { useAttributedTransaction } from '../../lib/transactions';

export function TitleScreen() {
  const { setScreen } = useGameStore();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();
  const { sendTransaction } = useAttributedTransaction();

  const handleGM = () => {
    if (!isConnected) {
      alert("Connect wallet first to say GM on-chain!");
      return;
    }
    // Simple 0 value TX to a self address or designated address
    // The attribution is automatically appended by useAttributedTransaction
    // Multicall3 getBlockNumber() selector + "gm" string
    const calldata = '0x42c4c0d0676d'; 
    sendTransaction({
      to: '0xcA11bde05977b3631167028862bE2a173976CA11', // Multicall3
      value: parseEther('0'),
      data: calldata as `0x${string}`
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative bg-[radial-gradient(circle_at_center,_#1a1a2e_0%,_#05050b_100%)] overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
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
        className="mt-16 flex flex-col gap-4 z-10 w-64 md:w-80"
      >
        <button 
          onClick={() => setScreen('playing')}
          className="relative group overflow-hidden w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-400 text-black font-black text-lg uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <span className="relative">START HUNT</span>
        </button>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2"></div>

        {!isConnected ? (
          <button 
            onClick={() => connect({ connector: connectors[0] })}
            className="w-full py-3 bg-[#0a0a1a] border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 font-mono text-xs uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-center text-gray-500 font-mono">
              {address?.slice(0,6)}...{address?.slice(-4)}
            </div>
            <button 
              onClick={handleGM}
              className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 text-black font-black text-xs uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              Say GM On-Chain
            </button>
            <button 
              onClick={() => disconnect()}
              className="px-6 py-2 text-gray-600 hover:text-gray-400 font-mono text-xs uppercase"
            >
              Disconnect
            </button>
          </div>
        )}
      </motion.div>

      <div className="absolute bottom-4 left-4 text-xs text-gray-600 font-mono font-bold flex flex-col gap-1">
        <div className="flex gap-2">
          <span>BASE MAINNET</span>
          <span>|</span>
          <span>BUILDER: {getBuilderCode()}</span>
        </div>
        <div className="flex gap-2 text-cyan-500/70 items-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <span>BASE MCP INTEGRATION ACTIVE (mcp.base.org)</span>
        </div>
      </div>
    </div>
  );
}

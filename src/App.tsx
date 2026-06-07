import React from 'react';
import { useGameStore } from './lib/store';
import { TitleScreen } from './components/screens/TitleScreen';
import { GameScreen } from './components/screens/GameScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { useAccount, useSendTransaction } from 'wagmi';
import { Sun } from 'lucide-react';
import { parseEther } from 'viem';

export default function App() {
  const { screen } = useGameStore();
  const { isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();

  const sendGMTransaction = () => {
    sendTransaction({
      to: '0xcD0dd3716C5561De47a24949335dF8a8CD8F71a3',
      value: parseEther('0'),
      data: '0x676d'
    });
  };

  return (
    <div className="flex flex-col w-full h-screen bg-[#05050b] text-[#e0e0ff] overflow-hidden font-sans selection:bg-cyan-500 selection:text-black relative border-4 border-[#1a1a2e]">
      <div className="absolute inset-0 pointer-events-none z-50 opacity-10" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)' }}></div>
      {screen === 'title' && <TitleScreen />}
      {screen === 'playing' && <GameScreen />}
      {screen === 'gameover' && <GameOverScreen />}

      {isConnected && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={sendGMTransaction}
            className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center gap-2 font-['Cinzel'] text-xs font-bold"
          >
            <Sun size={16} />
            Say GM
          </button>
        </div>
      )}
    </div>
  );
}

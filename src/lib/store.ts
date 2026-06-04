import { create } from 'zustand';

type GameScreen = 'title' | 'playing' | 'gameover' | 'leaderboard';

interface GameState {
  screen: GameScreen;
  setScreen: (screen: GameScreen) => void;
  score: number;
  setScore: (score: number) => void;
  wave: number;
  setWave: (wave: number) => void;
  kills: number;
  setKills: (kills: number) => void;
  highestWave: number;
  updateHighestWave: (wave: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'title',
  setScreen: (screen) => set({ screen }),
  score: 0,
  setScore: (score) => set({ score }),
  wave: 1,
  setWave: (wave) => set({ wave }),
  kills: 0,
  setKills: (kills) => set({ kills }),
  highestWave: 1,
  updateHighestWave: (wave) => set((state) => ({ highestWave: Math.max(state.highestWave, wave) })),
  resetGame: () => set({ score: 0, wave: 1, kills: 0 }),
}));

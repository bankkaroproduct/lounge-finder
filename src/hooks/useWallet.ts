import { useCallback, useEffect, useState } from 'react';

// The user's saved credit cards, persisted locally so they only add them once.
// We store card NAMES (canonical, from our dataset) — that's all the search needs.
const STORAGE_KEY = 'lounge-finder.wallet.v1';

const readStored = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

export const useWallet = () => {
  const [cards, setCards] = useState<string[]>(readStored);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      /* storage unavailable (private mode / quota) — wallet just won't persist */
    }
  }, [cards]);

  // Replace the whole wallet (used by the multi-select picker's "Save").
  const setWallet = useCallback((names: string[]) => {
    setCards([...new Set(names)]);
  }, []);

  const addCards = useCallback((names: string[]) => {
    setCards(prev => [...new Set([...prev, ...names])]);
  }, []);

  const removeCard = useCallback((name: string) => {
    setCards(prev => prev.filter(c => c !== name));
  }, []);

  const clearWallet = useCallback(() => setCards([]), []);

  return { cards, setWallet, addCards, removeCard, clearWallet };
};

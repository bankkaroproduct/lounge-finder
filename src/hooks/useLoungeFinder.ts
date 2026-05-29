
import { useState, useEffect } from 'react';
import { Lounge, CreditCard, Network } from '@/types/lounge';
import { fetchLoungeData } from '@/services/loungeService';
import { searchLounges, getEligibleCards, searchLoungesForWallet } from '@/utils/loungeSearch';

export const useLoungeFinder = () => {
  const [lounges, setLounges] = useState<Lounge[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchLoungeData();
      
      setLounges(data.lounges);
      setCards(data.cards);
      setCities(data.cities);
      setNetworks(data.networks);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchLounges = (cardName?: string, city?: string, network?: string) => {
    return searchLounges(lounges, cardName, city, network);
  };

  const handleGetEligibleCards = (city?: string, network?: string) => {
    return getEligibleCards(lounges, cards, city, network);
  };

  const handleSearchWallet = (walletCards: string[], city?: string, network?: string) => {
    return searchLoungesForWallet(lounges, walletCards, city, network);
  };

  return {
    lounges,
    cards,
    networks,
    cities,
    loading,
    error,
    searchLounges: handleSearchLounges,
    searchWallet: handleSearchWallet,
    getEligibleCards: handleGetEligibleCards,
    refetch: fetchData
  };
};

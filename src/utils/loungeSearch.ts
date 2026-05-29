
import { Lounge, CreditCard } from '@/types/lounge';

export const searchLounges = (
  lounges: Lounge[],
  cardName?: string,
  city?: string,
  network?: string
): Lounge[] => {
  let results = lounges;

  console.log('Searching with:', { cardName, city, network });
  console.log('Total lounges available:', lounges.length);
  
  // Debug: Log all unique card names in the system
  if (cardName) {
    const allCardNames = new Set<string>();
    lounges.forEach(lounge => {
      lounge.eligibleCards.forEach(card => allCardNames.add(card));
    });
    console.log('All unique card names in system:', Array.from(allCardNames));
    console.log('Looking for card:', cardName);
    
    // Check if the card exists in our card-lounge relationships
    const cardExists = Array.from(allCardNames).some(card => 
      card.toLowerCase().includes(cardName.toLowerCase()) || 
      cardName.toLowerCase().includes(card.toLowerCase())
    );
    console.log('Card exists in relationships:', cardExists);
    
    // If card doesn't exist, provide helpful suggestions
    if (!cardExists) {
      const suggestions = Array.from(allCardNames).filter(card => 
        card.toLowerCase().includes('hdfc') || 
        card.toLowerCase().includes('icici') ||
        card.toLowerCase().includes('infini') ||
        card.toLowerCase().includes('emerald')
      );
      console.log('Similar cards found:', suggestions);
    }
  }

  if (cardName || city || network) {
    results = lounges.filter(lounge => {
      let matchesCard = true;
      let matchesCity = true;
      let matchesNetwork = true;

      // Card filter - improved matching logic with better debugging
      if (cardName) {
        matchesCard = lounge.eligibleCards.some(card => {
          const cardLower = card.toLowerCase();
          const searchLower = cardName.toLowerCase();
          
          // Try exact match first
          if (cardLower === searchLower) {
            console.log(`Exact match found: "${card}" for search "${cardName}"`);
            return true;
          }
          
          // Try partial matches
          if (cardLower.includes(searchLower) || searchLower.includes(cardLower)) {
            console.log(`Partial match found: "${card}" for search "${cardName}"`);
            return true;
          }
          
          // Try matching individual words
          const cardWords = cardLower.split(' ');
          const searchWords = searchLower.split(' ');
          
          // Check if most significant words match (excluding common words)
          const significantSearchWords = searchWords.filter(word => 
            !['credit', 'card', 'bank'].includes(word) && word.length > 2
          );
          
          // If we have significant search words, check if ALL of them are found in the card name
          if (significantSearchWords.length > 0) {
            const allWordsFound = significantSearchWords.every(searchWord => 
              cardWords.some(cardWord => cardWord.includes(searchWord) || searchWord.includes(cardWord))
            );
            
            if (allWordsFound) {
              console.log(`Word match found: "${card}" for search "${cardName}" (all words: ${significantSearchWords.join(', ')})`);
              return true;
            }
          }
          
          return false;
        });
        
        // If no exact match found, try fuzzy matching for similar cards
        if (!matchesCard) {
          console.log(`No exact card match found for "${cardName}" in lounge "${lounge.name}". Available cards:`, lounge.eligibleCards);
          
          // Try fuzzy matching for similar cards (e.g., "HDFC Infinia" might match "HDFC Diners Club")
          const fuzzyMatch = lounge.eligibleCards.some(card => {
            const cardLower = card.toLowerCase();
            const searchLower = cardName.toLowerCase();
            
            // Check if both cards are from the same bank
            const searchBank = searchLower.includes('hdfc') ? 'hdfc' : 
                             searchLower.includes('icici') ? 'icici' : 
                             searchLower.includes('axis') ? 'axis' : '';
            
            const cardBank = cardLower.includes('hdfc') ? 'hdfc' : 
                           cardLower.includes('icici') ? 'icici' : 
                           cardLower.includes('axis') ? 'axis' : '';
            
            // If same bank and premium card types, consider it a match
            if (searchBank && cardBank === searchBank) {
              const isPremiumSearch = searchLower.includes('infini') || searchLower.includes('emerald') || searchLower.includes('platinum');
              const isPremiumCard = cardLower.includes('diners') || cardLower.includes('platinum') || cardLower.includes('magnus');
              
              if (isPremiumSearch && isPremiumCard) {
                console.log(`Fuzzy match found: "${card}" for premium search "${cardName}"`);
                return true;
              }
            }
            
            return false;
          });
          
          if (fuzzyMatch) {
            matchesCard = true;
          }
        }
      }

      // City filter
      if (city) {
        matchesCity = lounge.city.toLowerCase().includes(city.toLowerCase()) ||
                    lounge.airport.toLowerCase().includes(city.toLowerCase()) ||
                    lounge.state.toLowerCase().includes(city.toLowerCase());
      }

      // Network filter - only apply if network is specified
      if (network) {
        matchesNetwork = lounge.networks.some(loungeNetwork => 
          loungeNetwork.toLowerCase().includes(network.toLowerCase())
        );
      } else {
        // If no network specified, don't filter by network
        matchesNetwork = true;
      }

      const matches = matchesCard && matchesCity && matchesNetwork;
      if (cardName && matches) {
        console.log(`Lounge "${lounge.name}" matches card "${cardName}". Eligible cards:`, lounge.eligibleCards);
      }

      return matches;
    });

    console.log('Search results count:', results.length);
    if (results.length > 0) {
      console.log('First result:', results[0].name, 'Eligible cards:', results[0].eligibleCards);
    }
  }

  return results;
};

/**
 * Wallet search: lounges that ANY of the user's saved cards can access.
 * Wallet cards are exact names chosen from our own dataset, so we match by
 * exact (case-insensitive) membership — no fuzzy matching needed.
 */
export const searchLoungesForWallet = (
  lounges: Lounge[],
  walletCards: string[],
  city?: string,
  network?: string
): Lounge[] => {
  const wallet = new Set(walletCards.map(c => c.toLowerCase()));
  if (wallet.size === 0) return [];

  return lounges.filter(lounge => {
    const cityOk =
      !city ||
      lounge.city.toLowerCase().includes(city.toLowerCase()) ||
      lounge.airport.toLowerCase().includes(city.toLowerCase()) ||
      lounge.state.toLowerCase().includes(city.toLowerCase());
    if (!cityOk) return false;

    const networkOk =
      !network ||
      lounge.networks.some(n => n.toLowerCase().includes(network.toLowerCase()));
    if (!networkOk) return false;

    return lounge.eligibleCards.some(card => wallet.has(card.toLowerCase()));
  });
};

/** Which of the user's wallet cards grant access to a given lounge. */
export const matchedWalletCards = (lounge: Lounge, walletCards: string[]): string[] => {
  const wallet = new Set(walletCards.map(c => c.toLowerCase()));
  return lounge.eligibleCards.filter(card => wallet.has(card.toLowerCase()));
};

export const getEligibleCards = (
  lounges: Lounge[],
  cards: CreditCard[],
  city?: string,
  network?: string
): string[] => {
  // Hardcoded fallback cards as requested by user
  const fallbackCardIds = [54, 76, 19, 83, 36, 18, 53, 49, 51];
  const fallbackCardNames = cards
    .filter(card => fallbackCardIds.includes(card.id))
    .map(card => card.name);
  
  // If no filters provided, return all unique eligible cards from all lounges
  if (!city && !network) {
    const allEligibleCardNames = new Set<string>();
    lounges.forEach(lounge => {
      lounge.eligibleCards.forEach(card => allEligibleCardNames.add(card));
    });
    
    const allCards = Array.from(allEligibleCardNames);
    // If no cards found, return hardcoded fallback
    return allCards.length > 0 ? allCards : fallbackCardNames;
  }
  
  let filteredLounges = lounges;

  if (city) {
    filteredLounges = filteredLounges.filter(lounge => 
      lounge.city.toLowerCase().includes(city.toLowerCase()) ||
      lounge.airport.toLowerCase().includes(city.toLowerCase()) ||
      lounge.state.toLowerCase().includes(city.toLowerCase())
    );
  }

  if (network) {
    filteredLounges = filteredLounges.filter(lounge =>
      lounge.networks.some(loungeNetwork => 
        loungeNetwork.toLowerCase().includes(network.toLowerCase())
      )
    );
  }

  const eligibleCardNames = new Set<string>();
  filteredLounges.forEach(lounge => {
    lounge.eligibleCards.forEach(card => eligibleCardNames.add(card));
  });

  const filteredCards = Array.from(eligibleCardNames);
  // If no filtered cards found, return hardcoded fallback
  return filteredCards.length > 0 ? filteredCards : fallbackCardNames;
};

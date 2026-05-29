import { sampleLounges, sampleCards } from '@/data/sampleData';
import { loungeImages } from '@/data/loungeImages';
import { Lounge, CreditCard, Network } from '@/types/lounge';
import loungeDefaultImage from '@/assets/lounge-default.jpg';

export interface LoungeFetchResult {
  lounges: Lounge[];
  cards: CreditCard[];
  networks: Network[];
  cities: string[];
}

// Derive card networks from a card name. Card records have no explicit
// network field, so we infer it from keywords in the name.
const detectNetworks = (cardName: string): string[] => {
  const n = cardName.toLowerCase();
  const found: string[] = [];
  if (n.includes('rupay')) found.push('RuPay');
  if (n.includes('diners')) found.push('Diners Club');
  if (n.includes('mastercard')) found.push('Mastercard');
  if (n.includes('american express') || n.includes('amex')) found.push('American Express');
  if (n.includes('visa')) found.push('Visa');
  return found;
};

export const fetchLoungeData = async (): Promise<LoungeFetchResult> => {
  console.log('Starting local data fetch...');

  try {
    // Transform local lounges data
    const transformedLounges: Lounge[] = sampleLounges.map((lounge: any) => {
      // Networks this lounge accepts, derived from its eligible cards.
      const networks: string[] = [
        ...new Set(
          (lounge.eligibleCards ?? []).flatMap((card: string) => detectNetworks(card))
        ),
      ];

      // Photo URLs come from the auto-generated, gap-safe manifest
      // (see src/data/loungeImages.ts). First entry is the cover/listing
      // photo. Lounges with no photos fall back to the bundled default.
      const allImages = loungeImages[lounge.id] ?? [];
      const coverImage = allImages[0] ?? loungeDefaultImage;

      return {
        id: lounge.id,
        name: lounge.name || 'Unknown Lounge',
        airport: lounge.airport || 'Unknown Airport',
        city: lounge.city || 'Unknown City',
        state: lounge.state || 'Unknown State',
        terminal: lounge.terminal || '',
        location: lounge.location || 'Location not specified',
        hours: lounge.hours || '24 hours',
        amenities: lounge.amenities || ['Wi-Fi', 'Food & Beverages', 'Comfortable Seating'],
        guestPolicy: lounge.guestPolicy || 'Check with lounge for guest policy',
        paidAccess: lounge.paidAccess,
        rating: lounge.rating != null ? String(lounge.rating) : '',
        reviews: lounge.reviews != null ? String(lounge.reviews) : '',
        image: coverImage,
        allImages,
        eligibleCards: [...new Set(lounge.eligibleCards)], // Deduplicate
        networks,
        mapLink: lounge.mapLink,
        contactNo: lounge.contactNo,
        website: lounge.website,
        google_rating: lounge.rating,
        google_reviews: lounge.reviews,
        google_address: lounge.googleAddress,
        map_link_new: lounge.mapLink,
        email: lounge.email,
      };
    });

    // Transform cards data
    const transformedCards: CreditCard[] = sampleCards.map((card: any) => ({
      id: card.id,
      name: card.name || 'Unknown Card',
      network: card.bank,
      bank: card.bank || 'Other',
    }));

    // Extract unique cities from lounges
    const uniqueCities = [...new Set(transformedLounges.map(lounge => lounge.city).filter(Boolean))].sort();

    // Aggregate the networks actually present across all lounges.
    const networkSet = new Set<string>();
    transformedLounges.forEach(lounge => {
      lounge.networks.forEach(network => networkSet.add(network));
    });
    // Visa isn't named in any card in the dataset; surface it anyway so the
    // network list is complete (it will simply return no matches).
    networkSet.add('Visa');

    const uniqueNetworks: Network[] = Array.from(networkSet).map(name => ({
      name,
      cardCount: transformedCards.filter(c => detectNetworks(c.name).includes(name)).length
    })).sort((a, b) => a.name.localeCompare(b.name));

    console.log('Final transformed data:');
    console.log('- Lounges:', transformedLounges.length);
    console.log('- Cards:', transformedCards.length);
    console.log('- Cities:', uniqueCities.length);
    console.log('- Networks:', uniqueNetworks.length);

    return {
      lounges: transformedLounges,
      cards: transformedCards,
      networks: uniqueNetworks,
      cities: uniqueCities
    };
  } catch (error) {
    console.error('Error loading local data:', error);
    throw error;
  }
};

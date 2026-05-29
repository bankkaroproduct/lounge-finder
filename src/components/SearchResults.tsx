import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Clock, CreditCard, Plane, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoungePage from './LoungePage';
import { Lounge } from '@/types/lounge';
import { matchedWalletCards } from '@/utils/loungeSearch';
import loungeDefaultImage from '@/assets/lounge-default.jpg';

interface SearchResultsProps {
  results: Lounge[];
  searchType: 'card' | 'city' | 'network' | 'multi' | 'wallet';
  searchQuery: string;
  selectedCard?: string;
  walletCards?: string[];
  selectedLocation?: string;
  selectedNetwork?: string;
  eligibleCards?: string[];
  onBack: () => void;
}

const shortCardName = (name: string) => name.replace(/\s+Credit Card$/i, '');

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  searchType,
  searchQuery,
  selectedCard,
  walletCards = [],
  selectedLocation,
  selectedNetwork,
  eligibleCards = [],
  onBack,
}) => {
  const [selectedLounge, setSelectedLounge] = useState<Lounge | null>(null);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [results]);

  if (selectedLounge) {
    return (
      <LoungePage
        lounge={selectedLounge}
        onBack={() => setSelectedLounge(null)}
        searchedCard={selectedCard}
        walletCards={searchType === 'wallet' ? walletCards : undefined}
      />
    );
  }

  const count      = results.length;
  const loungeWord = count === 1 ? 'lounge' : 'lounges';

  const getResultsTitle = () => {
    if (count === 0) return 'No lounges found';
    if (searchType === 'wallet')  return `${count} ${loungeWord} your wallet unlocks${selectedLocation ? ` in ${selectedLocation}` : ''}`;
    if (searchType === 'card')    return `${count} ${loungeWord} accessible with ${selectedCard}`;
    if (searchType === 'city')    return `${count} ${loungeWord} in ${selectedLocation}`;
    if (searchType === 'network') return `${count} ${loungeWord} accepting ${selectedNetwork}`;
    return `${count} ${loungeWord} found`;
  };

  const getResultsSubtitle = () => {
    if (searchType === 'wallet')  return 'Each lounge below is unlocked by at least one card in your wallet.';
    if (searchType === 'card')    return 'Tap any lounge to see hours, location, and how to get in.';
    if (searchType === 'city')    return 'Tap a lounge to see which cards give you access.';
    if (searchType === 'network') return 'Tap a lounge for full access details.';
    return 'Tap any lounge for details.';
  };

  function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
    if (typeof rating !== 'number' || !Number.isFinite(rating)) {
      return <span className="text-sm text-gray-400">No rating</span>;
    }
    const filled = Math.max(0, Math.min(5, Math.floor(rating)));
    const half   = rating % 1 >= 0.5 && filled < 5;
    const empty  = Math.max(0, 5 - filled - (half ? 1 : 0));
    return (
      <span className="flex items-center gap-0.5 text-yellow-500 text-sm">
        <span className="text-gray-900 font-bold mr-1">{rating.toFixed(1)}</span>
        {Array.from({ length: filled }).map((_, i) => <span key={i}>★</span>)}
        {half && <span>☆</span>}
        {Array.from({ length: empty }).map((_, i)  => <span key={i + 10}>☆</span>)}
        {reviewCount > 0 && (
          <span className="text-gray-500 font-normal ml-1.5">({reviewCount})</span>
        )}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Back to search"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Active filters row */}
          <div className="flex items-center gap-2 flex-wrap">
            {searchType === 'wallet' && walletCards.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                <CreditCard className="w-3.5 h-3.5" />
                {walletCards.length} card{walletCards.length > 1 ? 's' : ''} in wallet
              </span>
            )}
            {selectedLocation && (
              <span className="inline-flex items-center gap-1.5 bg-lh-amber-pale text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
                <MapPin className="w-3.5 h-3.5" />
                {selectedLocation}
              </span>
            )}
            {selectedNetwork && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <Network className="w-3.5 h-3.5" />
                {selectedNetwork}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* ── Page title ──────────────────────────────────────── */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {getResultsTitle()}
          </h1>
          <p className="text-gray-500 mt-1.5">{getResultsSubtitle()}</p>
        </div>

        {/* ── Empty state ─────────────────────────────────────── */}
        {results.length === 0 ? (
          <div className="max-w-lg mx-auto text-center py-20 animate-fade-up">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Plane className="w-9 h-9 text-gray-400 rotate-45" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">No lounges found</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {searchType === 'card'
                ? "This card isn't mapped to any lounges yet. These cards will get you in:"
                : 'Nothing matched that combination. Try adjusting your search.'}
            </p>

            {eligibleCards.length > 0 && (
              <div className="text-left space-y-3 mb-8">
                <p className="text-sm font-semibold text-gray-700 text-center mb-4">
                  {searchType === 'city'
                    ? `Cards that unlock lounges at ${selectedLocation}:`
                    : 'Cards with lounge access:'}
                </p>
                {eligibleCards.slice(0, 5).map((cardName, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-6 bg-lh-navy-mid rounded flex items-center justify-center">
                        <CreditCard className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-medium text-gray-800 text-sm">{cardName}</span>
                    </div>
                    <Button
                      size="sm"
                      className="apply-now-btn bg-lh-success hover:bg-lh-success/90 text-white rounded-full px-4 border-0"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(cardName + ' credit card apply online')}`,
                          '_blank',
                        )
                      }
                    >
                      Apply
                    </Button>
                  </div>
                ))}
                {eligibleCards.length > 5 && (
                  <p className="text-sm text-gray-400 text-center">
                    +{eligibleCards.length - 5} more cards give access
                  </p>
                )}
              </div>
            )}

            <Button onClick={onBack} className="bg-lh-navy-mid hover:bg-lh-navy-mid/90 text-white border-0">
              Try another search
            </Button>
          </div>
        ) : (
          /* ── Results grid ──────────────────────────────────── */
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
          >
            {results.map((lounge, index) => {
              const ownedCards = searchType === 'wallet'
                ? matchedWalletCards(lounge, walletCards)
                : [];

              return (
                <article
                  key={lounge.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${lounge.name}, ${lounge.city}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200 cursor-pointer press-feedback motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  onClick={() => setSelectedLounge(lounge)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedLounge(lounge);
                    }
                  }}
                  style={{ animationDelay: `${Math.min(index, 6) * 50}ms`, animation: 'fade-in 0.4s ease-out both' }}
                >
                  {/* Card image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={lounge.image}
                      alt={lounge.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = loungeDefaultImage; }}
                    />

                    {/* Wallet match pill — visible at a glance */}
                    {searchType === 'wallet' && ownedCards.length > 0 && (
                      <div className="absolute bottom-3 left-3 max-w-[85%]">
                        <span className="inline-flex items-center gap-1.5 bg-lh-navy-mid/90 backdrop-blur-sm text-lh-amber-light text-xs font-semibold px-2.5 py-1.5 rounded-full truncate">
                          <CreditCard className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {shortCardName(ownedCards[0])}
                            {ownedCards.length > 1 && ` +${ownedCards.length - 1} more`}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Rating overlay */}
                    {lounge.google_rating && Number.isFinite(lounge.google_rating) && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 text-sm font-bold text-gray-900">
                        ★ {lounge.google_rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="text-[17px] font-bold text-gray-900 mb-1 leading-snug">
                      {lounge.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {lounge.terminal && `${lounge.terminal} · `}{lounge.airport} · {lounge.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{lounge.hours}</span>
                    </div>

                    {/* Amenity badges */}
                    {lounge.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {lounge.amenities.slice(0, 3).map(amenity => (
                          <Badge key={amenity} variant="secondary" className="text-xs font-medium">
                            {amenity}
                          </Badge>
                        ))}
                        {lounge.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs font-medium">
                            +{lounge.amenities.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Network tags — for network/city searches */}
                    {(searchType === 'network' || searchType === 'city') && lounge.networks?.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {lounge.networks.slice(0, 3).map(network => (
                            <Badge key={network} variant="outline" className="text-xs">
                              {network}
                            </Badge>
                          ))}
                          {lounge.networks.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{lounge.networks.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* View details link */}
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary mt-1 group">
                      View details
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

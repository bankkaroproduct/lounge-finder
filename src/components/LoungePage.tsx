import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, Clock, Users, Wifi, Coffee,
  Car, Utensils, Bath, Baby, CreditCard, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Lounge } from '@/types/lounge';
import loungeDefaultImage from '@/assets/lounge-default.jpg';
import { matchedWalletCards } from '@/utils/loungeSearch';

interface LoungePageProps {
  lounge: Lounge;
  onBack: () => void;
  searchedCard?: string;
  walletCards?: string[];
}

/* ── Strip trailing "Credit Card" suffix for compact display */
const shortCardName = (name: string) => name.replace(/\s+credit card$/i, '').trim();

/* ── Amenity icon map ───────────────────────────────────── */
const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Free WiFi':          Wifi,
  'Food & Beverages':   Utensils,
  'Comfortable Seating': Users,
  'Shower Facilities':  Bath,
  'Kids Play Area':     Baby,
  'Business Center':    Coffee,
  'Parking':            Car,
};

/* ── Star rating ────────────────────────────────────────── */
function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  if (typeof rating !== 'number' || !Number.isFinite(rating)) {
    return <span className="text-sm text-gray-400">No rating yet</span>;
  }
  const filled = Math.max(0, Math.min(5, Math.floor(rating)));
  const half   = rating % 1 >= 0.5 && filled < 5;
  const empty  = Math.max(0, 5 - filled - (half ? 1 : 0));
  return (
    <span className="flex items-center gap-0.5 text-yellow-500 text-base">
      <span className="text-gray-900 font-bold mr-1">{rating.toFixed(1)}</span>
      {Array.from({ length: filled }).map((_, i) => <span key={i}>★</span>)}
      {half && <span>☆</span>}
      {Array.from({ length: empty }).map((_, i)  => <span key={i + 10}>☆</span>)}
      {reviews > 0 && (
        <span className="text-gray-500 font-normal ml-2 text-sm">({reviews} reviews)</span>
      )}
    </span>
  );
}

/* ── Contact icons (SVG) ────────────────────────────────── */
const EmailIcon = () => (
  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════ */

const LoungePage: React.FC<LoungePageProps> = ({ lounge, onBack, searchedCard, walletCards }) => {

  /* ── Carousel state ──────────────────────────────────── */
  const validImages =
    lounge.allImages && lounge.allImages.length > 0
      ? lounge.allImages
      : [loungeDefaultImage];

  const [currentIndex,    setCurrentIndex]    = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart,      setTouchStart]      = useState<number | null>(null);
  const [touchEnd,        setTouchEnd]        = useState<number | null>(null);

  useEffect(() => { setCurrentIndex(0); }, [lounge.id]);

  const transition = (fn: () => void) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    fn();
    setTimeout(() => setIsTransitioning(false), 280);
  };

  const next = () => transition(() => setCurrentIndex(p => (p + 1) % validImages.length));
  const prev = () => transition(() => setCurrentIndex(p => (p - 1 + validImages.length) % validImages.length));
  const goTo = (i: number) => { if (i !== currentIndex) transition(() => setCurrentIndex(i)); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (validImages.length <= 1) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'Home')       { e.preventDefault(); goTo(0); }
    if (e.key === 'End')        { e.preventDefault(); goTo(validImages.length - 1); }
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove  = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd   = () => {
    if (!touchStart || !touchEnd) return;
    const d = touchStart - touchEnd;
    if (d > 50)  next();
    if (d < -50) prev();
    setTouchStart(null);
    setTouchEnd(null);
  };

  /* ── Which cards to show in the sidebar ──────────────── */
  let cardsToShow = lounge.eligibleCards;
  if (searchedCard) {
    const exact = lounge.eligibleCards.find(c => c.toLowerCase() === searchedCard.toLowerCase());
    if (exact) cardsToShow = [exact];
  }

  /* ── Wallet cards that unlock this lounge ─────────────── */
  const walletMatches = walletCards && walletCards.length > 0
    ? matchedWalletCards(lounge, walletCards)
    : [];

  /* ──────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white">

      {/* ── Top bar ──────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to results
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-up">

        {/* ── Lounge title ─────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{lounge.name}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-500 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {lounge.terminal && `${lounge.terminal} · `}{lounge.airport} · {lounge.city}, {lounge.state}
            </span>
          </div>
          {lounge.google_rating && (
            <div className="mt-3">
              <StarRating rating={lounge.google_rating} reviews={lounge.google_reviews ?? 0} />
            </div>
          )}
        </div>

        {/* ── Carousel ─────────────────────────────────────── */}
        <div
          className="relative h-64 md:h-[26rem] bg-gray-100 rounded-2xl overflow-hidden mb-8 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          role="region"
          aria-roledescription="carousel"
          aria-label={`${lounge.name} photos`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={validImages[currentIndex]}
            alt={`${lounge.name} — photo ${currentIndex + 1} of ${validImages.length}`}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-280 ease-out ${
              isTransitioning ? 'scale-[1.03] opacity-80' : 'scale-100 opacity-100'
            }`}
            onError={e => { (e.target as HTMLImageElement).src = loungeDefaultImage; }}
          />

          {/* Counter */}
          {validImages.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {validImages.length}
            </div>
          )}

          {/* Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={prev}
                disabled={isTransitioning}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                disabled={isTransitioning}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {validImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  disabled={isTransitioning}
                  aria-label={`Go to photo ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    i === currentIndex
                      ? 'w-5 h-2 bg-white'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                  } disabled:cursor-not-allowed`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Two-column layout ───────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Main column (2/3) ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hours & Location */}
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <Clock className="w-4 h-4 text-primary" />
                  Hours &amp; Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Opening hours</p>
                  <p className="text-gray-600">{lounge.hours}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Location</p>
                  <p className="text-gray-600">{lounge.location}</p>
                  {(lounge.mapLink || lounge.map_link_new) && (
                    <a
                      href={lounge.mapLink || lounge.map_link_new}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-2 hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Find this lounge in the terminal →
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <Coffee className="w-4 h-4 text-primary" />
                  Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {lounge.amenities.map(amenity => {
                    const Icon = amenityIcons[amenity] || Coffee;
                    return (
                      <div key={amenity} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                        <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Guest Policy */}
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <Users className="w-4 h-4 text-primary" />
                  Guest Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Guest access</p>
                  <p className="text-gray-600">{lounge.guestPolicy}</p>
                </div>
                {lounge.paidAccess && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Paid access</p>
                      <p className="text-gray-600">{lounge.paidAccess}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            {(lounge.google_address || lounge.contactNo || lounge.email || lounge.map_link_new) && (
              <Card className="border border-gray-100 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <MapPin className="w-4 h-4 text-primary" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lounge.google_address && (
                    <div className="flex items-start gap-2.5 text-gray-700">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{lounge.google_address}</span>
                    </div>
                  )}
                  {lounge.contactNo && (
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <PhoneIcon />
                      <a
                        href={`tel:${lounge.contactNo.replace(/\s+/g, '')}`}
                        className="text-sm hover:underline"
                      >
                        {lounge.contactNo}
                      </a>
                    </div>
                  )}
                  {lounge.email && (
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <EmailIcon />
                      <a href={`mailto:${lounge.email}`} className="text-sm hover:underline">
                        {lounge.email}
                      </a>
                    </div>
                  )}
                  {lounge.map_link_new && (
                    <Button
                      className="w-full bg-lh-amber hover:bg-lh-amber/90 text-lh-navy-mid font-bold border-0 rounded-xl mt-2"
                      onClick={() => window.open(lounge.map_link_new, '_blank')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Sidebar (1/3) ────────────────────────────── */}
          <div className="space-y-5">

            {/* Wallet matches — shown only when arriving from a wallet search */}
            {walletMatches.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm font-bold text-emerald-800">
                    {walletMatches.length === 1 ? 'Your card gets you in' : 'Your cards get you in'}
                  </p>
                </div>
                <div className="space-y-2">
                  {walletMatches.map(card => (
                    <div key={card} className="flex items-center justify-between gap-3 bg-white rounded-xl px-3.5 py-2.5 border border-emerald-100 shadow-sm">
                      <span className="min-w-0 flex-1 text-sm font-semibold text-gray-800 leading-snug">
                        {shortCardName(card)}
                      </span>
                      <span className="flex-shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Access
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Access cards */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-lh-navy px-5 py-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-lh-amber-light" />
                  <h2 className="text-sm font-bold text-white">Access with these cards</h2>
                </div>
                <p className="text-white/50 text-xs mt-1">
                  {lounge.eligibleCards.length} card{lounge.eligibleCards.length !== 1 ? 's' : ''} grant access to this lounge
                </p>
              </div>

              {/* Card list — scrollable when many cards */}
              <div className={`divide-y divide-gray-50${cardsToShow.length > 8 ? ' max-h-[360px] overflow-y-auto' : ''}`}>
                {cardsToShow.map((card, i) => (
                  <div key={`${card}-${i}`} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <span
                      className="min-w-0 flex-1 text-sm font-medium text-gray-800 leading-snug"
                      title={card}
                    >
                      {shortCardName(card)}
                    </span>
                    <Button
                      size="sm"
                      className="apply-now-btn flex-shrink-0 bg-lh-success hover:bg-lh-success/90 text-white text-xs font-semibold rounded-full px-3 py-1 h-auto border-0"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(card + ' credit card apply online')}`,
                          '_blank',
                        )
                      }
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Networks */}
            {lounge.networks && lounge.networks.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Accepted networks</h3>
                <div className="flex flex-wrap gap-2">
                  {lounge.networks.map(n => (
                    <Badge key={n} variant="secondary" className="text-xs font-medium">
                      {n}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoungePage;

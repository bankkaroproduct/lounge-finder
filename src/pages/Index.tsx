import React, { useState } from 'react';
import {
  Search, CreditCard, MapPin, Plane, ArrowRight,
  Network as NetworkIcon, Plus, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchResults from '@/components/SearchResults';
import SearchableDropdown from '@/components/SearchableDropdown';
import WalletCardPicker from '@/components/WalletCardPicker';
import { useLoungeFinder } from '@/hooks/useLoungeFinder';
import { useWallet } from '@/hooks/useWallet';

// Strip the trailing "… Credit Card" so wallet chips stay compact.
const shortCardName = (name: string) => name.replace(/\s+credit card$/i, '');

const Index = () => {
  const {
    cards, lounges, networks, cities,
    loading, error,
    searchLounges, searchWallet, getEligibleCards,
  } = useLoungeFinder();
  const { cards: walletCards, setWallet, removeCard } = useWallet();

  const [selectedCity,    setSelectedCity]    = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [searchResults,   setSearchResults]   = useState<any[]>([]);
  const [hasSearched,     setHasSearched]     = useState(false);
  const [searchType,      setSearchType]      = useState<'wallet' | 'city' | 'network' | 'multi'>('multi');

  const hasWallet = walletCards.length > 0;
  const canSearch = hasWallet || !!selectedCity || !!selectedNetwork;

  const handleSearch = () => {
    if (!canSearch) return;
    setHasSearched(true);
    if (hasWallet) {
      setSearchResults(searchWallet(walletCards, selectedCity, selectedNetwork));
      setSearchType('wallet');
    } else {
      setSearchResults(searchLounges('', selectedCity, selectedNetwork));
      setSearchType(selectedCity ? 'city' : 'network');
    }
  };

  const handleReset = () => {
    setHasSearched(false);
    setSelectedCity('');
    setSelectedNetwork('');
    setSearchResults([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cityOptions    = cities.map(c  => ({ value: c,         label: c }));
  const networkOptions = networks.map(n => ({ value: n.name, label: n.name }));

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-lh-navy flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-10 h-10 text-lh-amber animate-bounce mx-auto mb-4" />
          <p className="text-white/70 font-medium">Loading lounge data…</p>
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="min-h-screen bg-lh-navy flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/80 text-lg">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-lh-amber text-lh-navy-mid font-bold hover:bg-lh-amber/90">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  /* ── Results ─────────────────────────────────────────────── */
  if (hasSearched) {
    let eligibleCardsForResults: string[] = [];
    if (!hasWallet && (selectedCity || selectedNetwork)) {
      eligibleCardsForResults = getEligibleCards(selectedCity, selectedNetwork);
    }
    return (
      <SearchResults
        results={searchResults}
        searchType={searchType}
        searchQuery={selectedCity || selectedNetwork || ''}
        walletCards={walletCards}
        selectedLocation={selectedCity}
        selectedNetwork={selectedNetwork}
        eligibleCards={eligibleCardsForResults}
        onBack={handleReset}
      />
    );
  }

  /* ── Home ────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-lh-navy">

      {/* ── Nav bar ──────────────────────────────────────────── */}
      <nav className="relative z-10 container mx-auto px-5 sm:px-6 pt-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-lh-amber rounded-lg flex items-center justify-center flex-shrink-0">
            <Plane className="w-4 h-4 text-lh-navy-mid" />
          </div>
          <span className="text-white font-bold text-[17px] tracking-tight">LoungeHopper</span>
        </div>

        {/* Inline coverage stats — desktop only */}
        <div className="hidden sm:flex items-center gap-1.5 text-white/40 text-sm">
          <span className="text-white/75 font-semibold">{lounges.length}</span>
          <span>lounges</span>
          <span className="mx-2 opacity-30">·</span>
          <span className="text-white/75 font-semibold">{cities.length}+</span>
          <span>cities across India</span>
        </div>
      </nav>

      {/* ── Hero content ─────────────────────────────────────── */}
      <div className="container mx-auto px-5 sm:px-6 pt-14 pb-0">

        {/* Headline block */}
        <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-up">
          {/* Tag pill */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-lh-amber-light rounded-full px-4 py-1.5 mb-7 text-[13px] font-medium tracking-wide">
            <Plane className="w-3.5 h-3.5" />
            India's airport lounge access directory
          </div>

          {/* Display headline */}
          <h1 className="text-[clamp(2.6rem,7vw,4.25rem)] font-extrabold text-white leading-[1.0] tracking-[-0.03em] mb-5">
            Your wallet.
            <br />
            Every lounge.
            <br />
            <span className="text-lh-amber-light">Before you fly.</span>
          </h1>

          <p className="text-[17px] text-white/55 max-w-md mx-auto leading-relaxed">
            Save your cards once, then check any airport in a tap — we show exactly which lounges you can walk into.
          </p>
        </div>

        {/* ── Search card ──────────────────────────────────────── */}
        <div className="max-w-xl mx-auto animate-fade-up stagger-2">
          <div className="bg-white rounded-3xl shadow-[0_32px_80px_-8px_rgba(0,0,0,0.5)] p-6 sm:p-8">

            {/* Wallet section */}
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
                Your cards
              </p>

              {!hasWallet ? (
                <WalletCardPicker
                  allCards={cards}
                  selected={walletCards}
                  onConfirm={setWallet}
                  trigger={
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 py-[18px] border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-lh-navy-mid/40 hover:text-lh-navy-mid hover:bg-muted/60 transition-all font-medium text-[15px]"
                    >
                      <Plus className="w-4 h-4" />
                      Add your cards
                    </button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {walletCards.map(name => (
                      <span
                        key={name}
                        className="inline-flex items-center bg-secondary text-secondary-foreground border border-border rounded-full pl-3 pr-1.5 py-1.5 text-sm font-medium"
                      >
                        <span className="max-w-[180px] truncate" title={name}>
                          {shortCardName(name)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCard(name)}
                          aria-label={`Remove ${name}`}
                          className="ml-1.5 rounded-full p-0.5 hover:bg-border transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <WalletCardPicker
                    allCards={cards}
                    selected={walletCards}
                    onConfirm={setWallet}
                    trigger={
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add or edit cards
                      </button>
                    }
                  />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                  Flying from?
                </span>
              </div>
            </div>

            {/* City selector */}
            <div className="mb-3">
              <SearchableDropdown
                options={cityOptions}
                placeholder="Search city or airport"
                value={selectedCity}
                onChange={setSelectedCity}
                icon={<MapPin className="w-4 h-4" />}
                className="w-full"
              />
            </div>

            {/* Network filter — only when wallet is active */}
            {hasWallet && (
              <div className="relative z-30 mb-3 animate-fade-up">
                <SearchableDropdown
                  options={networkOptions}
                  placeholder="Filter by network (optional)"
                  value={selectedNetwork}
                  onChange={setSelectedNetwork}
                  icon={<NetworkIcon className="w-4 h-4" />}
                  className="w-full"
                />
              </div>
            )}

            {/* Primary CTA */}
            <Button
              onClick={handleSearch}
              disabled={!canSearch}
              className="w-full py-6 mt-3 text-[15px] font-bold bg-lh-amber hover:bg-lh-amber/90 text-lh-navy-mid rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group border-0"
              size="lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Find My Lounges
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Button>

            {/* Quick-add popular picks */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
                Quick add
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setWallet([...new Set([...walletCards, 'HDFC Bank Infinia Credit Card'])])}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-secondary hover:text-secondary-foreground transition-colors border border-gray-100"
                >
                  + HDFC Infinia
                </button>
                <button
                  onClick={() => setWallet([...new Set([...walletCards, 'Axis Bank Magnus Credit Card'])])}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-secondary hover:text-secondary-foreground transition-colors border border-gray-100"
                >
                  + Axis Magnus
                </button>
                <button
                  onClick={() => setSelectedCity('Mumbai')}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-lh-amber-pale hover:text-yellow-800 transition-colors border border-gray-100"
                >
                  ✈ Mumbai
                </button>
                <button
                  onClick={() => setSelectedCity('Delhi')}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-lh-amber-pale hover:text-yellow-800 transition-colors border border-gray-100"
                >
                  ✈ Delhi
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <div className="bg-white mt-16">
        <div className="container mx-auto px-5 sm:px-6 py-12">
          <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              <div className="px-4 text-center">
                <div className="text-[2rem] font-extrabold text-lh-navy-mid leading-none">{lounges.length}</div>
                <div className="text-sm text-muted-foreground mt-1.5">Lounges mapped</div>
              </div>
              <div className="px-4 text-center">
                <div className="text-[2rem] font-extrabold text-lh-navy-mid leading-none">{cards.length}</div>
                <div className="text-sm text-muted-foreground mt-1.5">Cards tracked</div>
              </div>
              <div className="px-4 text-center">
                <div className="text-[2rem] font-extrabold text-lh-navy-mid leading-none">{networks.length}</div>
                <div className="text-sm text-muted-foreground mt-1.5">Card networks</div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
              Access rules change often — always confirm with your bank before you travel.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Index;

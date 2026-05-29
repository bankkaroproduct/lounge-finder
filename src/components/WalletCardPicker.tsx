import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { CreditCard } from '@/types/lounge';

interface WalletCardPickerProps {
  allCards: CreditCard[];
  /** Currently saved card names. */
  selected: string[];
  /** Called with the full new selection when the user saves. */
  onConfirm: (names: string[]) => void;
  trigger: React.ReactNode;
}

// Banks shown first — the ones whose cards actually grant premium lounge access.
const BANK_ORDER = [
  'HDFC Bank',
  'Axis Bank',
  'ICICI Bank',
  'American Express',
  'IDFC First Bank',
  'State Bank of India',
];

const WalletCardPicker: React.FC<WalletCardPickerProps> = ({
  allCards,
  selected,
  onConfirm,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set(selected));

  // Reseed local selection from the saved wallet each time the dialog opens.
  useEffect(() => {
    if (open) {
      setPicked(new Set(selected));
      setQuery('');
    }
  }, [open, selected]);

  // Filter by query, then group by bank.
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? allCards.filter(c => c.name.toLowerCase().includes(q) || (c.bank ?? '').toLowerCase().includes(q))
      : allCards;

    const byBank = new Map<string, CreditCard[]>();
    filtered.forEach(card => {
      const bank = card.bank || 'Other';
      if (!byBank.has(bank)) byBank.set(bank, []);
      byBank.get(bank)!.push(card);
    });

    return [...byBank.entries()].sort((a, b) => {
      const ia = BANK_ORDER.indexOf(a[0]);
      const ib = BANK_ORDER.indexOf(b[0]);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a[0].localeCompare(b[0]);
    });
  }, [allCards, query]);

  const toggle = (name: string) => {
    setPicked(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleBank = (cards: CreditCard[], allOn: boolean) => {
    setPicked(prev => {
      const next = new Set(prev);
      cards.forEach(c => (allOn ? next.delete(c.name) : next.add(c.name)));
      return next;
    });
  };

  const handleSave = () => {
    onConfirm([...picked]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">Add your cards</DialogTitle>
          <DialogDescription>
            Tick every card you own — we'll remember them so you never re-type them. Most lounge
            access comes from just your premium cards.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by card or bank…"
              className="pl-9"
            />
          </div>
        </div>

        {/* Grouped checklist */}
        <ScrollArea className="h-[50vh] px-6">
          {grouped.length === 0 ? (
            <p className="py-10 text-center text-gray-500">No cards match “{query}”.</p>
          ) : (
            grouped.map(([bank, cards]) => {
              const allOn = cards.every(c => picked.has(c.name));
              return (
                <div key={bank} className="py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{bank}</h3>
                    <button
                      type="button"
                      onClick={() => toggleBank(cards, allOn)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      {allOn ? 'Clear' : 'Select all'}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {cards.map(card => (
                      <label
                        key={card.id}
                        className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={picked.has(card.name)}
                          onCheckedChange={() => toggle(card.name)}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-gray-800 leading-snug">{card.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 sm:justify-between items-center gap-3">
          <span className="text-sm text-gray-500">
            {picked.size} card{picked.size === 1 ? '' : 's'} selected
          </span>
          <div className="flex gap-2">
            {picked.size > 0 && (
              <Button variant="ghost" onClick={() => setPicked(new Set())} className="text-gray-600">
                <X className="w-4 h-4 mr-1" /> Clear all
              </Button>
            )}
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save {picked.size > 0 ? `(${picked.size})` : ''}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WalletCardPicker;

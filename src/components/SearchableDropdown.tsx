import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface SearchableDropdownProps {
  options: Option[];
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  icon?: React.ReactNode;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  placeholder,
  value,
  onChange,
  className = '',
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // `searchTerm` is local display/filter text only. The committed value is
  // owned by the parent via `value`/`onChange` and is set ONLY on selection.
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Keep display text in sync when the parent sets the value externally
  // (e.g. "Popular searches" chips).
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close on outside click and reconcile the display text back to the
  // committed value (so stray free text never lingers in the field).
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm(value || '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `#${CSS.escape(`${listboxId}-option-${highlightedIndex}`)}`
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, listboxId]);

  const openList = () => {
    if (!isOpen) setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
    setIsOpen(true);
    // If the field is cleared, clear the committed value too.
    if (e.target.value === '') onChange('');
  };

  const commitOption = (option: Option) => {
    setSearchTerm(option.label);
    onChange(option.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Clear the committed value and the display text, then refocus so the user
  // can immediately type a new query.
  const clearSelection = () => {
    setSearchTerm('');
    onChange('');
    setHighlightedIndex(-1);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) { openList(); break; }
        setHighlightedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) { openList(); break; }
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Home':
        if (isOpen && filteredOptions.length) { e.preventDefault(); setHighlightedIndex(0); }
        break;
      case 'End':
        if (isOpen && filteredOptions.length) { e.preventDefault(); setHighlightedIndex(filteredOptions.length - 1); }
        break;
      case 'Enter':
        if (isOpen && filteredOptions.length > 0) {
          e.preventDefault();
          const idx = highlightedIndex >= 0 ? highlightedIndex : 0;
          commitOption(filteredOptions[idx]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm(value || '');
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm(value || '');
        break;
    }
  };

  const activeDescId =
    isOpen && highlightedIndex >= 0
      ? `${listboxId}-option-${highlightedIndex}`
      : undefined;

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeDescId}
          autoComplete="off"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={openList}
          onKeyDown={handleKeyDown}
          className={`w-full pl-12 ${searchTerm ? 'pr-16' : 'pr-10'} py-5 text-base lg:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-colors duration-200 hover:border-gray-300 shadow-sm bg-white font-medium`}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex-shrink-0 pointer-events-none">
          {icon || <Search className="w-5 h-5" />}
        </div>
        {searchTerm && (
          <button
            type="button"
            aria-label="Clear selection"
            // onMouseDown so it fires before the input's blur/reconcile.
            onMouseDown={(e) => { e.preventDefault(); clearSelection(); }}
            className="absolute right-11 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <ChevronDown
          aria-hidden="true"
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 pointer-events-none ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 w-full mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                className={`flex items-center px-5 py-4 cursor-pointer border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl transition-colors duration-150 ${
                  index === highlightedIndex
                    ? 'bg-gradient-to-r from-blue-50 to-amber-50'
                    : 'hover:bg-gray-50'
                }`}
                // onMouseDown (not onClick) so selection fires before the
                // input's blur/outside-click reconciliation.
                onMouseDown={(e) => { e.preventDefault(); commitOption(option); }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.icon && (
                  <img src={option.icon} alt="" className="w-8 h-8 mr-4 rounded-lg shadow-sm" />
                )}
                <span className="text-gray-800 font-medium text-lg">{option.label}</span>
              </div>
            ))
          ) : (
            <div className="px-5 py-6 text-gray-500 text-center">
              <div className="flex flex-col items-center">
                <Search className="w-8 h-8 text-gray-300 mb-2" />
                <span className="text-lg">No results found</span>
                <span className="text-sm text-gray-400 mt-1">Try adjusting your search</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;


// components/AutocompleteInput.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { Input } from '../../ui/input';

interface AutocompleteInputProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  noOptionsText?: string;
  loading?: boolean;
  /** If true, suggestions dropdown is completely disabled (plain input) */
  disableSuggestions?: boolean;
  /** Optional className to style the wrapper */
  className?: string;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  noOptionsText = 'Provide exact barcode..',
  loading = false,
  disableSuggestions = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1); // for keyboard navigation
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /** Derived, memoized filtered options */
  const filteredOptions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [value, options]);

  /** Close when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Reset active index when list changes or closes */
  useEffect(() => {
    if (!isOpen) setActiveIndex(-1);
    else if (filteredOptions.length > 0) setActiveIndex(0);
    else setActiveIndex(-1);
  }, [isOpen, filteredOptions.length]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (disableSuggestions) return;

    // Basic keyboard controls for the dropdown
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        if (filteredOptions.length === 0) return;
        setActiveIndex((prev) => {
          const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
          // Scroll into view
          const item = listRef.current?.children.item(next) as HTMLElement | null;
          item?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        if (filteredOptions.length === 0) return;
        setActiveIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
          const item = listRef.current?.children.item(next) as HTMLElement | null;
          item?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        break;
      }
      case 'Enter': {
        if (isOpen && activeIndex >= 0 && activeIndex < filteredOptions.length) {
          e.preventDefault();
          handleSelect(filteredOptions[activeIndex]);
        }
        break;
      }
      case 'Escape': {
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
        }
        break;
      }
      default:
        break;
    }
  };

  const showDropdown = !disableSuggestions && isOpen;

  return (
    <div
      ref={wrapperRef}
      className={`relative flex-1 lg:max-w-sm ${className ?? ''}`}
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
    >
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 z-10"
        aria-hidden="true"
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!disableSuggestions) setIsOpen(true);
        }}
        onFocus={() => !disableSuggestions && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-20 h-10 bg-white border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
        aria-autocomplete={!disableSuggestions ? 'list' : 'none'}
        role="combobox"
      />

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Clear input"
            title="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!disableSuggestions && (
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        )}
      </div>

      {showDropdown && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
          style={{ maxHeight: '200px' }}
        >
          {loading ? (
            <div className="p-3 text-sm text-gray-500">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">{noOptionsText}</div>
          ) : (
            <ul
              ref={listRef}
              role="listbox"
              className="py-1 max-h-52 overflow-y-auto"
            >
              {filteredOptions.map((option, index) => {
                const isActive = index === activeIndex;
                return (
                  <li key={`${option}-${index}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseDown={(e) => e.preventDefault()} // keep input focus
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left px-3 py-2 text-sm cursor-pointer font-mono hover:bg-gray-100 ${
                        isActive ? 'bg-gray-100' : ''
                      }`}
                    >
                      {option}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;

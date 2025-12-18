// components/AutocompleteInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { Input } from '../../ui/input';

interface AutocompleteInputProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 lg:max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="pl-10 pr-20 h-10 bg-white border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-sm text-gray-500">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No results found</div>
          ) : (
            <ul className="py-1">
              {filteredOptions.map((option, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(option)}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer font-mono"
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
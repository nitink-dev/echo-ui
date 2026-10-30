
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../../ui/input';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  onKeyDown,
}) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`relative flex-1 lg:max-w-sm ${className ?? ''}`}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 z-10"
        aria-hidden="true"
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="pl-10 pr-20 h-10 bg-white border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
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
      </div>
    </div>
  );
};

export default AutocompleteInput;

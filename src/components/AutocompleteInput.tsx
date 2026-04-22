import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  optionType: 'prospect_name' | 'prospect_industry';
  label: string;
  placeholder: string;
  required?: boolean;
}

export default function AutocompleteInput({
  value,
  onChange,
  optionType,
  label,
  placeholder,
  required = false,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize options (free-text mode - no database fetch)
  useEffect(() => {
    if (!hasAttemptedFetch) {
      setOptions([]);
      setHasAttemptedFetch(true);
    }
  }, [hasAttemptedFetch, optionType]);

  // Handle input change
  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);

    if (inputValue.trim() === '') {
      setFilteredOptions([]);
      setIsOpen(false);
    } else {
      // Filter options based on input
      const filtered = options.filter((opt) =>
        opt.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      setIsOpen(filtered.length > 0);
    }
  };

  // Handle option click
  const handleSelectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setFilteredOptions([]);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-sm font-semibold text-slate-800 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (filteredOptions.length > 0 || value.trim() === '') {
              setIsOpen(true);
            }
          }}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
          placeholder={placeholder}
          autoComplete="off"
          required={required}
        />

        {options.length > 0 && (
          <ChevronDown
            size={20}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <li key={`${optionType}-${index}`}>
              <button
                type="button"
                onClick={() => handleSelectOption(option)}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors text-slate-700 border-b border-slate-100 last:border-b-0 focus:outline-none focus:bg-blue-100"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

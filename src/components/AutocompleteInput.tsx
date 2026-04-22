import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  optionType: 'prospect_name' | 'prospect_industry';
  label: string;
  placeholder: string;
  required?: boolean;
  theme?: 'light' | 'dark';
}

export default function AutocompleteInput({
  value,
  onChange,
  optionType,
  label,
  placeholder,
  required = false,
  theme = 'light',
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
      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
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
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 hover:border-slate-500'
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'
          }`}
          placeholder={placeholder}
          autoComplete="off"
          required={required}
        />

        {options.length > 0 && (
          <ChevronDown
            size={20}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none transition-transform ${
              theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
            } ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul className={`absolute z-10 w-full mt-1 border rounded-xl shadow-lg max-h-64 overflow-y-auto ${
          theme === 'dark'
            ? 'bg-slate-700 border-slate-600'
            : 'bg-white border-slate-300'
        }`}>
          {filteredOptions.map((option, index) => (
            <li key={`${optionType}-${index}`}>
              <button
                type="button"
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left px-4 py-2.5 transition-colors border-b last:border-b-0 focus:outline-none ${
                  theme === 'dark'
                    ? 'text-slate-100 hover:bg-slate-600 border-slate-600 focus:bg-slate-600'
                    : 'text-slate-700 hover:bg-blue-50 border-slate-100 focus:bg-blue-100'
                }`}
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

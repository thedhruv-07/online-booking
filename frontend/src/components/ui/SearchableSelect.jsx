import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * SearchableSelect component for large lists with filter capability
 */
const SearchableSelect = ({
  label,
  error,
  options = [],
  value,
  onChange,
  name,
  placeholder = 'Select...',
  className = '',
  wrapperClassName = '',
  required = false,
  searchPlaceholder = 'Search...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = useMemo(() => 
    options.find(opt => (opt.value || opt.id) === value),
    [options, value]
  );
  
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const search = searchTerm.toLowerCase().trim();
    return options.filter(option => {
      const labelText = (option.label || option.name || '').toLowerCase();
      const valueText = String(option.value || option.id || '').toLowerCase();
      return labelText.includes(search) || valueText.includes(search);
    });
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    const val = option.value || option.id;
    onChange({ target: { name, value: val } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={cn('relative w-full', wrapperClassName)} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-4 h-12 bg-slate-50 border rounded-xl transition-all duration-200 text-left',
          isOpen ? 'border-indigo-500 ring-4 ring-indigo-500/5' : 'border-slate-100 hover:border-slate-200',
          error ? 'border-rose-300 bg-rose-50/50' : '',
          className
        )}
      >
        <span className={cn('text-sm font-bold truncate', selectedOption ? 'text-slate-800' : 'text-slate-400')}>
          {selectedOption ? (selectedOption.label || selectedOption.name) : placeholder}
        </span>
        <ChevronDown size={18} className={cn('text-slate-400 transition-transform duration-200 shrink-0 ml-2', isOpen && 'rotate-180')} />
      </button>

      {/* Error Message */}
      {error && <p className="mt-1 ml-1 text-xs font-bold text-rose-500">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute z-[1000] mt-2 w-full min-w-[240px] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-slate-50 bg-white">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-md transition-colors"
                >
                  <X size={12} className="text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[280px] overflow-y-auto overscroll-contain">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const val = option.value || option.id;
                const key = option.id || `opt-${index}-${val}`;
                const isSelected = value === val;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors text-left border-b border-slate-50 last:border-0',
                      isSelected ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span className="truncate">{option.label || option.name}</span>
                    {isSelected && <Check size={16} className="shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-bold text-slate-400">No results found for "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

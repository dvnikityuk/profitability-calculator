import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { FilterType } from '../types';

interface FilterDropdownProps {
  label: string;
  type: FilterType;
  available: string[];
  selected: Set<string>;
  onSelect: (filter: Set<string>) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  type,
  available,
  selected,
  onSelect
}) => {
  const { openDropdown, setOpenDropdown } = useStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const count = selected.size;
  const isOpen = openDropdown === type;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setOpenDropdown]);

  const handleToggle = () => {
    setOpenDropdown(isOpen ? null : type);
  };

  const handleSelectAll = () => {
    onSelect(new Set(available));
  };

  const handleClear = () => {
    onSelect(new Set());
  };

  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      onSelect(new Set(available));
    } else {
      onSelect(new Set());
    }
  };

  const handleItemChange = (value: string, checked: boolean) => {
    const newSet = new Set(selected);
    if (checked) {
      newSet.add(value);
    } else {
      newSet.delete(value);
    }
    onSelect(newSet);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all select-none whitespace-nowrap"
        style={count > 0 ? {
          background: 'rgba(254,217,0,0.1)',
          border: '1.5px solid var(--brand-yellow)',
          color: 'var(--ui-900)',
          fontWeight: 600
        } : {
          background: '#fff',
          border: '1.5px solid var(--brand-gray-mid)',
          color: 'var(--ui-800)'
        }}
      >
        <span>{label}</span>
        {count > 0 && (
          <span 
            className="flex-shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
            style={{ 
              background: isOpen ? 'rgba(255,255,255,0.2)' : 'var(--brand-yellow)',
              color: isOpen ? '#fff' : 'var(--brand-black)'
            }}
          >
            {count}
          </span>
        )}
        <svg 
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 z-50 min-w-[280px] bg-white border border-[var(--brand-gray-mid)] rounded-xl shadow-2xl overflow-hidden drop-in"
          style={{ borderWidth: 1.5 }}
        >
          <div 
            className="flex items-center justify-between px-3 py-2"
            style={{ background: 'var(--ui-800)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
            <div className="flex gap-1">
              <button 
                onClick={handleSelectAll}
                className="text-[11px] px-2 py-0.5 rounded font-semibold"
                style={{ color: 'var(--brand-yellow)' }}
              >
                Все
              </button>
              <button 
                onClick={handleClear}
                className="text-[11px] px-2 py-0.5 rounded"
                style={{ color: 'var(--brand-gray)' }}
                disabled={count === 0}
              >
                Сброс
              </button>
            </div>
          </div>
          
          <div className="p-1.5 flex flex-col gap-0.5 max-h-[300px] overflow-y-auto">
            <label 
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer"
              style={{ borderBottom: '1px solid var(--brand-gray)', marginBottom: 4 }}
            >
              <input
                type="checkbox"
                className="w-4 h-4 flex-shrink-0 cursor-pointer"
                style={{ accentColor: 'var(--brand-black)' }}
                checked={count === available.length && available.length > 0}
                onChange={(e) => handleCheckAll(e.target.checked)}
              />
              <span className="text-sm font-semibold" style={{ color: 'var(--brand-black)' }}>
                Выбрать все 
                <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--brand-gray-dark)' }}>
                  ({available.length})
                </span>
              </span>
            </label>
            
            {available.map(val => (
              <label 
                key={val}
                className="flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 flex-shrink-0 cursor-pointer"
                  style={{ accentColor: 'var(--brand-black)' }}
                  checked={selected.has(val)}
                  onChange={(e) => handleItemChange(val, e.target.checked)}
                />
                <span className="text-sm leading-snug whitespace-normal" style={{ color: '#333' }}>
                  {val}
                </span>
              </label>
            ))}
          </div>
          
          {count > 0 && (
            <div 
              className="px-3 py-1.5 text-xs font-semibold"
              style={{ 
                background: 'rgba(254,217,0,0.08)',
                borderTop: '1px solid rgba(254,217,0,0.2)',
                color: '#7a5f00'
              }}
            >
              Выбрано: {count} из {available.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

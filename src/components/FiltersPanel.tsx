import { useStore } from '../store';
import { FilterDropdown } from './FilterDropdown';
import { CombinedItem } from '../types';

interface FiltersPanelProps {
  marketItems: CombinedItem[];
  filtered: CombinedItem[];
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({ marketItems, filtered }) => {
  const {
    filtersOpen,
    setFiltersOpen,
    classFilter,
    setClassFilter,
    tmcShortFilter,
    setTmcShortFilter,
    tmcFilter,
    setTmcFilter,
    searchText,
    setSearchText,
    selectedCodes,
    setSelectedCodes,
  } = useStore();

  const availableClasses = [...new Set(marketItems.map(i => i.classТМЦ))].sort();
  
  const availableTmcShort = [...new Set(
    classFilter.size > 0 
      ? marketItems.filter(i => classFilter.has(i.classТМЦ)).map(i => i.tmcShort)
      : marketItems.map(i => i.tmcShort)
  )].sort();
  
  const availableTmc = [...new Set(
    tmcShortFilter.size > 0
      ? marketItems.filter(i => classFilter.has(i.classТМЦ) && tmcShortFilter.has(i.tmcShort)).map(i => i.tmc)
      : marketItems.map(i => i.tmc)
  )].sort();

  const filteredNotSelected = filtered.filter(i => !selectedCodes.has(i.code));
  const filteredSelected = filtered.filter(i => selectedCodes.has(i.code));

  const handleAddSelected = () => {
    const newCodes = new Set(selectedCodes);
    filteredNotSelected.forEach(i => newCodes.add(i.code));
    setSelectedCodes(newCodes);
  };

  const handleRemoveSelected = () => {
    const newCodes = new Set(selectedCodes);
    filteredSelected.forEach(i => newCodes.delete(i.code));
    setSelectedCodes(newCodes);
  };

  if (!filtersOpen || marketItems.length === 0) {
    return (
      <div className="flex-shrink-0 border-b" style={{ background: '#FAFAF9', borderColor: 'var(--brand-gray-mid)' }}>
        <div className="flex items-center gap-4 px-5 py-2.5">
          <button
            onClick={() => setFiltersOpen(true)}
            className="btn-outline"
            style={{ fontSize: 12 }}
            disabled={marketItems.length === 0}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 6a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z"/>
            </svg>
            Фильтры
            {selectedCodes.size > 0 && (
              <span 
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(29,29,27,0.1)', color: 'var(--brand-black)' }}
              >
                {selectedCodes.size}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="px-5 py-3"
      style={{ background: '#F5F4F2', borderBottom: '1px solid var(--brand-gray)' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <FilterDropdown
          label="Класс ТМЦ"
          type="class"
          available={availableClasses}
          selected={classFilter}
          onSelect={setClassFilter}
        />
        <FilterDropdown
          label="ТМЦ кратко"
          type="tmcShort"
          available={availableTmcShort}
          selected={tmcShortFilter}
          onSelect={setTmcShortFilter}
        />
        <FilterDropdown
          label="ТМЦ"
          type="tmc"
          available={availableTmc}
          selected={tmcFilter}
          onSelect={setTmcFilter}
        />
        
        <div className="w-px h-7 flex-shrink-0" style={{ background: 'var(--brand-gray-mid)' }} />
        
        <div className="relative" style={{ minWidth: 180, maxWidth: 280, flex: 1 }}>
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: 'var(--brand-gray-dark)' }}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Поиск..."
            className="input-brand w-full"
            style={{ 
              paddingLeft: 32, 
              paddingRight: searchText ? 28 : 10,
              fontSize: 13 
            }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button 
              onClick={() => setSearchText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-lg leading-none"
              style={{ color: 'var(--brand-gray-dark)' }}
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-wrap mt-3">
        <span className="text-sm" style={{ color: 'var(--brand-gray-dark)' }}>
          Найдено: <strong style={{ color: 'var(--brand-black)' }}>{filtered.length}</strong> из {marketItems.length}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {selectedCodes.size > 0 && (
            <span 
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
              style={{ background: 'rgba(29,29,27,0.06)', color: 'var(--brand-black)', border: '1px solid var(--brand-gray-mid)' }}
            >
              В таблице: <strong>{selectedCodes.size}</strong>
            </span>
          )}
          <button
            onClick={handleRemoveSelected}
            className="btn-outline"
            disabled={filteredSelected.length === 0}
            style={{ fontSize: 12, color: '#B91C1C' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"/>
            </svg>
            Убрать
          </button>
          <button
            onClick={handleAddSelected}
            className="btn-brand"
            disabled={filteredNotSelected.length === 0}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Добавить в таблицу
          </button>
        </div>
      </div>
    </div>
  );
};

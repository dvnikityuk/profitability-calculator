import { create } from 'zustand';
import { CombinedItem, TableRow, PriceItem, TvcItem, Params } from './types';

interface AppState {
  activeTab: string;
  tabs: string[];
  priceItems: PriceItem[];
  tvcItems: TvcItem[];
  rows: TableRow[];
  selectedCodes: Set<string>;
  selectedCodesByMarket: Record<string, Set<string>>;
  params: Record<string, Params>;
  filtersOpen: boolean;
  classFilter: Set<string>;
  tmcShortFilter: Set<string>;
  tmcFilter: Set<string>;
  searchText: string;
  openDropdown: string | null;

  setActiveTab: (tab: string) => void;
  setPriceItems: (items: PriceItem[]) => void;
  setTvcItems: (items: TvcItem[]) => void;
  setSelectedCodes: (codes: Set<string>) => void;
  setParams: (market: string, params: Partial<Params>) => void;
  setFiltersOpen: (open: boolean) => void;
  setClassFilter: (filter: Set<string>) => void;
  setTmcShortFilter: (filter: Set<string>) => void;
  setTmcFilter: (filter: Set<string>) => void;
  setSearchText: (text: string) => void;
  setOpenDropdown: (dropdown: string | null) => void;
  addRows: (rows: TableRow[]) => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, updates: Partial<TableRow>) => void;
  clearRows: () => void;
  clearAll: () => void;
  getCombinedItems: () => CombinedItem[];
}

/** Параметры по умолчанию для каждого типа вкладки */
function defaultParams(tab: string): Params {
  if (tab === 'ОБЩИЙ') {
    return { euroRate: 1, dealerDiscount: 0, isEuroMode: true };
  }
  return { euroRate: 94.4, dealerDiscount: 0, isEuroMode: false };
}

export const useStore = create<AppState>((set, get) => ({
  activeTab: 'ОБЩИЙ',
  tabs: ['ОБЩИЙ', 'БЕЛАРУСЬ', 'РОССИЯ'],
  priceItems: [],
  tvcItems: [],
  rows: [],
  selectedCodes: new Set(),
  selectedCodesByMarket: { 'ОБЩИЙ': new Set(), 'БЕЛАРУСЬ': new Set(), 'РОССИЯ': new Set() },
  params: {
    'ОБЩИЙ': defaultParams('ОБЩИЙ'),
    'БЕЛАРУСЬ': defaultParams('БЕЛАРУСЬ'),
    'РОССИЯ': defaultParams('РОССИЯ'),
  },
  filtersOpen: true,
  classFilter: new Set(),
  tmcShortFilter: new Set(),
  tmcFilter: new Set(),
  searchText: '',
  openDropdown: null,

  setActiveTab: (tab) => set((state) => ({
    activeTab: tab,
    selectedCodes: new Set(state.selectedCodesByMarket[tab] || new Set()),
  })),

  setPriceItems: (items) => set((state) => {
    // Определяем уникальные рынки из загруженных данных
    const uniqueTabs = Array.from(new Set(items.map(i => i.market))).sort();
    // Всегда сохраняем все три вкладки
    const allTabs = ['ОБЩИЙ', 'БЕЛАРУСЬ', 'РОССИЯ', ...uniqueTabs.filter(t => !['ОБЩИЙ', 'БЕЛАРУСЬ', 'РОССИЯ'].includes(t))];
    
    const newParams = { ...state.params };
    const newCodes = { ...state.selectedCodesByMarket };
    
    allTabs.forEach(tab => {
      if (!newParams[tab]) newParams[tab] = defaultParams(tab);
      if (!newCodes[tab]) newCodes[tab] = new Set();
    });

    const nextTab = allTabs.includes(state.activeTab) ? state.activeTab : allTabs[0];

    return {
      priceItems: items,
      tabs: allTabs,
      activeTab: nextTab,
      params: newParams,
      selectedCodesByMarket: newCodes,
      selectedCodes: new Set(newCodes[nextTab]),
    };
  }),

  setTvcItems: (items) => set({ tvcItems: items }),

  setSelectedCodes: (newCodes) => {
    const { priceItems, tvcItems, activeTab, rows } = get();
    const existingCodes = new Set(
      rows.filter(r => r.item.market === activeTab).map(r => r.item.code)
    );
    const marketPriceItems = priceItems.filter(i => i.market === activeTab);
    
    const toAdd: TableRow[] = [];
    newCodes.forEach(code => {
      if (!existingCodes.has(code)) {
        const priceItem = marketPriceItems.find(i => i.code === code);
        const tvcItem = tvcItems.find(t => t.code === code);
        if (priceItem) {
          const combinedItem: CombinedItem = {
            ...priceItem,
            tvc: tvcItem?.tvc || 0,
          };
          toAdd.push({
            id: Math.random().toString(36).slice(2) + Date.now().toString(36),
            item: combinedItem,
            qty: 0,
            clientDiscount: 0,
            clientPrice: priceItem.price,
            clientTvc: tvcItem?.tvc || 0,
            lastEdited: 'discount',
          });
        }
      }
    });
    
    const otherMarketRows = rows.filter(r => r.item.market !== activeTab);
    const currentMarketRows = rows.filter(
      r => r.item.market === activeTab && newCodes.has(r.item.code)
    );

    set((state) => ({
      selectedCodes: new Set(newCodes),
      selectedCodesByMarket: {
        ...state.selectedCodesByMarket,
        [activeTab]: new Set(newCodes),
      },
      rows: [...otherMarketRows, ...currentMarketRows, ...toAdd],
    }));
  },

  setParams: (market, params) => set((state) => ({
    params: { ...state.params, [market]: { ...state.params[market], ...params } },
  })),

  setFiltersOpen: (open) => set({ filtersOpen: open }),
  setClassFilter: (filter) => set({ classFilter: filter }),
  setTmcShortFilter: (filter) => set({ tmcShortFilter: filter }),
  setTmcFilter: (filter) => set({ tmcFilter: filter }),
  setSearchText: (text) => set({ searchText: text }),
  setOpenDropdown: (dropdown) => set({ openDropdown: dropdown }),

  addRows: (newRows) => set((state) => {
    const activeCodes = new Set(state.selectedCodes);
    const activeTab = state.activeTab;
    const marketCodes = new Set(state.selectedCodesByMarket[activeTab] || new Set());

    newRows
      .filter(r => r.item.market === activeTab)
      .forEach(r => {
        activeCodes.add(r.item.code);
        marketCodes.add(r.item.code);
      });

    return {
      rows: [...state.rows, ...newRows],
      selectedCodes: activeCodes,
      selectedCodesByMarket: {
        ...state.selectedCodesByMarket,
        [activeTab]: marketCodes,
      },
    };
  }),

  removeRow: (id) => set((state) => {
    const row = state.rows.find(r => r.id === id);
    if (!row) return state;

    const rowMarket = row.item.market;
    
    const newSelectedCodes = new Set(state.selectedCodes);
    if (rowMarket === state.activeTab) {
      newSelectedCodes.delete(row.item.code);
    }

    const newSelectedByMarket = { ...state.selectedCodesByMarket };
    if (newSelectedByMarket[rowMarket]) {
      const marketSet = new Set(newSelectedByMarket[rowMarket]);
      marketSet.delete(row.item.code);
      newSelectedByMarket[rowMarket] = marketSet;
    }

    return {
      rows: state.rows.filter(r => r.id !== id),
      selectedCodes: newSelectedCodes,
      selectedCodesByMarket: newSelectedByMarket,
    };
  }),

  updateRow: (id, updates) => set((state) => ({
    rows: state.rows.map(r => r.id === id ? { ...r, ...updates } : r),
  })),

  clearRows: () => set((state) => {
    const activeTab = state.activeTab;
    return {
      rows: state.rows.filter(r => r.item.market !== activeTab),
      selectedCodes: new Set(),
      selectedCodesByMarket: {
        ...state.selectedCodesByMarket,
        [activeTab]: new Set(),
      },
    };
  }),
  
  clearAll: () => set((state) => {
    const emptySelected = Object.keys(state.selectedCodesByMarket).reduce((acc, tab) => {
      acc[tab] = new Set();
      return acc;
    }, {} as Record<string, Set<string>>);
    
    return {
      priceItems: [],
      tvcItems: [],
      rows: [],
      selectedCodes: new Set(),
      selectedCodesByMarket: emptySelected,
      classFilter: new Set(),
      tmcShortFilter: new Set(),
      tmcFilter: new Set(),
      searchText: '',
    };
  }),

  getCombinedItems: () => {
    const { priceItems, tvcItems, activeTab } = get();
    const marketPriceItems = priceItems.filter(i => i.market === activeTab);
    return marketPriceItems.map(priceItem => {
      const tvcItem = tvcItems.find(t => t.code === priceItem.code);
      return {
        ...priceItem,
        tvc: tvcItem?.tvc || 0,
      };
    });
  },
}));

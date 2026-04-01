import { create } from 'zustand';
import { Market, CombinedItem, TableRow, PriceItem, TvcItem } from './types';

interface AppState {
  activeTab: Market;
  priceItems: PriceItem[];
  tvcItems: TvcItem[];
  rows: TableRow[];
  selectedCodes: Set<string>;
  selectedCodesByMarket: { [key in Market]: Set<string> };
  params: { [key in Market]: { euroRate: number; dealerDiscount: number } };
  filtersOpen: boolean;
  classFilter: Set<string>;
  tmcShortFilter: Set<string>;
  tmcFilter: Set<string>;
  searchText: string;
  openDropdown: string | null;

  setActiveTab: (tab: Market) => void;
  setPriceItems: (items: PriceItem[]) => void;
  setTvcItems: (items: TvcItem[]) => void;
  setSelectedCodes: (codes: Set<string>) => void;
  setParams: (market: Market, params: { euroRate?: number; dealerDiscount?: number }) => void;
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

export const useStore = create<AppState>((set, get) => ({
  activeTab: 'БЕЛАРУСЬ',
  priceItems: [],
  tvcItems: [],
  rows: [],
  selectedCodes: new Set(),
  selectedCodesByMarket: {
    БЕЛАРУСЬ: new Set(),
    РОССИЯ: new Set(),
  },
  params: {
    БЕЛАРУСЬ: { euroRate: 94.4, dealerDiscount: 0 },
    РОССИЯ: { euroRate: 94.4, dealerDiscount: 0 },
  },
  filtersOpen: true,
  classFilter: new Set(),
  tmcShortFilter: new Set(),
  tmcFilter: new Set(),
  searchText: '',
  openDropdown: null,

  setActiveTab: (tab) => set((state) => ({
    activeTab: tab,
    selectedCodes: new Set(state.selectedCodesByMarket[tab]),
  })),
  setPriceItems: (items) => set({ priceItems: items }),
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
    const marketCodes = new Set(state.selectedCodesByMarket[activeTab]);

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
    const newSelectedCodes = new Set(state.selectedCodes);
    if (row && row.item.market === state.activeTab) {
      newSelectedCodes.delete(row.item.code);
    }

    const newSelectedByMarket = {
      ...state.selectedCodesByMarket,
      [row?.item.market || state.activeTab]: new Set(
        state.selectedCodesByMarket[row?.item.market || state.activeTab]
      ),
    };
    if (row) newSelectedByMarket[row.item.market].delete(row.item.code);

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
  clearAll: () => set({
    priceItems: [],
    tvcItems: [],
    rows: [],
    selectedCodes: new Set(),
    selectedCodesByMarket: {
      БЕЛАРУСЬ: new Set(),
      РОССИЯ: new Set(),
    },
    classFilter: new Set(),
    tmcShortFilter: new Set(),
    tmcFilter: new Set(),
    searchText: '',
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

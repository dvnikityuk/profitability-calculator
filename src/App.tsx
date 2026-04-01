import { useMemo } from 'react';
import { useStore } from './store';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { FiltersPanel } from './components/FiltersPanel';
import { DataTable } from './components/DataTable';
import { EmptyState } from './components/EmptyState';
import { Legend } from './components/Legend';

function App() {
  const {
    activeTab,
    rows,
    classFilter,
    tmcShortFilter,
    tmcFilter,
    searchText,
    getCombinedItems,
  } = useStore();

  const tabRows = rows.filter((row) => row.item.market === activeTab);

  const { marketItems, filtered } = useMemo(() => {
    const marketItems = getCombinedItems();
    
    let filtered = classFilter.size > 0 
      ? marketItems.filter(i => classFilter.has(i.classТМЦ)) 
      : marketItems;
    
    if (tmcShortFilter.size > 0) {
      filtered = filtered.filter(i => tmcShortFilter.has(i.tmcShort));
    }
    
    if (tmcFilter.size > 0) {
      filtered = filtered.filter(i => tmcFilter.has(i.tmc));
    }
    
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(i => 
        i.tmc.toLowerCase().includes(q) || 
        i.tmcShort.toLowerCase().includes(q) || 
        i.classТМЦ.toLowerCase().includes(q)
      );
    }
    
    return { marketItems, filtered };
  }, [activeTab, getCombinedItems, classFilter, tmcShortFilter, tmcFilter, searchText]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-white" style={{ borderTop: '2px solid var(--brand-yellow)' }}>
        <Toolbar />
        
        <FiltersPanel marketItems={marketItems} filtered={filtered} />
        
        {tabRows.length === 0 ? (
          <EmptyState hasItems={marketItems.length > 0} />
        ) : (
          <>
            <DataTable />
            <Legend />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

import { useState } from 'react';
import { useStore } from '../store';
import { UploadModal } from './UploadModal';

export function Header() {
  const { activeTab, tabs, setActiveTab, priceItems, tvcItems, clearAll } = useStore();
  const [modalOpen, setModalOpen] = useState(false);

  const getFlag = (m: string) => {
    if (m === 'БЕЛАРУСЬ') return '🇧🇾';
    if (m === 'РОССИЯ') return '🇷🇺';
    if (m === 'ОБЩИЙ') return '🌍';
    return '📁';
  };

  const counts = tabs.reduce((acc, tab) => {
    acc[tab] = priceItems.filter(i => i.market === tab).length;
    return acc;
  }, {} as Record<string, number>);

  const totalPriceCount = priceItems.length;
  const totalTvcCount = tvcItems.length;
  const hasData = totalPriceCount > 0 || totalTvcCount > 0;

  return (
    <>
      <header className="shadow-lg flex-shrink-0" style={{ background: 'var(--ui-700)' }}>
        <div className="flex items-stretch gap-0 px-4 pt-3 pb-0">

          {/* Logo */}
          <div className="flex items-center gap-3 pr-6 pb-3 flex-shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex-shrink-0 flex items-center justify-center rounded-lg" style={{ width: '40px', height: '40px', background: 'var(--brand-yellow)' }}>
              <svg className="w-5 h-5" style={{ color: 'var(--ui-900)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>Калькулятор рентабельности продаж</h1>
              <p style={{ color: 'var(--brand-gray-dark)', fontSize: '11px', margin: '1px 0 0' }}>Маржинальная доходность · МД · МР%</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-end gap-1 px-5 self-end overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {tabs.map((tab) => {
              const count = counts[tab] || 0;
              const active = activeTab === tab;
              const label = tab.charAt(0).toUpperCase() + tab.slice(1).toLowerCase();
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-t-xl border-x border-t transition-all select-none flex-shrink-0 ${active ? 'tab-active shadow-md' : 'tab-inactive'}`}
                  style={{ fontSize: '12px', fontWeight: active ? 700 : 500, borderColor: active ? 'transparent' : 'rgba(255,255,255,0.08)' }}
                >
                  <span className="text-base">{getFlag(tab)}</span>
                  <span>{label}</span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: active ? 'rgba(58,58,56,0.18)' : 'rgba(254,217,0,0.15)', color: active ? 'var(--ui-900)' : 'var(--brand-yellow)' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: status + actions */}
          <div className="ml-auto flex items-center pb-3 gap-2">

            {/* Status badges */}
            {hasData && (
              <div className="flex items-center gap-2">
                {/* Price badge */}
                {totalPriceCount > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '8px', padding: '5px 10px',
                  }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(180,182,255,0.9)" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <span style={{ fontSize: '11px', color: 'rgba(180,182,255,0.9)', fontWeight: 600 }}>
                      Прайс · {totalPriceCount}
                    </span>
                    <span style={{ fontSize: '11px', color: 'rgba(180,182,255,0.5)' }}>поз.</span>
                  </div>
                )}
                {/* TVC badge */}
                {totalTvcCount > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)',
                    borderRadius: '8px', padding: '5px 10px',
                  }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(125,211,252,0.9)" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                    </svg>
                    <span style={{ fontSize: '11px', color: 'rgba(125,211,252,0.9)', fontWeight: 600 }}>
                      TVC · {totalTvcCount}
                    </span>
                    <span style={{ fontSize: '11px', color: 'rgba(125,211,252,0.5)' }}>поз.</span>
                  </div>
                )}
                {/* Linked badge */}
                {totalPriceCount > 0 && totalTvcCount > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(45,122,79,0.15)', border: '1px solid rgba(93,216,151,0.3)',
                    borderRadius: '8px', padding: '5px 10px',
                  }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#5DD897" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                    <span style={{ fontSize: '11px', color: '#5DD897', fontWeight: 600 }}>Связаны</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

            {/* Upload button */}
            <button
              onClick={() => setModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '8px',
                background: 'var(--brand-yellow)', border: 'none',
                color: 'var(--ui-900)', fontWeight: 700, fontSize: '12px',
                cursor: 'pointer', transition: 'background 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-yellow-dim)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-yellow)')}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              {hasData ? 'Обновить данные' : 'Загрузить данные'}
            </button>

            {/* Clear */}
            {hasData && (
              <button
                onClick={clearAll}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '12px',
                  cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(220,38,38,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)';
                  e.currentTarget.style.color = '#FC8A8A';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Сбросить
              </button>
            )}
          </div>
        </div>
      </header>

      <UploadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

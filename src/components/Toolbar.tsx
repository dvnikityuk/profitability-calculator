import React, { useState, useCallback } from 'react';
import { useStore } from '../store';
import { exportToCSV } from '../utils/helpers';

export const Toolbar: React.FC = () => {
  const {
    activeTab,
    rows,
    selectedCodes,
    filtersOpen,
    setFiltersOpen,
    params,
    setParams,
    clearRows,
  } = useStore();

  const currentParams = params[activeTab];
  if (!currentParams) return null;

  const isEuro = currentParams.isEuroMode;
  const dealerActive = currentParams.dealerDiscount > 0;
  const tabRows = rows.filter((row) => row.item.market === activeTab);

  // Локальные состояния для полей ввода
  const [euroRateInput, setEuroRateInput] = useState<string>(
    currentParams.euroRate.toString().replace('.', ',')
  );
  const [dealerDiscountInput, setDealerDiscountInput] = useState<string>(
    currentParams.dealerDiscount.toString()
  );

  // Синхронизация при изменении глобального состояния
  React.useEffect(() => {
    if (document.activeElement?.id !== 'euro-rate') {
      setEuroRateInput(currentParams.euroRate.toString().replace('.', ','));
    }
  }, [currentParams.euroRate]);

  React.useEffect(() => {
    if (document.activeElement?.id !== 'dealer-discount') {
      setDealerDiscountInput(currentParams.dealerDiscount.toString());
    }
  }, [currentParams.dealerDiscount]);

  // Курс: синхронизация при смене вкладки
  React.useEffect(() => {
    setEuroRateInput(currentParams.euroRate.toString().replace('.', ','));
  }, [activeTab, currentParams.euroRate]);

  const handleExport = () => {
    exportToCSV(activeTab, tabRows, currentParams);
  };

  const handleEuroRateChange = useCallback((value: string) => {
    setEuroRateInput(value);
  }, []);

  const commitEuroRate = useCallback(() => {
    const cleaned = euroRateInput.replace(',', '.').trim();
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) {
      setParams(activeTab, { euroRate: num });
    } else {
      setEuroRateInput(currentParams.euroRate.toString().replace('.', ','));
    }
  }, [activeTab, currentParams.euroRate, euroRateInput, setParams]);

  const handleDealerDiscountChange = useCallback((value: string) => {
    setDealerDiscountInput(value);
  }, []);

  const commitDealerDiscount = useCallback(() => {
    const cleaned = dealerDiscountInput.replace(',', '.').trim();
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      setParams(activeTab, { dealerDiscount: Math.min(100, Math.max(0, num)) });
    } else {
      setDealerDiscountInput(currentParams.dealerDiscount.toString());
    }
  }, [activeTab, currentParams.dealerDiscount, dealerDiscountInput, setParams]);

  return (
    <div
      className="flex-shrink-0 border-b"
      style={{ background: '#FAFAF9', borderColor: 'var(--brand-gray-mid)' }}
    >
      <div
        className="flex items-center gap-4 px-5 py-2.5 flex-wrap"
        style={{ borderBottom: '1px solid var(--brand-gray)' }}
      >
        <div className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5"
            style={{ color: 'var(--brand-gray-dark)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span
            className="text-xs font-semibold uppercase"
            style={{ color: 'var(--brand-gray-dark)' }}
          >
            Параметры
          </span>
        </div>

        {/* Курс €/₽ — только для БЕЛАРУСЬ и РОССИЯ */}
        {!isEuro && (
          <>
            <label className="flex items-center gap-2">
              <span className="text-sm" style={{ color: '#444' }}>Курс €/₽</span>
              <input
                id="euro-rate"
                type="text"
                inputMode="decimal"
                className="input-brand w-24 text-right font-mono text-sm"
                value={euroRateInput}
                onChange={(e) => handleEuroRateChange(e.target.value)}
                onBlur={commitEuroRate}
                onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
                placeholder="94,4"
              />
            </label>
            <div className="w-px h-5 flex-shrink-0" style={{ background: 'var(--brand-gray-mid)' }} />
          </>
        )}

        <label className="flex items-center gap-2">
          <span className="text-sm" style={{ color: '#444' }}>Скидка дилера, %</span>
          <input
            id="dealer-discount"
            type="text"
            inputMode="decimal"
            className={`input-brand w-24 text-right font-mono text-sm ${dealerActive ? 'font-bold' : ''}`}
            value={dealerDiscountInput}
            onChange={(e) => handleDealerDiscountChange(e.target.value)}
            onBlur={commitDealerDiscount}
            onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
            placeholder="0"
            style={dealerActive ? {
              textAlign: 'right',
              borderColor: 'var(--brand-yellow)',
              background: 'rgba(254,217,0,0.08)',
              color: '#7a5f00'
            } : { textAlign: 'right' }}
          />
        </label>

        <div className="w-px h-5 flex-shrink-0" style={{ background: 'var(--brand-gray-mid)' }} />

        {tabRows.length > 0 && (
          <>
            <span className="text-sm" style={{ color: '#666' }}>
              Позиций: <strong>{tabRows.length}</strong>
            </span>
            <button
              onClick={clearRows}
              className="btn-outline"
              style={{ color: '#c0392b', borderColor: '#f5c6c2', fontSize: 12 }}
            >
              Очистить
            </button>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn-brand"
            disabled={tabRows.length === 0}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            Выгрузить CSV
          </button>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={filtersOpen ? 'btn-dark' : 'btn-outline'}
            style={{ fontSize: 12 }}
            disabled={tabRows.length === 0}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 6a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z"/>
            </svg>
            {filtersOpen ? 'Скрыть фильтры' : 'Фильтры'}
            {selectedCodes.size > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
                style={{
                  background: filtersOpen ? 'rgba(255,255,255,0.2)' : 'rgba(29,29,27,0.1)',
                  color: filtersOpen ? '#fff' : 'var(--brand-black)'
                }}
              >
                {selectedCodes.size}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

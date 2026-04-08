import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { calcRow, calcTotals, fmt, fmtPct, colorMR, mrColor } from '../utils/helpers';
import { TableRow, CalcResult } from '../types';

/* ─── Динамические заголовки ─── */

function getGroupHeaders(isEuro: boolean) {
  if (isEuro) {
    return [
      { label: '', span: 2, bg: 'var(--ui-600)' },
      { label: 'Ввод', span: 3, bg: '#6B6880' },
      { label: 'Стоимость, €', span: 4, bg: '#5C6470' },
      { label: 'TVC, €', span: 1, bg: '#4A6080' },
      { label: 'МД, €', span: 5, bg: '#4A706C' },
      { label: 'МР%', span: 3, bg: '#4A6858' },
    ];
  }
  return [
    { label: '', span: 2, bg: 'var(--ui-600)' },
    { label: 'Ввод', span: 3, bg: '#6B6880' },
    { label: 'Стоимость, €', span: 5, bg: '#5C6470' },
    { label: 'TVC, €', span: 1, bg: '#4A6080' },
    { label: 'МД, €', span: 5, bg: '#4A706C' },
    { label: 'МР%', span: 3, bg: '#4A6858' },
  ];
}

function getColHeaders(isEuro: boolean) {
  const currencyLabel = isEuro ? 'Цена сделки, €' : 'Цена сделки, ₽';
  const base = [
    { label: '', cls: 'w-7 text-center' },
    { label: 'Наименование', cls: 'text-left', style: 'min-width:220px' },
    { label: 'Кол-во', cls: 'w-16 text-center' },
    { label: 'Скидка/Наценка, %', cls: 'w-28 text-center' },
    { label: currencyLabel, cls: 'w-28 text-center' },
    { label: 'TVC/ед. €', cls: 'w-24 text-center' },
    { label: 'По прайсу', cls: 'w-28 text-right' },
    { label: 'Клиента', cls: 'w-28 text-right' },
    { label: 'Кл.+Дил.', cls: 'w-28 text-right' },
    { label: 'Прайс/ед.€', cls: 'w-24 text-right' },
  ];
  if (!isEuro) {
    base.push({ label: 'Прайс/ед.₽', cls: 'w-24 text-right' });
  }
  base.push(
    { label: 'TVC итого', cls: 'w-24 text-right' },
    { label: 'МД прайс', cls: 'w-24 text-right' },
    { label: 'МД клиента', cls: 'w-24 text-right' },
    { label: 'МД кл.+дил.', cls: 'w-24 text-right' },
    { label: 'Откл.кл.', cls: 'w-24 text-right' },
    { label: 'Откл.кл.+дил.', cls: 'w-28 text-right' },
    { label: 'МР% прайс', cls: 'w-24 text-right' },
    { label: 'МР% клиента', cls: 'w-24 text-right' },
    { label: 'МР% кл.+дил.', cls: 'w-24 text-right' },
  );
  return base;
}

/* ─── Строка таблицы ─── */

const TableRowComponent: React.FC<{
  row: TableRow;
  calc: CalcResult;
  idx: number;
  isEuro: boolean;
  onRowChange: (id: string, field: 'qty' | 'clientDiscount' | 'clientPrice' | 'clientTvc', value: number) => void;
  onRemove: (id: string) => void;
}> = React.memo(({ row, calc, idx, isEuro, onRowChange, onRemove }) => {
  const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F7F6F4';
  const priceEur = row.item.price;
  const isAtPriceList = Math.abs(row.clientPrice - priceEur) < 0.01 && Math.abs(row.clientDiscount) < 0.0001;
  const isMarkup = row.clientDiscount > 0;
  const isDiscount = row.clientDiscount < 0;
  const dash = <span style={{ color: 'var(--ui-400)' }}>—</span>;

  const [localQty, setLocalQty] = useState<string>(row.qty === 0 ? '' : String(row.qty));
  const [localDiscount, setLocalDiscount] = useState<string>(
    row.clientDiscount === 0 ? '' : (row.clientDiscount > 0 ? '+' : '') + row.clientDiscount.toFixed(2)
  );
  const [localPrice, setLocalPrice] = useState<string>(row.clientPrice === priceEur ? '' : String(row.clientPrice));
  const [localTvc, setLocalTvc] = useState<string>(row.clientTvc === row.item.tvc ? '' : String(row.clientTvc));

  const qtyInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const tvcInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== qtyInputRef.current) {
      setLocalQty(row.qty === 0 ? '' : String(row.qty));
    }
  }, [row.qty]);

  useEffect(() => {
    if (document.activeElement !== discountInputRef.current) {
      const displayValue = row.clientDiscount === 0 ? '' : (row.clientDiscount > 0 ? '+' : '') + row.clientDiscount.toFixed(2);
      setLocalDiscount(displayValue);
    }
  }, [row.clientDiscount]);

  useEffect(() => {
    if (document.activeElement !== priceInputRef.current) {
      setLocalPrice(row.clientPrice === priceEur ? '' : String(row.clientPrice));
    }
  }, [row.clientPrice, priceEur]);

  useEffect(() => {
    if (document.activeElement !== tvcInputRef.current) {
      setLocalTvc(row.clientTvc === row.item.tvc ? '' : String(row.clientTvc));
    }
  }, [row.clientTvc, row.item.tvc]);

  const handleQtyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setLocalQty(e.target.value), []);
  const commitQty = useCallback(() => {
    const num = localQty === '' ? 0 : (parseFloat(localQty.replace(',', '.')) || 0);
    onRowChange(row.id, 'qty', num);
  }, [localQty, onRowChange, row.id]);

  const handleDiscountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setLocalDiscount(e.target.value), []);
  const commitDiscount = useCallback(() => {
    const value = localDiscount.trim();
    const cleaned = value.replace(',', '.');
    const parsed = parseFloat(cleaned);
    onRowChange(row.id, 'clientDiscount', isNaN(parsed) ? 0 : parsed);
  }, [localDiscount, onRowChange, row.id]);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setLocalPrice(e.target.value), []);
  const commitPrice = useCallback(() => {
    const value = localPrice.trim();
    const num = value === '' ? priceEur : (parseFloat(value.replace(',', '.')) || priceEur);
    onRowChange(row.id, 'clientPrice', num);
  }, [localPrice, onRowChange, priceEur, row.id]);

  const handleTvcChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setLocalTvc(e.target.value), []);
  const commitTvc = useCallback(() => {
    const value = localTvc.trim();
    const num = value === '' ? row.item.tvc : (parseFloat(value.replace(',', '.')) || row.item.tvc);
    onRowChange(row.id, 'clientTvc', Math.max(0, num));
  }, [localTvc, onRowChange, row.id, row.item.tvc]);

  // Валютный суффикс
  const currSymbol = isEuro ? '€' : '₽';
  const priceLabel = isAtPriceList ? `${currSymbol} прайс` : '';
  const pricePlaceholder = fmt(priceEur, 2);

  return (
    <tr style={{ background: rowBg }} className="group">
      {/* Удалить */}
      <td className="table-sticky-del px-1 py-1.5 text-center" style={{ background: rowBg, borderBottom: '1px solid #EDECE9' }}>
        <button onClick={() => onRemove(row.id)} className="w-5 h-5 flex items-center justify-center rounded transition-all opacity-0 group-hover:opacity-100" style={{ color: 'var(--ui-400)' }} title="Удалить">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </td>

      {/* Наименование */}
      <td className="table-sticky-name px-2.5 py-1.5" style={{ background: rowBg, borderBottom: '1px solid #EDECE9', borderRight: '1px solid #EDECE9', minWidth: 220, maxWidth: 320 }}>
        <div className="font-medium text-xs leading-tight" style={{ color: 'var(--ui-900)' }} title={row.item.tmc}>
          {row.item.tmcShort || row.item.tmc}
        </div>
        {row.item.tmc !== row.item.tmcShort && (
          <div className="text-[10px] leading-tight mt-0.5 truncate" style={{ color: 'var(--ui-500)' }} title={row.item.tmc}>{row.item.tmc}</div>
        )}
        <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--ui-400)' }}>{row.item.code}</div>
      </td>

      {/* Кол-во */}
      <td className="p-1" style={{ background: '#F4F3FF' }}>
        <input ref={qtyInputRef} type="text" inputMode="decimal" className="rm-input" style={{ width: 60 }} value={localQty} onChange={handleQtyChange} onBlur={commitQty} onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()} placeholder="0" />
      </td>

      {/* Скидка/Наценка */}
      <td className="p-1" style={{ background: '#F4F3FF' }}>
        <div className="relative inline-block group/disc">
          <input
            ref={discountInputRef}
            type="text"
            inputMode="decimal"
            className={`rm-input ${row.lastEdited === 'discount' && Math.abs(row.clientDiscount) > 0 ? 'highlight' : ''}`}
            style={{ width: 84, paddingRight: (isMarkup || isDiscount) ? 18 : 8 }}
            value={localDiscount}
            onChange={handleDiscountChange}
            onBlur={commitDiscount}
            onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
            placeholder="0"
          />
          {(isMarkup || isDiscount) && (
            <>
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold" style={{ color: isMarkup ? '#E67E22' : '#15803D' }}>
                {isMarkup ? '+' : ''}
              </span>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[9px] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover/disc:opacity-100 transition-opacity z-50" style={{ background: isMarkup ? '#E67E22' : '#15803D', color: '#fff' }}>
                {isMarkup ? `Наценка: +${row.clientDiscount.toFixed(2)}%` : `Скидка: ${Math.abs(row.clientDiscount).toFixed(2)}%`}
              </div>
            </>
          )}
        </div>
      </td>

      {/* Цена сделки */}
      <td className="p-1" style={{ background: '#F4F3FF' }}>
        <div className="relative inline-block group/price">
          <input
            ref={priceInputRef}
            type="text"
            inputMode="decimal"
            className={`rm-input ${row.lastEdited === 'price' && !isAtPriceList ? 'highlight' : ''}`}
            style={{ width: 90 }}
            value={localPrice}
            onChange={handlePriceChange}
            onBlur={commitPrice}
            onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
            placeholder={pricePlaceholder}
          />
          {priceLabel && (
            <span className="absolute -top-1.5 -right-1 text-[8px] px-1 rounded leading-3 select-none" style={{ background: 'var(--brand-gray)', color: 'var(--ui-500)' }}>{priceLabel}</span>
          )}
          {!isAtPriceList && row.clientPrice > priceEur && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[9px] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover/price:opacity-100 transition-opacity z-50" style={{ background: '#E67E22', color: '#fff' }}>
              Наценка: +{(((row.clientPrice / priceEur) - 1) * 100).toFixed(1)}%
            </div>
          )}
          {!isAtPriceList && row.clientPrice < priceEur && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[9px] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover/price:opacity-100 transition-opacity z-50" style={{ background: '#15803D', color: '#fff' }}>
              Скидка: {(((row.clientPrice / priceEur) - 1) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </td>

      {/* TVC/ед. */}
      <td className="p-1" style={{ background: '#E0E7FF' }}>
        <input
          ref={tvcInputRef}
          type="text"
          inputMode="decimal"
          className="rm-input"
          style={{ width: 64 }}
          value={localTvc}
          onChange={handleTvcChange}
          onBlur={commitTvc}
          onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
          placeholder={fmt(row.item.tvc, 2)}
          title={row.clientTvc !== row.item.tvc ? `Кастомное TVC: ${row.clientTvc.toFixed(2)}` : 'TVC из файла'}
        />
      </td>

      {/* По прайсу */}
      <td className="text-right px-2" style={{ color: 'var(--ui-700)', fontWeight: 500 }}>
        {row.qty > 0 ? fmt(calc.costPriceList) : dash}
      </td>

      {/* Клиента */}
      <td className="text-right px-2" style={{ color: 'var(--ui-700)' }}>
        {row.qty > 0 ? fmt(calc.costClient) : dash}
      </td>

      {/* Кл.+Дил. */}
      <td className="text-right px-2" style={{ color: 'var(--ui-600)' }}>
        {row.qty > 0 ? fmt(calc.costClientDealer) : dash}
      </td>

      {/* Прайс/ед.€ */}
      <td className="text-right px-2" style={{ color: 'var(--ui-500)', fontSize: 11 }}>
        {fmt(calc.priceEur, 4)}
      </td>

      {/* Прайс/ед.₽ — только для БЕЛАРУСЬ/РОССИЯ */}
      {!isEuro && (
        <td className="text-right px-2" style={{ color: 'var(--ui-500)', fontSize: 11 }}>
          {fmt(row.item.price, 2)}
        </td>
      )}

      {/* TVC итого */}
      <td className="text-right px-2" style={{ color: 'var(--ui-600)', background: '#EEF4FF' }}>
        {row.qty > 0 ? fmt(calc.tvcTotal) : dash}
      </td>

      {/* МД прайс */}
      <td className="text-right px-2 font-semibold" style={{ color: row.qty > 0 ? (calc.mdPriceList < 0 ? '#B03030' : '#2D6B50') : 'var(--ui-400)' }}>
        {row.qty > 0 ? fmt(calc.mdPriceList) : dash}
      </td>

      {/* МД клиента */}
      <td className="text-right px-2" style={{ color: row.qty > 0 ? (calc.mdClient < 0 ? '#B03030' : '#2D6B50') : 'var(--ui-400)' }}>
        {row.qty > 0 ? fmt(calc.mdClient) : dash}
      </td>

      {/* МД кл.+дил. */}
      <td className="text-right px-2" style={{ color: row.qty > 0 ? (calc.mdClientDealer < 0 ? '#B03030' : '#2D6B50') : 'var(--ui-400)' }}>
        {row.qty > 0 ? fmt(calc.mdClientDealer) : dash}
      </td>

      {/* Откл.кл. */}
      <td className="text-right px-2" style={{ color: row.qty > 0 && calc.devMdClient > 0 ? '#A05020' : 'var(--ui-400)' }}>
        {row.qty > 0 && calc.devMdClient !== 0 ? fmt(calc.devMdClient) : dash}
      </td>

      {/* Откл.кл.+дил. */}
      <td className="text-right px-2 font-medium" style={{ color: row.qty > 0 && calc.devMdClientDealer > 0 ? '#A05020' : 'var(--ui-400)' }}>
        {row.qty > 0 && calc.devMdClientDealer !== 0 ? fmt(calc.devMdClientDealer) : dash}
      </td>

      {/* МР% прайс */}
      <td className="text-right px-2 font-bold" style={{ color: row.qty > 0 ? colorMR(calc.mrPriceList) : 'var(--ui-400)' }}>
        {row.qty > 0 ? fmtPct(calc.mrPriceList) : dash}
      </td>

      {/* МР% клиента */}
      <td className="text-right px-2 font-bold" style={{ color: row.qty > 0 ? colorMR(calc.mrClient) : 'var(--ui-400)' }}>
        {row.qty > 0 ? fmtPct(calc.mrClient) : dash}
      </td>

      {/* МР% кл.+дил. */}
      <td className="text-right px-2 font-bold" style={{ color: row.qty > 0 ? colorMR(calc.mrClientDealer) : 'var(--ui-400)' }}>
        {row.qty > 0 ? fmtPct(calc.mrClientDealer) : dash}
      </td>
    </tr>
  );
});

TableRowComponent.displayName = 'TableRowComponent';

/* ─── Таблица ─── */

export const DataTable: React.FC = () => {
  const { activeTab, rows, params, updateRow, removeRow, getCombinedItems } = useStore();

  const currentParams = params[activeTab];
  const isEuro = currentParams?.isEuroMode ?? false;
  const dealerActive = currentParams ? currentParams.dealerDiscount > 0 : false;
  const combinedItems = getCombinedItems();
  const tabRows = rows.filter((row) => row.item.market === activeTab);

  const displayedRows = tabRows.filter(row => {
    const item = row.item;
    const state = useStore.getState();
    if (state.searchText.trim()) {
      const q = state.searchText.toLowerCase();
      if (!item.tmc.toLowerCase().includes(q) &&
          !item.tmcShort.toLowerCase().includes(q) &&
          !item.classТМЦ.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (state.classFilter.size > 0 && !state.classFilter.has(item.classТМЦ)) return false;
    if (state.tmcShortFilter.size > 0 && !state.tmcShortFilter.has(item.tmcShort)) return false;
    if (state.tmcFilter.size > 0 && !state.tmcFilter.has(item.tmc)) return false;
    return true;
  });

  const totals = currentParams ? calcTotals(displayedRows, currentParams) : calcTotals([], { euroRate: 1, dealerDiscount: 0, isEuroMode: true });

  const groupHeaders = getGroupHeaders(isEuro);
  const colHeaders = getColHeaders(isEuro);

  const handleRowChange = useCallback((id: string, field: 'qty' | 'clientDiscount' | 'clientPrice' | 'clientTvc', value: number) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;

    const priceRub = row.item.price;

    if (field === 'qty') {
      updateRow(id, { qty: Math.max(0, value), lastEdited: 'qty' as const });
    } else if (field === 'clientDiscount') {
      // discount: отрицательное = скидка, положительное = наценка
      const disc = value;
      const newPrice = priceRub * (1 + disc / 100);
      updateRow(id, {
        clientDiscount: disc,
        clientPrice: Math.max(0, newPrice),
        lastEdited: 'discount' as const
      });
    } else if (field === 'clientPrice') {
      const newPrice = Math.max(0, value);
      const discountPercent = priceRub > 0 ? ((newPrice - priceRub) / priceRub) * 100 : 0;
      updateRow(id, {
        clientPrice: newPrice,
        clientDiscount: discountPercent,
        lastEdited: 'price' as const
      });
    } else if (field === 'clientTvc') {
      updateRow(id, { clientTvc: Math.max(0, value), lastEdited: 'tvc' as const });
    }
  }, [rows, updateRow]);

  const handleRemove = useCallback((id: string) => { removeRow(id); }, [removeRow]);

  if (tabRows.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-20 select-none">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--brand-gray)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--brand-gray-dark)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div className="text-base font-semibold mb-1" style={{ color: '#888' }}>Таблица пуста</div>
          <div className="text-sm max-w-xs mx-auto" style={{ color: '#aaa' }}>
            {combinedItems.length > 0
              ? 'Используйте фильтры, чтобы выбрать позиции'
              : 'Загрузите CSV-файлы прайс-листа и TVC'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto min-h-0 bg-white">
      <table className="w-full text-xs" style={{ minWidth: isEuro ? 1500 : 1600, borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead className="sticky top-0 z-20">
          {/* Группы */}
          <tr>
            {groupHeaders.map((g, i) => (
              <th
                key={i}
                colSpan={g.span}
                className="text-center px-2 py-1.5"
                style={{
                  background: g.bg,
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderRight: '1px solid rgba(255,255,255,0.1)',
                  position: i === 0 ? 'sticky' : undefined,
                  left: i === 0 ? 0 : undefined,
                  zIndex: i === 0 ? 30 : undefined
                }}
              >
                {g.label}
              </th>
            ))}
          </tr>
          {/* Колонки */}
          <tr style={{ background: 'var(--ui-800)' }}>
            {colHeaders.map((h, i) => (
              <th
                key={i}
                className={`px-2 py-2 font-semibold whitespace-nowrap ${h.cls}`}
                style={{
                  color: 'var(--brand-gray)',
                  fontSize: 11,
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                  position: i <= 1 ? 'sticky' : undefined,
                  zIndex: i <= 1 ? 30 : undefined,
                  background: i <= 1 ? 'var(--ui-800)' : undefined,
                  left: i === 0 ? 0 : i === 1 ? 28 : undefined,
                  minWidth: (h as any).style ? parseInt((h as any).style.replace('min-width:', '')) : undefined,
                }}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayedRows.map((row, idx) => (
            <TableRowComponent
              key={row.id}
              row={row}
              calc={calcRow(row, currentParams!)}
              idx={idx}
              isEuro={isEuro}
              onRowChange={handleRowChange}
              onRemove={handleRemove}
            />
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 z-20">
          <tr style={{ background: 'var(--ui-700)', fontWeight: 700 }}>
            <td className="table-sticky-del" style={{ background: 'var(--ui-700)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px' }} />
            <td className="table-sticky-name" style={{ background: 'var(--ui-700)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 12px', minWidth: 220, borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--brand-yellow)', letterSpacing: '0.04em' }}>ИТОГО</div>
              {totals.totalQty > 0 && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{totals.totalQty} шт.</div>}
            </td>
            {/* Кол-во */}
            <td style={{ background: 'var(--ui-700)', color: 'var(--brand-yellow)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {totals.totalQty > 0 ? totals.totalQty : <span style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>}
            </td>
            {/* Скидка/Наценка */}
            <td style={{ background: 'var(--ui-700)', color: Math.abs(totals.effectiveDiscount) > 0.01 ? (totals.effectiveDiscount > 0 ? '#FDE047' : '#7EE8C0') : 'rgba(255,255,255,0.25)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {totals.totalQty > 0 ? (totals.effectiveDiscount > 0 ? '+' : '') + fmt(totals.effectiveDiscount, 1) + '%' : <span style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>}
            </td>
            {/* Цена сделки — пусто */}
            <td style={{ background: 'var(--ui-700)', color: 'rgba(255,255,255,0.18)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px' }} />
            {/* TVC/ед. — пусто */}
            <td style={{ background: 'var(--ui-700)', color: 'rgba(255,255,255,0.18)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px' }} />
            {/* По прайсу */}
            <td style={{ background: 'var(--ui-700)', color: '#fff', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {fmt(totals.totalCostPriceList)}
            </td>
            {/* Клиента */}
            <td style={{ background: 'var(--ui-700)', color: '#D8D7D3', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {fmt(totals.totalCostClient)}
            </td>
            {/* Кл.+Дил. */}
            <td style={{ background: 'var(--ui-700)', color: dealerActive ? 'var(--brand-yellow)' : 'rgba(255,255,255,0.25)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {fmt(totals.totalCostClientDealer)}
            </td>
            {/* Прайс/ед.€ — пусто */}
            <td style={{ background: 'var(--ui-700)', color: 'rgba(255,255,255,0.18)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px' }} />
            {/* Прайс/ед.₽ — только для БЕЛАРУСЬ/РОССИЯ */}
            {!isEuro && (
              <td style={{ background: 'var(--ui-700)', color: 'rgba(255,255,255,0.18)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px' }} />
            )}
            {/* TVC итого */}
            <td style={{ background: 'var(--ui-600)', color: '#D8D7D3', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {fmt(totals.totalTvc)}
            </td>
            {/* МД прайс */}
            <td style={{ background: 'var(--ui-700)', color: totals.totalMdPriceList < 0 ? '#FC8A8A' : '#5DD897', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {fmt(totals.totalMdPriceList)}
            </td>
            {/* МД клиента */}
            <td style={{ background: 'var(--ui-700)', color: totals.totalMdClient < 0 ? '#FC8A8A' : '#7EE8C0', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {fmt(totals.totalMdClient)}
            </td>
            {/* МД кл.+дил. */}
            <td style={{ background: 'var(--ui-700)', color: dealerActive ? (totals.totalMdClientDealer < 0 ? '#FC8A8A' : '#FDE047') : 'rgba(255,255,255,0.25)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {fmt(totals.totalMdClientDealer)}
            </td>
            {/* Откл.кл. */}
            <td style={{ background: 'var(--ui-700)', color: totals.totalDevMdClient > 0 ? '#FCA080' : 'rgba(255,255,255,0.25)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {totals.totalDevMdClient !== 0 ? fmt(totals.totalDevMdClient) : <span style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>}
            </td>
            {/* Откл.кл.+дил. */}
            <td style={{ background: 'var(--ui-700)', color: totals.totalDevMdClientDealer > 0 ? '#FCA080' : 'rgba(255,255,255,0.25)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
              {totals.totalDevMdClientDealer !== 0 ? fmt(totals.totalDevMdClientDealer) : <span style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>}
            </td>
            {/* МР% прайс */}
            <td style={{ background: 'var(--ui-700)', color: mrColor(totals.mrPriceListTotal), borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 13 }}>
              {fmtPct(totals.mrPriceListTotal)}
            </td>
            {/* МР% клиента */}
            <td style={{ background: 'var(--ui-700)', color: mrColor(totals.mrClientTotal), borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 13 }}>
              {fmtPct(totals.mrClientTotal)}
            </td>
            {/* МР% кл.+дил. */}
            <td style={{ background: 'var(--ui-700)', color: dealerActive ? mrColor(totals.mrClientDealerTotal) : 'rgba(255,255,255,0.18)', borderTop: '2px solid var(--brand-yellow)', padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 13 }}>
              {dealerActive ? fmtPct(totals.mrClientDealerTotal) : <span style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

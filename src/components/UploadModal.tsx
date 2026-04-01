import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { parsePriceCSV, parseTvcCSV, demoData, parseCombinedCSV } from '../utils/helpers';
import { PriceItem, TvcItem } from '../types';

interface JoinDiagnosticsProps {
  priceItems: PriceItem[];
  tvcItems: TvcItem[];
}

function JoinDiagnostics({ priceItems, tvcItems }: JoinDiagnosticsProps) {
  const diagnostics = useMemo(() => {
    const tvcCodes = new Set(tvcItems.map(t => t.code));
    const priceCodes = new Set(priceItems.map(p => p.code));
    
    const matchedCodes = [...priceCodes].filter(c => tvcCodes.has(c));
    const unmatchedPriceCodes = [...priceCodes].filter(c => !tvcCodes.has(c));
    const unmatchedTvcCodes = [...tvcCodes].filter(c => !priceCodes.has(c));
    
    return {
      totalPrices: priceItems.length,
      totalTvc: tvcItems.length,
      matched: matchedCodes.length,
      unmatchedPrices: unmatchedPriceCodes.length,
      unmatchedTvc: unmatchedTvcCodes.length,
      sampleUnmatchedPrice: unmatchedPriceCodes.slice(0, 5),
      sampleUnmatchedTvc: unmatchedTvcCodes.slice(0, 5),
    };
  }, [priceItems, tvcItems]);

  const hasIssues = diagnostics.unmatchedPrices > 0 || diagnostics.unmatchedTvc > 0;
  const allMatched = diagnostics.matched === diagnostics.totalPrices && diagnostics.totalPrices > 0;

  return (
    <div style={{
      borderRadius: '12px',
      padding: '14px 16px',
      marginBottom: '16px',
      border: allMatched 
        ? '1px solid rgba(45,122,79,0.25)' 
        : hasIssues 
          ? '1px solid rgba(245,158,11,0.3)' 
          : '1px solid var(--brand-gray-mid)',
      background: allMatched 
        ? 'rgba(45,122,79,0.04)' 
        : hasIssues 
          ? 'rgba(245,158,11,0.04)' 
          : '#FAFAF9',
      animation: 'dropIn 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {allMatched ? (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2D7A4F" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        ) : (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#F59E0B" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        )}
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 700, 
          color: allMatched ? '#2D7A4F' : hasIssues ? '#92400E' : 'var(--ui-700)' 
        }}>
          Соединение по «Код»
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '11px', color: 'var(--ui-600)' }}>
          Прайс: <strong style={{ color: 'var(--ui-900)' }}>{diagnostics.totalPrices}</strong> поз.
        </div>
        <div style={{ fontSize: '11px', color: 'var(--ui-600)' }}>
          TVC: <strong style={{ color: 'var(--ui-900)' }}>{diagnostics.totalTvc}</strong> поз.
        </div>
        <div style={{ fontSize: '11px', color: allMatched ? '#2D7A4F' : '#92400E', fontWeight: 600 }}>
          Совпало: <strong>{diagnostics.matched}</strong>
          {diagnostics.totalPrices > 0 && (
            <span style={{ color: 'var(--ui-400)', fontWeight: 400 }}>
              {' '}/ {diagnostics.totalPrices}
            </span>
          )}
        </div>
      </div>

      {hasIssues && (
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {diagnostics.unmatchedPrices > 0 && (
            <div style={{ fontSize: '10px', color: '#92400E', marginBottom: '4px' }}>
              ⚠️ {diagnostics.unmatchedPrices} кодов из прайса без TVC
              {diagnostics.sampleUnmatchedPrice.length > 0 && (
                <span style={{ color: 'var(--ui-400)', marginLeft: '4px' }}>
                  (напр.: {diagnostics.sampleUnmatchedPrice.join(', ')})
                </span>
              )}
            </div>
          )}
          {diagnostics.unmatchedTvc > 0 && (
            <div style={{ fontSize: '10px', color: '#92400E' }}>
              ⚠️ {diagnostics.unmatchedTvc} кодов из TVC без прайса
              {diagnostics.sampleUnmatchedTvc.length > 0 && (
                <span style={{ color: 'var(--ui-400)', marginLeft: '4px' }}>
                  (напр.: {diagnostics.sampleUnmatchedTvc.join(', ')})
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface UploadZoneProps {
  type: 'price' | 'tvc';
  file: File | null;
  isDragging: boolean;
  isLoaded: boolean;
  count: number;
  onFile: (file: File) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onClear: () => void;
}

function UploadZone({ type, file, isDragging, isLoaded, count, onFile, onDragEnter, onDragLeave, onClear }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const isPrince = type === 'price';
  const accent = isPrince ? '#6366F1' : '#0EA5E9';
  const accentLight = isPrince ? 'rgba(99,102,241,0.08)' : 'rgba(14,165,233,0.08)';
  const accentBorder = isPrince ? 'rgba(99,102,241,0.4)' : 'rgba(14,165,233,0.4)';
  const accentDrag = isPrince ? 'rgba(99,102,241,0.15)' : 'rgba(14,165,233,0.15)';

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragLeave();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      onFile(dropped);
    }
  }, [onFile, onDragLeave]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragEnter();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    onDragLeave();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    e.target.value = '';
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        flex: 1,
        borderRadius: '16px',
        border: `2px dashed ${isDragging ? accent : isLoaded ? accent : 'var(--brand-gray-mid)'}`,
        background: isDragging ? accentDrag : isLoaded ? accentLight : '#FAFAF9',
        transition: 'all 0.2s ease',
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        position: 'relative',
        minHeight: '220px',
        justifyContent: 'center',
      }}
      onClick={() => !isLoaded && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleInputChange} />

      {/* Icon */}
      <div style={{
        width: '56px', height: '56px',
        borderRadius: '14px',
        background: isLoaded ? accent : isDragging ? accentBorder : 'var(--brand-gray)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}>
        {isLoaded ? (
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        ) : isPrince ? (
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke={isDragging ? '#fff' : 'var(--ui-500)'} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
        ) : (
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke={isDragging ? '#fff' : 'var(--ui-500)'} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
          </svg>
        )}
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontWeight: 700,
          fontSize: '14px',
          color: isLoaded ? accent : 'var(--ui-800)',
          marginBottom: '4px',
        }}>
          {isPrince ? 'Прайс-лист' : 'TVC'}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--ui-500)', lineHeight: 1.5 }}>
          {isPrince
            ? 'Прайс, Класс ТМЦ, ТМЦ кратко, Цена, ТМЦ, Код'
            : 'Класс ТМЦ, ТМЦ кратко, TVC, ТМЦ, Код'}
        </div>
      </div>

      {/* State */}
      {isLoaded && file ? (
        <div style={{
          width: '100%',
          background: '#fff',
          borderRadius: '10px',
          border: `1px solid ${accentBorder}`,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ui-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </div>
            <div style={{ fontSize: '11px', color: accent, fontWeight: 600, marginTop: '2px' }}>
              {count > 0 ? `${count} позиций загружено` : 'Файл загружен'}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            style={{
              width: '24px', height: '24px', borderRadius: '6px',
              background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ui-500)', flexShrink: 0,
            }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      ) : isDragging ? (
        <div style={{ fontSize: '12px', fontWeight: 600, color: accent }}>
          Отпустите файл здесь
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '12px', color: 'var(--ui-500)', lineHeight: 1.6,
          }}>
            <span
              style={{ color: accent, fontWeight: 600, cursor: 'pointer', borderBottom: `1px dashed ${accent}` }}
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            >
              Выберите файл
            </span>
            {' '}или перетащите сюда
          </div>
          <div style={{ fontSize: '11px', color: 'var(--brand-gray-mid)', marginTop: '4px' }}>CSV, UTF-8</div>
        </div>
      )}
    </div>
  );
}

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  const { setPriceItems, setTvcItems, clearRows, priceItems, tvcItems } = useStore();

  const [priceFile, setPriceFile] = useState<File | null>(null);
  const [tvcFile, setTvcFile] = useState<File | null>(null);
  const [parsedPriceCount, setParsedPriceCount] = useState(0);
  const [parsedTvcCount, setParsedTvcCount] = useState(0);
  const [dragPrice, setDragPrice] = useState(false);
  const [dragTvc, setDragTvc] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (open) {
      setApplied(false);
      // Show already-loaded counts
      if (priceItems.length > 0) setParsedPriceCount(priceItems.length);
      if (tvcItems.length > 0) setParsedTvcCount(tvcItems.length);
    }
  }, [open]);

  if (!open) return null;

  const handlePriceFile = async (file: File) => {
    setPriceFile(file);
    const text = await file.text();
    const items = parsePriceCSV(text);
    setParsedPriceCount(items.length);
    setPriceItems(items);
    clearRows();
  };

  const handleTvcFile = async (file: File) => {
    setTvcFile(file);
    const text = await file.text();
    const items = parseTvcCSV(text);
    setParsedTvcCount(items.length);
    setTvcItems(items);
  };

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
      setTimeout(() => onClose(), 700);
    }, 400);
  };

  const handleDemo = () => {
    const { priceItems: pi, tvcItems: ti } = parseCombinedCSV(demoData);
    setPriceItems(pi);
    setTvcItems(ti);
    clearRows();
    setParsedPriceCount(pi.length);
    setParsedTvcCount(ti.length);
    setPriceFile(new File([''], 'demo-price.csv'));
    setTvcFile(new File([''], 'demo-tvc.csv'));
  };

  const canApply = parsedPriceCount > 0 || parsedTvcCount > 0;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(30,30,28,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.35)',
          width: '100%',
          maxWidth: '680px',
          overflow: 'hidden',
          animation: 'modalIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'var(--ui-700)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'var(--brand-yellow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--ui-900)" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Загрузка данных</div>
            <div style={{ fontSize: '11px', color: 'var(--brand-gray-dark)', marginTop: '2px' }}>
              Загрузите прайс-лист и таблицу TVC отдельно — они соединятся по коду
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto', width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0,
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>

          {/* Format hint */}
          <div style={{
            display: 'flex', gap: '10px', marginBottom: '20px',
          }}>
            {/* Price format */}
            <div style={{
              flex: 1, background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '10px', padding: '10px 14px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Формат: Прайс
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['Прайс', 'Класс ТМЦ', 'ТМЦ кратко', 'Цена', 'ТМЦ', 'Код'].map((col, i) => (
                  <span key={i} style={{
                    fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                    background: i === 5 ? '#6366F1' : 'rgba(99,102,241,0.12)',
                    color: i === 5 ? '#fff' : '#6366F1',
                    fontWeight: i === 5 ? 700 : 500,
                  }}>{col}</span>
                ))}
              </div>
            </div>
            {/* Arrow */}
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--brand-gray-mid)', fontSize: '18px', flexShrink: 0 }}>
              ⟷
            </div>
            {/* TVC format */}
            <div style={{
              flex: 1, background: 'rgba(14,165,233,0.06)',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: '10px', padding: '10px 14px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Формат: TVC
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['Класс ТМЦ', 'ТМЦ кратко', 'TVC', 'ТМЦ', 'Код'].map((col, i) => (
                  <span key={i} style={{
                    fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                    background: i === 4 ? '#0EA5E9' : 'rgba(14,165,233,0.12)',
                    color: i === 4 ? '#fff' : '#0EA5E9',
                    fontWeight: i === 4 ? 700 : 500,
                  }}>{col}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Drop zones */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <UploadZone
              type="price"
              file={priceFile}
              isDragging={dragPrice}
              isLoaded={parsedPriceCount > 0}
              count={parsedPriceCount}
              onFile={handlePriceFile}
              onDragEnter={() => setDragPrice(true)}
              onDragLeave={() => setDragPrice(false)}
              onClear={() => {
                setPriceFile(null);
                setParsedPriceCount(0);
                setPriceItems([]);
                clearRows();
              }}
            />
            <UploadZone
              type="tvc"
              file={tvcFile}
              isDragging={dragTvc}
              isLoaded={parsedTvcCount > 0}
              count={parsedTvcCount}
              onFile={handleTvcFile}
              onDragEnter={() => setDragTvc(true)}
              onDragLeave={() => setDragTvc(false)}
              onClear={() => {
                setTvcFile(null);
                setParsedTvcCount(0);
                setTvcItems([]);
              }}
            />
          </div>

          {/* Join diagnostics */}
          {parsedPriceCount > 0 && parsedTvcCount > 0 && (
            <JoinDiagnostics priceItems={priceItems} tvcItems={tvcItems} />
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleDemo}
              style={{
                padding: '9px 16px', borderRadius: '8px',
                background: 'var(--brand-gray)', border: '1.5px solid var(--brand-gray-mid)',
                color: 'var(--ui-700)', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              Демо-данные
            </button>

            <div style={{ flex: 1 }} />

            <button
              onClick={onClose}
              style={{
                padding: '9px 18px', borderRadius: '8px',
                background: '#fff', border: '1.5px solid var(--brand-gray-mid)',
                color: 'var(--ui-700)', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>

            <button
              onClick={handleApply}
              disabled={!canApply || applying}
              style={{
                padding: '9px 24px', borderRadius: '8px',
                background: canApply ? (applied ? '#2D7A4F' : 'var(--brand-yellow)') : 'var(--brand-gray)',
                border: 'none',
                color: canApply ? 'var(--ui-900)' : 'var(--ui-400)',
                fontSize: '13px', fontWeight: 700,
                cursor: canApply && !applying ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease',
                opacity: applying ? 0.7 : 1,
              }}
            >
              {applied ? (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span style={{ color: '#fff' }}>Применено!</span>
                </>
              ) : applying ? (
                <>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    border: '2px solid rgba(58,58,56,0.3)', borderTopColor: 'var(--ui-900)',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Применяем...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--ui-900)" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  Применить
                  {canApply && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px',
                      background: 'rgba(58,58,56,0.15)', color: 'var(--ui-700)',
                    }}>
                      {parsedPriceCount > 0 && `${parsedPriceCount}`}
                      {parsedPriceCount > 0 && parsedTvcCount > 0 && ' + '}
                      {parsedTvcCount > 0 && `${parsedTvcCount}`}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

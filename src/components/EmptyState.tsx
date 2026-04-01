import { useState } from 'react';
import { UploadModal } from './UploadModal';

interface EmptyStateProps {
  hasItems: boolean;
}

export function EmptyState({ hasItems }: EmptyStateProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="h-full flex items-center justify-center" style={{ background: '#FAFAF9' }}>
        <div className="text-center select-none" style={{ maxWidth: '420px', padding: '40px 20px' }}>

          {/* Illustration */}
          <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 24px' }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '24px',
              background: 'var(--brand-gray)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="var(--brand-gray-dark)" strokeWidth={1.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            {!hasItems && (
              <div style={{
                position: 'absolute', bottom: '-4px', right: '-4px',
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'var(--brand-yellow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(254,217,0,0.4)',
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--ui-900)" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
              </div>
            )}
          </div>

          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ui-800)', marginBottom: '8px' }}>
            {hasItems ? 'Таблица пуста' : 'Нет данных для расчёта'}
          </div>

          <div style={{ fontSize: '13px', color: 'var(--ui-500)', lineHeight: 1.6, marginBottom: '28px' }}>
            {hasItems
              ? 'Выберите позиции из прайс-листа через фильтры или поиск выше'
              : <>Загрузите <strong style={{ color: 'var(--ui-700)' }}>прайс-лист</strong> и таблицу <strong style={{ color: 'var(--ui-700)' }}>TVC</strong> — они объединятся по коду позиции</>
            }
          </div>

          {!hasItems && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '11px 28px', borderRadius: '10px',
                  background: 'var(--brand-yellow)', border: 'none',
                  color: 'var(--ui-900)', fontWeight: 700, fontSize: '13px',
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(254,217,0,0.35)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(254,217,0,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(254,217,0,0.35)'; }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Загрузить данные
              </button>

              {/* Format hints */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <div style={{
                  padding: '8px 12px', borderRadius: '8px',
                  background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)',
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366F1', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Прайс</div>
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                    {['Рынок', 'Класс', 'ТМЦ', 'Код', 'Цена'].map((c, i) => (
                      <span key={i} style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: i === 3 ? '#6366F1' : 'rgba(99,102,241,0.12)', color: i === 3 ? '#fff' : '#6366F1' }}>{c}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--brand-gray-mid)', fontSize: '16px' }}>⟷</div>
                <div style={{
                  padding: '8px 12px', borderRadius: '8px',
                  background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.18)',
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#0EA5E9', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TVC</div>
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                    {['ТМЦ', 'Код', 'TVC'].map((c, i) => (
                      <span key={i} style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: i === 1 ? '#0EA5E9' : 'rgba(14,165,233,0.12)', color: i === 1 ? '#fff' : '#0EA5E9' }}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <UploadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

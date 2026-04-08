


export const Legend: React.FC = () => {
  return (
    <div 
      className="flex-shrink-0 flex items-center gap-5 px-5 py-2 border-t text-[11px]"
      style={{ background: '#FAFAF9', borderColor: 'var(--brand-gray)' }}
    >
      <span className="font-semibold" style={{ color: 'var(--brand-gray-dark)' }}>МР%:</span>
      <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#15803D' }}>
        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#15803D' }}></span>
        ≥ 25% — хорошо
      </span>
      <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#A16207' }}>
        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#A16207' }}></span>
        15–25% — допустимо
      </span>
       <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#B91C1C' }}>
         <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#B91C1C' }}></span>
         &lt; 15% — ниже нормы
       </span>
       <div className="w-px h-5 flex-shrink-0" style={{ background: 'var(--brand-gray-mid)' }} />
       <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#E67E22' }}>
         <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#E67E22' }}></span>
         + — наценка сверх прайса
       </span>
       <span className="ml-auto font-mono" style={{ color: 'var(--brand-gray-dark)' }}>
         Все расчёты ведутся в евро
       </span>
    </div>
  );
};

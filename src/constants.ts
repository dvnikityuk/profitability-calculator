export const TABS = [
  { id: 'БЕЛАРУСЬ' as const, label: 'Беларусь', flag: '🇧🇾' },
  { id: 'РОССИЯ' as const, label: 'Россия', flag: '🇷🇺' }
];

export const GROUP_HEADERS = [
  { label: '', span: 2, bg: 'var(--ui-600)' },
  { label: 'Ввод', span: 3, bg: '#6B6880' },
  { label: 'Стоимость, €', span: 5, bg: '#5C6470' },
  { label: 'TVC, €', span: 2, bg: '#4A6080' },
  { label: 'МД, €', span: 5, bg: '#4A706C' },
  { label: 'МР%', span: 3, bg: '#4A6858' }
];

export const COL_HEADERS = [
  { label: '', cls: 'w-7 text-center' },
  { label: 'Наименование', cls: 'text-left', style: { minWidth: '220px' } },
  { label: 'Кол-во', cls: 'w-16 text-center' },
  { label: 'Скидка/Наценка, %', cls: 'w-24 text-center' },
  { label: 'Цена сделки, ₽', cls: 'w-28 text-center' },
  { label: 'По прайсу', cls: 'w-28 text-right' },
  { label: 'Клиента', cls: 'w-28 text-right' },
  { label: 'Кл.+Дил.', cls: 'w-28 text-right' },
  { label: 'Прайс/ед.€', cls: 'w-24 text-right' },
  { label: 'Прайс/ед.₽', cls: 'w-24 text-right' },
  { label: 'TVC/ед., €', cls: 'w-20 text-center' },
  { label: 'TVC итого', cls: 'w-24 text-right' },
  { label: 'МД прайс', cls: 'w-24 text-right' },
  { label: 'МД клиента', cls: 'w-24 text-right' },
  { label: 'МД кл.+дил.', cls: 'w-24 text-right' },
  { label: 'Откл.кл.', cls: 'w-24 text-right' },
  { label: 'Откл.кл.+дил.', cls: 'w-28 text-right' },
  { label: 'МР% прайс', cls: 'w-24 text-right' },
  { label: 'МР% клиента', cls: 'w-24 text-right' },
  { label: 'МР% кл.+дил.', cls: 'w-24 text-right' }
];

export const DEFAULT_PARAMS = {
  БЕЛАРУСЬ: { euroRate: 94.4, dealerDiscount: 0 },
  РОССИЯ: { euroRate: 94.4, dealerDiscount: 0 }
};

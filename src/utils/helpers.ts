import { TableRow, Params, CalcResult, Totals, PriceItem, TvcItem } from '../types';

export function fmt(n: number, d: number = 2): string {
  return (!isFinite(n) || isNaN(n)) ? '—' : n.toLocaleString('ru-RU', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export function fmtPct(n: number): string {
  return (!isFinite(n) || isNaN(n)) ? '—' :
    (n * 100).toLocaleString('ru-RU', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + '%';
}

export function fmtDiscount(discount: number): string {
  if (!isFinite(discount) || isNaN(discount)) return '—';
  if (discount === 0) return '—';
  return `${discount > 0 ? '+' : ''}${discount.toFixed(1)}%`;
}

export function colorMR(v: number): string {
  if (!isFinite(v) || isNaN(v)) return 'var(--ui-400)';
  if (v >= 0.25) return '#2D7A4F';
  if (v >= 0.15) return '#8A6300';
  return '#B03030';
}

export function mrColor(v: number): string {
  if (!isFinite(v) || isNaN(v)) return 'rgba(255,255,255,0.3)';
  if (v >= 0.25) return '#5DD897';
  if (v >= 0.15) return '#FDE047';
  return '#FC8A8A';
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function parseNumber(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.trim().replace(/"/g, '').replace(/\s/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',') {
      if (inQuotes) {
        // Запятая внутри кавычек — часть значения (например "8,21" → "8,21")
        current += ',';
      } else {
        result.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/"/g, '')
    .replace(/\s+/g, '')
    .replace(/[_\-./\\]/g, '');
}

function getHeaderIndex(headers: string[], aliases: string[]): number {
  const normalizedHeaders = headers.map(normalizeHeader);
  const normalizedAliases = aliases.map(normalizeHeader);
  return normalizedHeaders.findIndex((h) => normalizedAliases.includes(h));
}

export function parsePriceCSV(text: string): PriceItem[] {
  let cleanText = text;
  if (text.charCodeAt(0) === 0xFEFF) {
    cleanText = text.slice(1);
  }

  const lines = cleanText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const marketIdx = getHeaderIndex(headers, ['Прайс', 'Рынок', 'Market']);
  const classIdx = getHeaderIndex(headers, ['Класс ТМЦ', 'ClassТМЦ']);
  const shortIdx = getHeaderIndex(headers, ['ТМЦ кратко', 'ТМЦ_кратко']);
  const priceIdx = getHeaderIndex(headers, ['Цена', 'Price']);
  const tmcIdx = getHeaderIndex(headers, ['ТМЦ']);
  const codeIdx = getHeaderIndex(headers, ['Код', 'Code']);

  // Fallback for historical exports if headers are absent or malformed.
  const idx = {
    market: marketIdx >= 0 ? marketIdx : 0,
    class: classIdx >= 0 ? classIdx : 1,
    short: shortIdx >= 0 ? shortIdx : 2,
    price: priceIdx >= 0 ? priceIdx : 3,
    tmc: tmcIdx >= 0 ? tmcIdx : 4,
    code: codeIdx >= 0 ? codeIdx : 5,
  };

  const items: PriceItem[] = [];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cols = parseCSVLine(line);
    if (cols.length <= Math.max(idx.market, idx.class, idx.short, idx.price, idx.tmc, idx.code)) continue;

    const marketRaw = cols[idx.market].trim().toUpperCase();
    if (marketRaw !== 'БЕЛАРУСЬ' && marketRaw !== 'РОССИЯ') continue;

    items.push({
      market: marketRaw as 'БЕЛАРУСЬ' | 'РОССИЯ',
      classТМЦ: cols[idx.class].trim(),
      tmcShort: cols[idx.short].trim(),
      tmc: cols[idx.tmc].trim(),
      code: cols[idx.code].trim(),
      price: parseNumber(cols[idx.price]),
    });
  }
  return items;
}

export function parseTvcCSV(text: string): TvcItem[] {
  let cleanText = text;
  if (text.charCodeAt(0) === 0xFEFF) {
    cleanText = text.slice(1);
  }

  const lines = cleanText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const classIdx = getHeaderIndex(headers, ['Класс ТМЦ', 'ClassТМЦ']);
  const shortIdx = getHeaderIndex(headers, ['ТМЦ кратко', 'ТМЦ_кратко']);
  const tvcIdx = getHeaderIndex(headers, ['TVC']);
  const tmcIdx = getHeaderIndex(headers, ['ТМЦ']);
  const codeIdx = getHeaderIndex(headers, ['Код', 'Code']);

  const idx = {
    class: classIdx >= 0 ? classIdx : 0,
    short: shortIdx >= 0 ? shortIdx : 1,
    tvc: tvcIdx >= 0 ? tvcIdx : 2,
    tmc: tmcIdx >= 0 ? tmcIdx : 3,
    code: codeIdx >= 0 ? codeIdx : 4,
  };

  const items: TvcItem[] = [];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cols = parseCSVLine(line);
    if (cols.length <= Math.max(idx.class, idx.short, idx.tvc, idx.tmc, idx.code)) continue;

    items.push({
      tmc: cols[idx.tmc].trim(),
      tmcShort: cols[idx.short].trim(),
      code: cols[idx.code].trim(),
      tvc: parseNumber(cols[idx.tvc]),
    });
  }
  return items;
}

export function parseCombinedCSV(text: string): { priceItems: PriceItem[]; tvcItems: TvcItem[] } {
  let cleanText = text;
  if (text.charCodeAt(0) === 0xFEFF) {
    cleanText = text.slice(1);
  }

  const lines = cleanText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { priceItems: [], tvcItems: [] };

  const priceItems: PriceItem[] = [];
  const tvcItems: TvcItem[] = [];
  const tvcCodes = new Set<string>();

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cols = parseCSVLine(line);
    if (cols.length < 7) continue;

    const marketRaw = cols[0].trim().toUpperCase();
    if (marketRaw !== 'БЕЛАРУСЬ' && marketRaw !== 'РОССИЯ') continue;

    const code = cols[4].trim();
    const tvc = parseNumber(cols[5]);

    priceItems.push({
      market: marketRaw as 'БЕЛАРУСЬ' | 'РОССИЯ',
      classТМЦ: cols[1].trim(),
      tmcShort: cols[2].trim(),
      tmc: cols[3].trim(),
      code: code,
      price: parseNumber(cols[6]),
    });

    if (!tvcCodes.has(code)) {
      tvcCodes.add(code);
      tvcItems.push({
        tmc: cols[3].trim(),
        tmcShort: cols[2].trim(),
        code: code,
        tvc: tvc,
      });
    }
  }
  return { priceItems, tvcItems };
}

export function calcRow(row: TableRow, params: Params): CalcResult {
  const { euroRate, dealerDiscount } = params;
  const { item, qty, clientPrice, clientTvc } = row;
  const priceEur = item.price / euroRate;
  const clientPriceEur = clientPrice / euroRate;
  const costPriceList = qty * priceEur;
  const costClient = qty * clientPriceEur;
  const costClientDealer = costClient * (1 - dealerDiscount / 100);
  const tvcTotal = clientTvc * qty;
  const mdPriceList = costPriceList - tvcTotal;
  const mdClient = costClient - tvcTotal;
  const mdClientDealer = costClientDealer - tvcTotal;
  const devMdClient = mdPriceList - mdClient;
  const devMdClientDealer = mdPriceList - mdClientDealer;
  const mrPriceList = costPriceList !== 0 ? mdPriceList / costPriceList : 0;
  const mrClient = costClient !== 0 ? mdClient / costClient : 0;
  const mrClientDealer = costClientDealer !== 0 ? mdClientDealer / costClientDealer : 0;
  return {
    priceEur,
    clientPriceEur,
    costPriceList,
    costClient,
    costClientDealer,
    tvcTotal,
    mdPriceList,
    mdClient,
    mdClientDealer,
    devMdClient,
    devMdClientDealer,
    mrPriceList,
    mrClient,
    mrClientDealer,
  };
}

export function calcTotals(rows: TableRow[], params: Params): Totals {
  if (!rows || rows.length === 0) {
    return {
      totalQty: 0,
      effectiveDiscount: 0,
      totalCostPriceList: 0,
      totalCostClient: 0,
      totalCostClientDealer: 0,
      totalTvc: 0,
      totalMdPriceList: 0,
      totalMdClient: 0,
      totalMdClientDealer: 0,
      totalDevMdClient: 0,
      totalDevMdClientDealer: 0,
      mrPriceListTotal: 0,
      mrClientTotal: 0,
      mrClientDealerTotal: 0,
    };
  }
  const calcs = rows.map(r => calcRow(r, params));
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const totalCostPriceList = calcs.reduce((s, c) => s + c.costPriceList, 0);
  const totalCostClient = calcs.reduce((s, c) => s + c.costClient, 0);
  const totalCostClientDealer = calcs.reduce((s, c) => s + c.costClientDealer, 0);
  const totalTvc = calcs.reduce((s, c) => s + c.tvcTotal, 0);
  const totalMdPriceList = calcs.reduce((s, c) => s + c.mdPriceList, 0);
  const totalMdClient = calcs.reduce((s, c) => s + c.mdClient, 0);
  const totalMdClientDealer = calcs.reduce((s, c) => s + c.mdClientDealer, 0);
  const totalDevMdClient = calcs.reduce((s, c) => s + c.devMdClient, 0);
  const totalDevMdClientDealer = calcs.reduce((s, c) => s + c.devMdClientDealer, 0);
  // Signed delta against price-list: negative means discount, positive means markup.
  const effectiveDiscount = totalCostPriceList !== 0 ? (totalCostClient / totalCostPriceList - 1) * 100 : 0;
  const mrPriceListTotal = totalCostPriceList !== 0 ? totalMdPriceList / totalCostPriceList : 0;
  const mrClientTotal = totalCostClient !== 0 ? totalMdClient / totalCostClient : 0;
  const mrClientDealerTotal = totalCostClientDealer !== 0 ? totalMdClientDealer / totalCostClientDealer : 0;
  return {
    totalQty,
    effectiveDiscount,
    totalCostPriceList,
    totalCostClient,
    totalCostClientDealer,
    totalTvc,
    totalMdPriceList,
    totalMdClient,
    totalMdClientDealer,
    totalDevMdClient,
    totalDevMdClientDealer,
    mrPriceListTotal,
    mrClientTotal,
    mrClientDealerTotal,
  };
}

export function exportToCSV(market: string, rows: TableRow[], params: Params): void {
  const lines: string[] = [];
  lines.push(['№', 'Код', 'Наименование', 'Класс', 'Кол-во', 'Скидка/Наценка%', 'Цена₽', 'По прайсу€', 'Клиента€', 'Кл.+Дил.€', 'TVC€', 'МД прайс', 'МД клиента', 'МД кл.+дил.', 'МР% прайс', 'МР% клиента', 'МР% кл.+дил.'].join(';'));
  rows.forEach((row, idx) => {
    const calc = calcRow(row, params);
    const discountLabel = row.clientDiscount > 0
      ? `+${row.clientDiscount.toFixed(2)}`
      : row.clientDiscount.toFixed(2);
    lines.push([
      idx + 1,
      row.item.code,
      row.item.tmc,
      row.item.classТМЦ,
      row.qty,
      discountLabel,
      fmt(row.clientPrice, 2),
      fmt(calc.costPriceList, 2),
      fmt(calc.costClient, 2),
      fmt(calc.costClientDealer, 2),
      fmt(calc.tvcTotal, 2),
      fmt(calc.mdPriceList, 2),
      fmt(calc.mdClient, 2),
      fmt(calc.mdClientDealer, 2),
      fmtPct(calc.mrPriceList),
      fmtPct(calc.mrClient),
      fmtPct(calc.mrClientDealer),
    ].join(';'));
  });
  const totals = calcTotals(rows, params);
  lines.push('');
  const effDiscountLabel = totals.effectiveDiscount > 0
    ? `+${totals.effectiveDiscount.toFixed(1)}%`
    : `${totals.effectiveDiscount.toFixed(1)}%`;
  lines.push([
    'ИТОГО', '', '', '', '', effDiscountLabel, '', '',
    fmt(totals.totalCostPriceList, 2),
    fmt(totals.totalCostClient, 2),
    fmt(totals.totalCostClientDealer, 2),
    fmt(totals.totalTvc, 2),
    fmt(totals.totalMdPriceList, 2),
    fmt(totals.totalMdClient, 2),
    fmt(totals.totalMdClientDealer, 2),
    fmtPct(totals.mrPriceListTotal),
    fmtPct(totals.mrClientTotal),
    fmtPct(totals.mrClientDealerTotal),
  ].join(';'));
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `РМ_${market === 'БЕЛАРУСЬ' ? 'BY' : 'RU'}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const demoData = `
Market,ClassТМЦ,ТМЦ_кратко,ТМЦ,Код,TVC,Цена
БЕЛАРУСЬ,Трубы,Труба ПЭ 100 PN10 d25,Труба полиэтиленовая ПЭ 100 PN10 d25 SDR17,TRB-PE100-25-10,1.25,285.50
БЕЛАРУСЬ,Трубы,Труба ПЭ 100 PN10 d32,Труба полиэтиленовая ПЭ 100 PN10 d32 SDR17,TRB-PE100-32-10,1.75,365.00
БЕЛАРУСЬ,Трубы,Труба ПЭ 100 PN10 d50,Труба полиэтиленовая ПЭ 100 PN10 d50 SDR17,TRB-PE100-50-10,3.45,720.00
БЕЛАРУСЬ,Трубы,Труба ПЭ 100 PN10 d63,Труба полиэтиленовая ПЭ 100 PN10 d63 SDR17,TRB-PE100-63-10,5.20,1080.50
БЕЛАРУСЬ,Фитинги,Муфта d25,Муфта соединительная ПЭ d25,FIT-CPL-25,0.45,85.00
БЕЛАРУСЬ,Фитинги,Муфта d32,Муфта соединительная ПЭ d32,FIT-CPL-32,0.75,135.50
БЕЛАРУСЬ,Фитинги,Уголок 90° d25,Уголок ПЭ 90° d25,FIT-ELB-25-90,0.55,110.00
БЕЛАРУСЬ,Фитинги,Уголок 90° d32,Уголок ПЭ 90° d32,FIT-ELB-32-90,0.95,185.00
БЕЛАРУСЬ,Клапаны,Кран шаровый d25,Кран шаровый ПЭ d25 PN16,VAL-BALL-25,3.20,450.00
БЕЛАРУСЬ,Клапаны,Кран шаровый d32,Кран шаровый ПЭ d32 PN16,VAL-BALL-32,4.80,680.50
РОССИЯ,Трубы,Труба ПЭ 100 PN10 d25,Труба полиэтиленовая ПЭ 100 PN10 d25 SDR17,TRB-PE100-25-10,1.25,275.50
РОССИЯ,Трубы,Труба ПЭ 100 PN10 d32,Труба полиэтиленовая ПЭ 100 PN10 d32 SDR17,TRB-PE100-32-10,1.75,355.00
РОССИЯ,Трубы,Труба ПЭ 100 PN10 d50,Труба полиэтиленовая ПЭ 100 PN10 d50 SDR17,TRB-PE100-50-10,3.45,695.00
РОССИЯ,Фитинги,Муфта d25,Муфта соединительная ПЭ d25,FIT-CPL-25,0.45,82.00
РОССИЯ,Фитинги,Муфта d32,Муфта соединительная ПЭ d32,FIT-CPL-32,0.75,128.50
РОССИЯ,Клапаны,Кран шаровый d25,Кран шаровый ПЭ d25 PN16,VAL-BALL-25,3.20,435.00
`;

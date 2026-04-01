export interface TvcItem {
  tmc: string;
  tmcShort: string;
  code: string;
  tvc: number;
}

export interface PriceItem {
  market: 'БЕЛАРУСЬ' | 'РОССИЯ';
  classТМЦ: string;
  tmc: string;
  tmcShort: string;
  code: string;
  price: number;
}

export interface CombinedItem extends PriceItem {
  tvc: number;
}

export interface TableRow {
  id: string;
  item: CombinedItem;
  qty: number;
  clientDiscount: number;
  clientPrice: number;
  clientTvc: number;
  lastEdited: 'discount' | 'price' | 'qty' | 'tvc';
}

export interface Params {
  euroRate: number;
  dealerDiscount: number;
}

export interface CalcResult {
  priceEur: number;
  clientPriceEur: number;
  costPriceList: number;
  costClient: number;
  costClientDealer: number;
  tvcTotal: number;
  mdPriceList: number;
  mdClient: number;
  mdClientDealer: number;
  devMdClient: number;
  devMdClientDealer: number;
  mrPriceList: number;
  mrClient: number;
  mrClientDealer: number;
}

export interface Totals {
  totalQty: number;
  effectiveDiscount: number;
  totalCostPriceList: number;
  totalCostClient: number;
  totalCostClientDealer: number;
  totalTvc: number;
  totalMdPriceList: number;
  totalMdClient: number;
  totalMdClientDealer: number;
  totalDevMdClient: number;
  totalDevMdClientDealer: number;
  mrPriceListTotal: number;
  mrClientTotal: number;
  mrClientDealerTotal: number;
}

export type Market = 'БЕЛАРУСЬ' | 'РОССИЯ';
export type FilterType = 'class' | 'tmcShort' | 'tmc';

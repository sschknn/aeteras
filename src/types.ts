export interface Item {
  id?: number;
  label: string;
  epoch: string;
  material: string;
  origin: string;
  image_hash?: string;
  confidence?: number;
  description?: string;
}

export interface Offer {
  id?: number;
  snapshot_id?: number;
  platform: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  url: string;
}

export interface PriceStats {
  price_min: number;
  price_max: number;
  price_median: number;
  platform_count: number;
}

export interface PriceSnapshot {
  id?: number;
  item_id?: number;
  ts: string;
  price_min: number;
  price_max: number;
  price_median: number;
  platform_count: number;
}

export interface ScanRecord {
  id: number;
  user_id: string;
  item_id: number;
  snapshot_id: number;
  ts: string;
  notes?: string;
  item: Item;
  pricing: {
    stats: PriceStats;
    offers: Offer[];
  };
}

export interface ScanResponse {
  scan: {
    id: number;
    ts: string;
    userId: string;
  };
  item: Item;
  pricing: {
    stats: PriceStats;
    offers: Offer[];
  };
}

export interface SamplePreset {
  id: string;
  name: string;
  epoch: string;
  material: string;
  origin: string;
  imageUrl: string;
  description: string;
}

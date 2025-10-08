export interface ExpressEntryDraw {
  id: number;
  date: string;
  type: 'general' | 'pnp' | 'cec' | 'category';
  category?: string;
  invitations: number;
  crs_min: number;
  tiebreak_ts?: string;
  source_url: string;
  created_at: string;
  updated_at: string;
}

export interface DrawSeriesData {
  labels: string[];
  crs: number[];
  itas: number[];
  items: DrawSeriesItem[];
  updatedAt: string;
}

export interface DrawSeriesItem {
  date: string;
  title: string;
  points: number;
  invitations: number;
  category?: string;
  source_url: string;
  type: string;
}

export interface DrawFilters {
  limit?: number;
  type?: string;
  category?: string;
}

export interface DrawSeriesFilters {
  window: '6m' | '12m' | 'all';
  type?: string;
}
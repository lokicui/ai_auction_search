export interface Asset {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  starting_price: number;
  status: string;
  source_url: string;
}

export interface ThinkingStep {
  step: string;
  detail: string;
  icon: string;
}

export interface AssetMatch {
  asset: Asset;
  score: number;
  reason: string;
}

export interface ChatResponse {
  thinking: ThinkingStep[];
  matches: AssetMatch[];
  summary: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  thinking?: ThinkingStep[];
  matches?: AssetMatch[];
  loading?: boolean;
}

export interface AssetListResponse {
  assets: Asset[];
  total: number;
  page: number;
  page_size: number;
}

export interface BaseItem {
  id: string;
  title: string;
  url: string;
  source?: string;
  publishedAt?: string; // ISO string
  summary?: string;
}

export type NewsItem = BaseItem;

export interface PaperItem extends BaseItem {
  authors?: string[];
  doi?: string;
  venue?: string;
  citations?: number;
}

export interface RepoItem extends BaseItem {
  repo?: string; // owner/name
  stars?: number;
  language?: string;
}

export type AnyItem = NewsItem | PaperItem | RepoItem;



export type SentimentType = 'Positive' | 'Neutral' | 'Negative';

export interface ArticleUniversityLink {
  university_id: number;
  university_name: string;
  short_name: string;
  university_short_name?: string;
  confidence_score: number;
}

export interface ArticleCategoryLink {
  category_id: number;
  category_name: string;
  confidence_score: number;
}

export interface SentimentData {
  sentiment: SentimentType;
  positive_score: number;
  neutral_score: number;
  negative_score: number;
  confirmation_status?: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  confirmed_by?: string;
  confirmed_at?: string;
}

export interface Article {
  id: number;
  source_id?: number;
  source_name: string;
  title: string;
  url: string;
  author?: string;
  excerpt?: string;
  summary?: string;
  image_url?: string;
  published_at: string;
  scraped_at: string;
  language: string;
  is_relevant: boolean;
  relevance_score: number;
  is_demo: boolean;
  universities: ArticleUniversityLink[];
  categories: ArticleCategoryLink[];
  sentiment: SentimentData;
  key_topics?: string[];
}

export interface ArticleDetail extends Article {
  content: string;
  content_hash: string;
  canonical_url?: string;
}

export interface UniversityAlias {
  id: number;
  alias: string;
}

export interface University {
  id: number;
  name: string;
  short_name: string;
  type?: string;
  accreditation?: string;
  description?: string;
  website?: string;
  logo?: string;
  city?: string;
  is_active: boolean;
  created_at: string;
  aliases: (UniversityAlias | string)[];
  article_count: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  trend?: string; // e.g. "+14.2%"
}

export interface Source {
  id: number;
  name: string;
  base_url: string;
  rss_url?: string;
  source_type: string;
  is_active: boolean;
  crawl_interval: number;
  last_crawled?: string;
  last_crawled_at?: string;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR' | 'CRAWLING';
  error_count: number;
  created_at: string;
  article_count: number;
  articles_count?: number;
  relevant_count: number;
}

export interface DashboardStats {
  total_articles: number;
  total_trend?: string;
  today_articles?: number;
  articles_today?: number;
  today_trend?: string;
  relevant_articles: number;
  relevant_trend?: string;
  monitored_universities: number;
  total_universities?: number;
  univ_trend?: string;
  active_sources: number;
  sources_trend?: string;
  positive_count?: number;
  positive_trend?: string;
  neutral_count?: number;
  neutral_trend?: string;
  negative_count?: number;
  negative_trend?: string;
  sentiment_positive_pct?: number;
  sentiment_neutral_pct?: number;
  sentiment_negative_pct?: number;
  crawler_status?: string;
  crawl_status?: string;
  ai_engine_status?: string;
  last_crawl_time?: string;
  last_crawled?: string;
  data_freshness_seconds?: number;
  uptime_percentage?: string;
}

export interface AIStatus {
  model_version: string;
  is_bootstrap: boolean;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  dataset_size: number;
  last_trained?: string;
  classes_count: number;
  status_label: string;
  queue_count?: number;
}

export interface AiModel {
  id: string;
  name: string;
  version: string;
  type: string;
  status: 'ACTIVE' | 'STANDBY' | 'NEEDS_RETRAINING';
  accuracy: number;
  samples: number;
  last_trained: string;
  description: string;
}

export interface AiPipelineNode {
  id?: string;
  step?: number;
  name?: string;
  label?: string;
  type?: string;
  desc?: string;
  sublabel?: string;
  status: 'ACTIVE' | 'PROCESSING' | 'IDLE';
  latency_ms?: number;
}

export interface AlertRule {
  id: number;
  name: string;
  condition: string;
  university?: string;
  sentiment?: SentimentType | string;
  keyword?: string;
  status: 'ACTIVE' | 'TRIGGERED' | 'PAUSED';
  created_at: string;
  trigger_count: number;
}

export interface AlertItem {
  id: number;
  title: string;
  message: string;
  article_id?: number;
  university_id?: number;
  alert_type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  is_read: boolean;
  created_at: string;
  source_name?: string;
  article_title?: string;
  article_url?: string;
}

export interface SystemLogItem {
  id: number;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  component?: string;
  module?: string;
  message: string;
  details?: string;
  created_at?: string;
  timestamp?: string;
}

export interface CrawlLogItem {
  id: number;
  source_id?: number;
  source_name?: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  articles_found: number;
  articles_new?: number;
  articles_relevant?: number;
  error_message?: string;
  duration_ms?: number;
  response_time_ms?: number;
  created_at?: string;
  crawled_at?: string;
}

export interface AnalyticsSummary {
  total_articles: number;
  relevant_articles: number;
  volume_trend: { date: string; total: number; relevant: number }[];
  share_of_voice: { name: string; full_name: string; count: number }[];
  sentiment_distribution: { name: string; value: number; color: string; count: number }[];
  category_distribution: { name: string; count: number }[];
  source_distribution: { name: string; count: number }[];
  trending_keywords: { text: string; value: number; trend: string }[];
}

export interface TrainingDataRecord {
  id: number;
  text: string;
  category: string;
  sentiment?: string;
  university?: string;
  is_relevant: boolean;
  created_at: string;
}

export interface NewsEvent {
  id: number;
  timestamp: string;
  title: string;
  source: string;
  university: string;
  category: string;
  sentiment: SentimentType;
  relevance: number;
  is_new?: boolean;
}

export interface GlobalSearchItem {
  id: string;
  type: 'article' | 'university' | 'source';
  title: string;
  subtitle: string;
  url: string;
}

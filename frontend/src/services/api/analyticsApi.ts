import { AnalyticsSummary } from '../../types';
import { apiGet } from './apiClient';

const EMPTY_ANALYTICS: AnalyticsSummary = {
  total_articles: 0,
  relevant_articles: 0,
  volume_trend: [],
  share_of_voice: [],
  sentiment_distribution: [],
  category_distribution: [],
  source_distribution: [],
  trending_keywords: [],
};

export const analyticsApi = {
  async getAnalyticsSummary(_timeRange?: string): Promise<AnalyticsSummary> {
    try {
      return await apiGet<AnalyticsSummary>('/analytics');
    } catch {
      return { ...EMPTY_ANALYTICS };
    }
  },

  async getTrends(): Promise<{ date: string; total: number; relevant: number }[]> {
    try {
      const data = await apiGet<AnalyticsSummary>('/analytics');
      return data.volume_trend ?? [];
    } catch {
      return [];
    }
  },

  async getShareOfVoice(): Promise<{ name: string; full_name: string; count: number }[]> {
    try {
      const data = await apiGet<AnalyticsSummary>('/analytics');
      return data.share_of_voice ?? [];
    } catch {
      return [];
    }
  },

  async getTrendingKeywords(): Promise<{ text: string; value: number; trend: string }[]> {
    try {
      const data = await apiGet<AnalyticsSummary>('/analytics');
      return data.trending_keywords ?? [];
    } catch {
      return [];
    }
  },
};

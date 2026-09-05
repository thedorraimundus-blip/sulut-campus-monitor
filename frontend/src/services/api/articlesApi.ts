import { Article, ArticleDetail } from '../../types';
import { apiGet, getAuthHeaders, API_BASE } from './apiClient';

export interface GetArticlesParams {
  search?: string;
  university_id?: number;
  category?: string;
  sentiment?: string;
  source_id?: number;
  is_relevant?: boolean;
  min_relevance?: number;
  limit?: number;
  skip?: number;
}

export const articlesApi = {
  async getArticles(params?: GetArticlesParams): Promise<Article[]> {
    try {
      return await apiGet<Article[]>('/articles', params as Record<string, string | number | boolean | undefined>);
    } catch {
      return [];
    }
  },

  async getArticleById(id: number): Promise<ArticleDetail | null> {
    try {
      return await apiGet<ArticleDetail>(`/articles/${id}`);
    } catch {
      return null;
    }
  },

  async confirmSentiment(
    articleId: number,
    status: 'CONFIRMED' | 'REJECTED',
    sentiment?: string
  ): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/articles/${articleId}/sentiment-confirmation`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, sentiment }),
      });
      if (!res.ok) throw new Error();
      return { success: true };
    } catch {
      return { success: false };
    }
  },
};

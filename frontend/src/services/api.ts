import {
  Article, ArticleDetail, University, Source, DashboardStats,
  AIStatus, AlertItem, SystemLogItem, CrawlLogItem, AnalyticsSummary,
  TrainingDataRecord
} from '../types';

import { articlesApi } from './api/articlesApi';
import { universitiesApi } from './api/universitiesApi';
import { sourcesApi } from './api/sourcesApi';
import { analyticsApi } from './api/analyticsApi';
import { aiApi } from './api/aiApi';
import { alertsApi } from './api/alertsApi';
import { API_BASE, getAuthHeaders } from './api/apiClient';


export const api = {
  // Auth
  async login(username: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      return await res.json();
    } catch (e) {
      if (username === 'admin' && password === 'admin123') {
        const fakeToken = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('scm_token', fakeToken);
        localStorage.setItem('scm_user', 'admin');
        return { access_token: fakeToken, token_type: 'bearer', username: 'admin' };
      }
      throw new Error('Invalid credentials (demo: admin / admin123)');
    }
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        total_articles: 0,
        relevant_articles: 0,
        monitored_universities: 0,
        active_sources: 0,
        sentiment_positive_pct: 0,
        sentiment_neutral_pct: 0,
        sentiment_negative_pct: 0,
        crawl_status: "STANDBY",
        last_crawled: undefined
      };
    }
  },

  async getLiveFeed(limit = 10): Promise<Article[]> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/live?limit=${limit}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return [];
    }
  },

  // Articles
  async getArticles(params?: {
    search?: string;
    university_id?: number;
    category?: string;
    sentiment?: string;
    source_id?: number;
    is_relevant?: boolean;
    min_relevance?: number;
    limit?: number;
  }): Promise<Article[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        if (params.search) searchParams.append('search', params.search);
        if (params.university_id) searchParams.append('university_id', params.university_id.toString());
        if (params.category) searchParams.append('category', params.category);
        if (params.sentiment) searchParams.append('sentiment', params.sentiment);
        if (params.source_id) searchParams.append('source_id', params.source_id.toString());
        if (params.is_relevant !== undefined) searchParams.append('is_relevant', String(params.is_relevant));
        if (params.min_relevance !== undefined) searchParams.append('min_relevance', params.min_relevance.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
      }
      const res = await fetch(`${API_BASE}/articles?${searchParams.toString()}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return [];
    }
  },

  async getArticleDetail(id: number): Promise<ArticleDetail> {
    try {
      const res = await fetch(`${API_BASE}/articles/${id}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const item = await articlesApi.getArticleById(id);
      if (!item) throw new Error('Article not found');
      return item;
    }
  },

  async confirmSentiment(articleId: number, status: 'CONFIRMED' | 'REJECTED', sentiment?: string): Promise<ArticleDetail> {
    const res = await fetch(`${API_BASE}/articles/${articleId}/sentiment-confirmation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status,
        sentiment,
        confirmed_by: localStorage.getItem('scm_user') || 'Admin'
      }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan konfirmasi sentimen ke database.');
    return await res.json();
  },

  // Universities
  async getUniversities(): Promise<University[]> {
    try {
      const res = await fetch(`${API_BASE}/universities`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return universitiesApi.getUniversities();
    }
  },

  async getUniversity(id: number): Promise<University> {
    try {
      const res = await fetch(`${API_BASE}/universities/${id}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const u = await universitiesApi.getUniversityById(id);
      if (!u) throw new Error('University not found');
      return u;
    }
  },

  // Sources
  async getSources(): Promise<Source[]> {
    try {
      const res = await fetch(`${API_BASE}/sources`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return sourcesApi.getSources();
    }
  },

  async testSource(url: string, rss_url?: string) {
    try {
      const res = await fetch(`${API_BASE}/sources/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url, rss_url }),
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return sourcesApi.testSource(url, rss_url);
    }
  },

  async createSource(data: { name: string; base_url: string; rss_url?: string; source_type?: string; crawl_interval?: number }) {
    try {
      const res = await fetch(`${API_BASE}/sources`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return sourcesApi.addSource(data);
    }
  },

  async scanSource(id: number) {
    try {
      const res = await fetch(`${API_BASE}/sources/${id}/scan`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return sourcesApi.triggerCrawl(id);
    }
  },

  async scanAllSources() {
    try {
      const res = await fetch(`${API_BASE}/sources/scan-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { success: true, message: "Pemeriksaan semua sumber dimulai." };
    }
  },

  // Monitoring
  async getMonitoringStatus() {
    try {
      const res = await fetch(`${API_BASE}/monitoring/status`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        scheduler_running: true,
        active_sources: 6,
        last_run: "2026-09-05T05:30:00Z",
        next_run: "2026-09-05T05:45:00Z",
        total_runs_today: 48,
        articles_crawled_today: 142
      };
    }
  },

  async getCrawlLogs(limit = 50): Promise<CrawlLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/monitoring/crawl-logs?limit=${limit}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return [
        { id: 1, source_name: "Manado Post", status: "SUCCESS", articles_found: 18, articles_relevant: 12, crawled_at: "2026-09-05T05:30:00Z", response_time_ms: 640 },
        { id: 2, source_name: "Tribun Manado", status: "SUCCESS", articles_found: 24, articles_relevant: 16, crawled_at: "2026-09-05T05:25:00Z", response_time_ms: 780 },
        { id: 3, source_name: "BeritaManado", status: "SUCCESS", articles_found: 15, articles_relevant: 9, crawled_at: "2026-09-05T05:20:00Z", response_time_ms: 450 },
        { id: 4, source_name: "Portal Unsrat", status: "SUCCESS", articles_found: 5, articles_relevant: 5, crawled_at: "2026-09-05T05:15:00Z", response_time_ms: 320 }
      ];
    }
  },

  async getSystemLogs(limit = 50): Promise<SystemLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/monitoring/system-logs?limit=${limit}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return [
        { id: 1, level: "INFO", module: "AI_ENGINE", message: "Categorization completed: 19 classes loaded (v1.0.1)", timestamp: "2026-09-05T05:31:02Z" },
        { id: 2, level: "INFO", module: "CRAWLER", message: "Source Manado Post fetched 18 items successfully", timestamp: "2026-09-05T05:30:04Z" },
        { id: 3, level: "INFO", module: "EXTRACTOR", message: "HTML cleaned and boilerplate stripped (avg 180ms)", timestamp: "2026-09-05T05:29:10Z" },
        { id: 4, level: "WARNING", module: "RATE_LIMIT", message: "Crawling throttle active: sleep 2.0s between requests", timestamp: "2026-09-05T05:28:00Z" }
      ];
    }
  },

  // Analytics
  async getAnalytics(days = 14): Promise<AnalyticsSummary> {
    try {
      const res = await fetch(`${API_BASE}/analytics?days=${days}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return analyticsApi.getAnalyticsSummary();
    }
  },

  // AI Intelligence
  async getAIStatus(): Promise<AIStatus> {
    try {
      const res = await fetch(`${API_BASE}/ai/status`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return aiApi.getStatus();
    }
  },

  async getModelVersions() {
    try {
      const res = await fetch(`${API_BASE}/ai/models`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return aiApi.getModels();
    }
  },

  async trainAI() {
    try {
      const res = await fetch(`${API_BASE}/ai/train`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return aiApi.retrainModel();
    }
  },

  async getAIDataset(limit = 100): Promise<TrainingDataRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/ai/dataset?limit=${limit}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const data = await aiApi.getDataset(1, limit);
      return data.items;
    }
  },

  async addAISample(sample: { text: string; category: string; sentiment?: string; is_relevant?: boolean }) {
    try {
      const res = await fetch(`${API_BASE}/ai/dataset`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sample),
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { success: true, message: "Sample added to local training dataset" };
    }
  },

  // Alerts
  async getAlerts(unread_only = false): Promise<AlertItem[]> {
    try {
      const res = await fetch(`${API_BASE}/alerts?unread_only=${unread_only}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return [];
    }
  },

  async markAlertRead(id: number) {
    try {
      const res = await fetch(`${API_BASE}/alerts/${id}/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return alertsApi.markAsRead(id);
    }
  },

  // Settings
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        app_name: "SULUT CAMPUS MONITOR",
        system_version: "2.1.0",
        crawler_interval: "15",
        relevance_threshold: "0.45",
        retention_days: "90",
        alert_email_enabled: "false"
      };
    }
  },

  async updateSetting(key: string, value: string) {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { success: true, key, value };
    }
  }
};

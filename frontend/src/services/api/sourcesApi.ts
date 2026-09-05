import { Source } from '../../types';
import { apiGet, apiPost, getAuthHeaders, API_BASE } from './apiClient';

export const sourcesApi = {
  async getSources(): Promise<Source[]> {
    try {
      return await apiGet<Source[]>('/sources');
    } catch {
      return [];
    }
  },

  async testSource(url: string, rss_url?: string): Promise<{
    success: boolean;
    valid_url: boolean;
    robots_allowed: boolean;
    rss_detected: boolean;
    detected_rss?: string;
    rss_url?: string | null;
    sample_count: number;
    sample_articles_found: number;
    message: string;
  }> {
    try {
      return await apiPost('/sources/test', { url, rss_url });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        valid_url: false,
        robots_allowed: false,
        rss_detected: false,
        sample_count: 0,
        sample_articles_found: 0,
        message: `Gagal menguji sumber: ${msg}`,
      };
    }
  },

  async addSource(data: {
    name: string;
    base_url: string;
    rss_url?: string;
    source_type?: string;
    crawl_interval?: number;
  }): Promise<Source> {
    const res = await fetch(`${API_BASE}/sources`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Gagal menambahkan sumber: ${res.status}`);
    return res.json();
  },

  async updateSource(
    id: number,
    data: Partial<{ name: string; base_url: string; rss_url: string; crawl_interval: number; is_active: boolean }>
  ): Promise<Source> {
    const res = await fetch(`${API_BASE}/sources/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Gagal memperbarui sumber: ${res.status}`);
    return res.json();
  },

  async deleteSource(id: number): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/sources/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async triggerCrawl(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const data = await apiPost<{ success: boolean; message: string }>(`/sources/${id}/scan`, {}, false);
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, message: `Gagal memulai crawl: ${msg}` };
    }
  },

  async triggerCrawlAll(): Promise<{ success: boolean; message: string }> {
    try {
      const data = await apiPost<{ success: boolean; message: string }>('/sources/scan-all', {}, false);
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, message: `Gagal memulai crawl semua: ${msg}` };
    }
  },
};

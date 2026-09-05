import { AIStatus, TrainingDataRecord } from '../../types';
import { apiGet, apiPost, getAuthHeaders, API_BASE } from './apiClient';

// Fallback defaults shown when backend unreachable (never fake metrics)
const OFFLINE_STATUS: AIStatus = {
  model_version: 'offline',
  is_bootstrap: true,
  accuracy: 0,
  precision: 0,
  recall: 0,
  f1_score: 0,
  dataset_size: 0,
  classes_count: 0,
  status_label: 'Backend Offline',
};

export const aiApi = {
  async getStatus(): Promise<AIStatus> {
    try {
      return await apiGet<AIStatus>('/ai/status');
    } catch {
      return { ...OFFLINE_STATUS };
    }
  },

  async getModels(): Promise<unknown[]> {
    try {
      return await apiGet<unknown[]>('/ai/models');
    } catch {
      return [];
    }
  },

  async getPipelineNodes(): Promise<unknown[]> {
    // Pipeline diagram is structural — no backend call needed
    return [
      { step: 1, label: 'Text Cleaning', desc: 'Normalisasi teks, hapus karakter khusus', status: 'ACTIVE' },
      { step: 2, label: 'Tokenizer (Indonesian)', desc: 'Tokenisasi & stopword removal bahasa Indonesia', status: 'ACTIVE' },
      { step: 3, label: 'Sastrawi Stemmer', desc: 'Stemming morfologi Indonesia (LRU cached)', status: 'ACTIVE' },
      { step: 4, label: 'Relevance Scorer', desc: 'Skor relevansi kampus 0–100', status: 'ACTIVE' },
      { step: 5, label: 'University Detector', desc: 'Exact + alias + fuzzy match 15 kampus Sulut', status: 'ACTIVE' },
      { step: 6, label: 'Category Classifier', desc: 'TF-IDF + Naive Bayes, 19 kategori', status: 'ACTIVE' },
      { step: 7, label: 'Sentiment Analyzer', desc: 'Leksikon + rule-based (Positif/Netral/Negatif)', status: 'ACTIVE' },
      { step: 8, label: 'Extractive Summarizer', desc: 'TF-IDF salience scoring, 2–4 kalimat', status: 'ACTIVE' },
    ];
  },

  async getDataset(
    page = 1,
    limit = 20,
    search?: string
  ): Promise<{ items: TrainingDataRecord[]; total: number }> {
    try {
      const params: Record<string, string | number | boolean | undefined> = { page, limit };
      if (search) params['search'] = search;
      const res = await fetch(
        `${API_BASE}/ai/dataset?${new URLSearchParams(
          Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
        )}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error();
      return res.json();
    } catch {
      return { items: [], total: 0 };
    }
  },

  async addTrainingSample(data: {
    text: string;
    category: string;
    sentiment?: string;
    university?: string;
    is_relevant?: boolean;
  }): Promise<{ success: boolean }> {
    try {
      await apiPost('/ai/dataset', data, true);
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async retrainModel(): Promise<{ success: boolean; message: string; version: string }> {
    try {
      const res = await fetch(`${API_BASE}/ai/train`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Retrain gagal: ${res.status}`);
      const data = await res.json();
      return {
        success: true,
        message: data.message || 'Model berhasil dilatih ulang.',
        version: data.version || data.model_version || 'v-new',
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal melatih model.';
      return { success: false, message: msg, version: '' };
    }
  },
};

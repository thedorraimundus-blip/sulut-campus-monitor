import { AlertItem } from '../../types';
import { apiGet, apiPost, getAuthHeaders, API_BASE } from './apiClient';

export const alertsApi = {
  async getAlerts(unreadOnly = false): Promise<AlertItem[]> {
    try {
      return await apiGet<AlertItem[]>('/alerts', { unread_only: unreadOnly });
    } catch {
      return [];
    }
  },

  async markAsRead(id: number): Promise<{ success: boolean }> {
    try {
      await apiPost(`/alerts/${id}/read`, undefined, true);
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/alerts/mark-all-read`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      return { success: true };
    } catch {
      return { success: false };
    }
  },
};

import { University } from '../../types';
import { apiGet } from './apiClient';

export const universitiesApi = {
  async getUniversities(): Promise<University[]> {
    try {
      return await apiGet<University[]>('/universities');
    } catch {
      return [];
    }
  },

  async getUniversityById(id: number): Promise<University | null> {
    try {
      return await apiGet<University>(`/universities/${id}`);
    } catch {
      return null;
    }
  },
};

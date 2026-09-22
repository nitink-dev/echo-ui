import { API_URLS } from '../../auth/permissions/apiConfig';
import apiClient from './apiClient';

export const formLabelsService = {
  fetchLabels: async (formKey: string): Promise<Record<string, string>> => {
    const res = await apiClient.get(API_URLS.config.formLabels.build({ formKey }));
    return res.data;
  }
};

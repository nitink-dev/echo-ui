import { API_URLS } from "../../auth/permissions/apiConfig";
import apiClient from "./apiClient";
export const enrichmentService = {
  fetchTool: async (toolKey: string) => {
    const res = await apiClient.get(`${API_URLS.enrichment.getTool.build({ toolKey })}`);
    const data = res.data?.data || res.data?.[toolKey] || res.data;
    return { toolKey, data };
  },

  patchTool: async (toolKey: string, body: any) => {
    const res = await apiClient.patch(`${API_URLS.enrichment.getTool.build({ toolKey })}`, body);
    const data = res.data?.data || res.data?.[toolKey] || res.data;
    return { toolKey, data };
  }
};
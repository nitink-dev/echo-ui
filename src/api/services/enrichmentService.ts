import apiClient from "./apiClient";


export const SERVICE_URL = "/api/enrichment/tools";

export const enrichmentService = {
 
  fetchTool: async (toolKey: string) => {
    const res = await apiClient.get(`${SERVICE_URL}/${toolKey}`);
    const data = res.data?.data || res.data?.[toolKey] || res.data;
    return { toolKey, data };
  },

  patchTool: async (toolKey: string, body: any) => {
    const res = await apiClient.patch(`${SERVICE_URL}/${toolKey}`, body);
    const data = res.data?.data || res.data?.[toolKey] || res.data;
    return { toolKey, data };
  }
};
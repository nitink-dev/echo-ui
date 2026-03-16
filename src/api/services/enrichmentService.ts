import apiClient from "./apiClient";

export const enrichmentService = {
  // Fetch tool config
  fetchTool: async (toolKey: string) => {
    const res = await apiClient.get(`/api/enrichment/tools/${toolKey}`);
    const data = res.data?.data || res.data?.[toolKey] || res.data;
    return { toolKey, data };
  },

  // Patch tool config
  patchTool: async (toolKey: string, body: any) => {
    const res = await apiClient.patch(`/api/enrichment/tools/${toolKey}`, body);
    const data = res.data?.data || res.data?.[toolKey] || res.data;
    return { toolKey, data };
  }
};
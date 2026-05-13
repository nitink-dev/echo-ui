import { usePermissions } from "../../../../auth/permissions/usePermissions";
import { BASE_URL } from "../../../../api/services/enrichmentService";

export const useEnrichmentPermissions = () => {
  const { canPatch, canPut } =
    usePermissions();

  return {
    canEdit:
      canPatch(
        BASE_URL
      ) ||
      canPut(
        BASE_URL
      ),
  };
};
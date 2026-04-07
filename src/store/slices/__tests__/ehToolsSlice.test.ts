import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  fetchEhTool,
  patchEhTool,
} from "../ehToolsSlice";
import { enrichmentService } from "../../../api/services/enrichmentService";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock enrichmentService
vi.mock("../../../api/services/enrichmentService", () => ({
  enrichmentService: {
    fetchTool: vi.fn(),
    patchTool: vi.fn(),
  },
}));

describe("ehToolsSlice", () => {
  const createStore = () =>
    configureStore({
      reducer: {
        ehTools: reducer,
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the initial state", () => {
    const store = createStore();
    const state = store.getState().ehTools;

    expect(state).toEqual({
      dicomReceiver: null,
      lisConnector: null,
      enrichmentService: null,
      exportService: null,
      hl7Connector: null,
      emailService: null,
      loading: false,
      error: null,
    });
  });

  it("should handle fetchEhTool success", async () => {
    const store = createStore();

    (enrichmentService.fetchTool as any).mockResolvedValue({
      data: { data: { enabled: true } },
    });

    await store.dispatch(fetchEhTool({ toolKey: "eh-dicom-receiver" }));

    const state = store.getState().ehTools;

    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.dicomReceiver).toEqual({ enabled: true });
  });

  it("should handle fetchEhTool failure", async () => {
    const store = createStore();

    (enrichmentService.fetchTool as any).mockRejectedValue({
      response: { data: "Fetch failed" },
    });

    await store.dispatch(fetchEhTool({ toolKey: "eh-lis-connector" }));

    const state = store.getState().ehTools;

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Fetch failed");
    expect(state.lisConnector).toBeNull();
  });

  it("should handle patchEhTool success", async () => {
    const store = createStore();

    (enrichmentService.patchTool as any).mockResolvedValue({
      data: { data: { retries: 3 } },
    });

    await store.dispatch(
      patchEhTool({
        toolKey: "eh-export-service",
        body: { retries: 3 },
      })
    );

    const state = store.getState().ehTools;

    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.exportService).toEqual({ retries: 3 });
  });

  it("should handle patchEhTool failure", async () => {
    const store = createStore();

    (enrichmentService.patchTool as any).mockRejectedValue({
      message: "Patch failed",
    });

    await store.dispatch(
      patchEhTool({
        toolKey: "eh-email-service",
        body: { enabled: false },
      })
    );

    const state = store.getState().ehTools;

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Patch failed");
    expect(state.emailService).toBeNull();
  });
});

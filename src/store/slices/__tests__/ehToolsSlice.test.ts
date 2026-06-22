import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  fetchEhTool,
  patchEhTool,
  updateToolState,
} from "../ehToolsSlice";
import { enrichmentService } from "../../../api/services/enrichmentService";
import { describe, it, expect, vi, beforeEach } from "vitest";

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
      lis: null,
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

  it("should handle fetchEhTool for lis tool key", async () => {
    const store = createStore();

    (enrichmentService.fetchTool as any).mockResolvedValue({
      data: { data: { endpoint: "http://lis" } },
    });

    await store.dispatch(fetchEhTool({ toolKey: "lis" }));

    const state = store.getState().ehTools;
    expect(state.lis).toEqual({ endpoint: "http://lis" });
  });

  it("should merge state via updateToolState reducer", () => {
    const store = createStore();

    store.dispatch(
      updateToolState({ toolKey: "eh-dicom-receiver", data: { enabled: true } })
    );

    store.dispatch(
      updateToolState({ toolKey: "eh-dicom-receiver", data: { retries: 3 } })
    );

    expect(store.getState().ehTools.dicomReceiver).toEqual({
      enabled: true,
      retries: 3,
    });
  });

  it("should ignore patchEhTool response with only junk keys", async () => {
    const store = createStore();

    store.dispatch(
      updateToolState({ toolKey: "eh-hl7-connector", data: { host: "localhost" } })
    );

    (enrichmentService.patchTool as any).mockResolvedValue({
      data: { data: { success: true, message: "ok" } },
    });

    await store.dispatch(
      patchEhTool({
        toolKey: "eh-hl7-connector",
        body: { host: "updated" },
      })
    );

    expect(store.getState().ehTools.hl7Connector).toEqual({ host: "localhost" });
  });

  it("should set loading true while fetchEhTool is pending", async () => {
    const store = createStore();
    let resolveFetch: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    (enrichmentService.fetchTool as any).mockReturnValue(fetchPromise);

    const dispatchPromise = store.dispatch(fetchEhTool({ toolKey: "eh-dicom-receiver" }));
    expect(store.getState().ehTools.loading).toBe(true);

    resolveFetch!({ data: { data: { enabled: false } } });
    await dispatchPromise;

    expect(store.getState().ehTools.loading).toBe(false);
  });
});

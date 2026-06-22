import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

vi.mock("./hooks", () => ({
  useAppDispatch: () => vi.fn((action: any) => action),
}));

vi.mock("./hooks/useCrossTabAuth", () => ({
  useCrossTabAuth: () => {},
}));

vi.mock("./auth/permissions/usePermissions", () => ({
  usePermissions: () => ({
    canAccess: () => true,
    configLoaded: true,
  }),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

const authReducer = (
  state = {
    isLoggedIn: true,
    securityConfigLoaded: true,
    scopes: ["platform.read"],
    securityConfig: [],
    user: "test-user",
    role: "ROLE_ADMIN",
    loading: false,
    error: null,
    displayName: "Test User",
  }
) => state;

const scannersReducer = (state = { items: [], loading: false, error: null }) => state;

const metadataReducer = (
  state = { hospitals: [], departments: [], dicomStores: {}, locations: [], loading: false }
) => state;

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      scanners: scannersReducer,
      metadata: metadataReducer,
      qa: (state = { qaParameters: [], dicomStores: [], dicomStoreAddress: "", loading: false, error: null }) => state,
      health: (state = { thirdParties: [], microservices: [], dependencies: null, loading: false }) => state,
      ehTools: (state = { loading: false, error: null }) => state,
    },
  });

describe("<App>", () => {
  it("should render the main layout when logged in", () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(document.body.textContent?.length).toBeGreaterThan(0);
  });
});

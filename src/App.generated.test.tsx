import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import App from "./App";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
});

const authReducer = () => ({
  isLoggedIn: true
});

const scannersReducer = () => ({
  items: [],
  loading: false
});

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      scanners: scannersReducer
    }
  });

describe("<App>", () => {
  it("should render component", () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  });
});
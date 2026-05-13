import React from "react";
import ReactDOM from "react-dom/client";
import { Provider, useSelector } from "react-redux";

import App from "./App";
import "./index.css";

import { store } from "./store/store";

import { PermissionProvider } from "./auth/permissions/permission-context";

function PermissionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const scopes = useSelector(
    (state: any) => state.auth.scopes
  );

  const securityConfig = useSelector(
    (state: any) => state.auth.securityConfig
  );

  return (
    <PermissionProvider
      scopes={scopes}
      securityConfig={securityConfig}
    >
      {children}
    </PermissionProvider>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <Provider store={store}>
    <PermissionWrapper>
      <App />
    </PermissionWrapper>
  </Provider>
);
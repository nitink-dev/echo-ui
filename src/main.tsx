import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import { store } from "./store/store";
import { SlideScanProvider } from "./components/features/status/SlideScanContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <SlideScanProvider>
      <App />
    </SlideScanProvider>
  </Provider>,
);
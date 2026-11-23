import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { startRouter } from "@/lib/router";
import { App } from "./App";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { AuthProvider } from "./lib/auth";
import "./styles.css";

const container = document.getElementById("root");
if (container) {
  startRouter();
  createRoot(container).render(
    <StrictMode>
      <AuthProvider>
        <App />
        <LoadingIndicator />
        <Toaster
          position="bottom-right"
          closeButton
          richColors
          toastOptions={{
            style: { fontFamily: "Figtree, system-ui, sans-serif" },
          }}
        />
      </AuthProvider>
    </StrictMode>,
  );
}

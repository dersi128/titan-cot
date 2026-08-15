import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.tsx";
import { hasClerkPublishableKey } from "./auth/TitanAuthGate";
import { titanClerkAppearance } from "./auth/clerkAppearance";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(
  hasClerkPublishableKey() ? (
    <ClerkProvider publishableKey={publishableKey} appearance={titanClerkAppearance}>
      {tree}
    </ClerkProvider>
  ) : (
    tree
  ),
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.tsx";
import { hasClerkPublishableKey } from "./auth/TitanAuthGate";
import { titanClerkAppearance } from "./auth/clerkAppearance";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

/** Production on *.vercel.app must talk to Clerk via same-origin /__clerk proxy. */
const clerkProxyUrl = publishableKey.startsWith("pk_live_")
  ? "https://titan-cot.vercel.app/__clerk"
  : undefined;

/** Keep waitlist on our app — avoid Clerk Account Portal /waitlist 404. */
const waitlistUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/#waitlist`
    : "https://titan-cot.vercel.app/#waitlist";

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(
  hasClerkPublishableKey() ? (
    <ClerkProvider
      publishableKey={publishableKey}
      proxyUrl={clerkProxyUrl}
      waitlistUrl={waitlistUrl}
      appearance={titanClerkAppearance}
    >
      {tree}
    </ClerkProvider>
  ) : (
    tree
  ),
);

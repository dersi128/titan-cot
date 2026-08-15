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

const appOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://titan-cot.vercel.app";

/** Keep auth flows on our app — avoid Clerk Account Portal 404s. */
const signInUrl = `${appOrigin}/sign-in`;
const signUpUrl = `${appOrigin}/sign-up`;
const waitlistUrl = `${appOrigin}/waitlist`;

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
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      waitlistUrl={waitlistUrl}
      appearance={titanClerkAppearance}
    >
      {tree}
    </ClerkProvider>
  ) : (
    tree
  ),
);

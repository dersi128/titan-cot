import { useState, type ReactNode } from "react";
import { SignedIn, SignedOut, SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { TitanLogo } from "../components/TitanLogo";
import { useTitanI18n } from "../i18n";
import { titanClerkAppearance } from "./clerkAppearance";

type TitanAuthGateProps = {
  children: ReactNode;
};

function AuthLoading() {
  const { t } = useTitanI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07080a] text-sm text-stone-500">
      {t("auth.loading")}
    </div>
  );
}

function AuthMissingKey() {
  const { t } = useTitanI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07080a] px-4">
      <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-950/20 px-5 py-4 text-sm text-rose-100/90">
        <p className="font-semibold text-rose-200">{t("auth.missingKeyTitle")}</p>
        <p className="mt-2 text-rose-100/70">{t("auth.missingKeyBody")}</p>
      </div>
    </div>
  );
}

function AuthLanding() {
  const { t } = useTitanI18n();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#07080a] px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(46,168,255,0.18), transparent 55%)",
        }}
      />
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <TitanLogo className="h-14 w-auto" showWordmark={false} />
          <p className="mt-4 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-titan-gold/85">
            {t("auth.eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-wide text-stone-50">
            {t("auth.title")}
          </h1>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-stone-500">
            {t("auth.subtitle")}
          </p>
        </div>

        <div className="mb-4 flex rounded-lg border border-white/10 bg-black/30 p-1">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={`flex-1 rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition ${
              mode === "sign-in"
                ? "bg-titan-gold/15 text-titan-gold"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {t("auth.signIn")}
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={`flex-1 rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition ${
              mode === "sign-up"
                ? "bg-titan-gold/15 text-titan-gold"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {t("auth.signUp")}
          </button>
        </div>

        <div className="flex justify-center">
          {mode === "sign-in" ? (
            <SignIn
              routing="hash"
              appearance={titanClerkAppearance}
              forceRedirectUrl="/"
              fallbackRedirectUrl="/"
            />
          ) : (
            <SignUp
              routing="hash"
              appearance={titanClerkAppearance}
              forceRedirectUrl="/"
              fallbackRedirectUrl="/"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AuthSessionGate({ children }: { children: ReactNode }) {
  const { isLoaded } = useAuth();
  if (!isLoaded) return <AuthLoading />;

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <AuthLanding />
      </SignedOut>
    </>
  );
}

export function TitanAuthGate({ children }: TitanAuthGateProps) {
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  if (!key) return <AuthMissingKey />;

  return <AuthSessionGate>{children}</AuthSessionGate>;
}

export function hasClerkPublishableKey(): boolean {
  return Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim());
}

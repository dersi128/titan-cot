import { useEffect, useState, type ReactNode } from "react";
import { SignedIn, SignedOut, SignIn, Waitlist, useAuth } from "@clerk/clerk-react";
import { TitanInstitutionalBackdrop } from "../components/TitanInstitutionalBackdrop";
import { TitanLogo } from "../components/TitanLogo";
import { LanguageSwitcher, useTitanI18n } from "../i18n";
import { titanClerkAppearance } from "./clerkAppearance";

type TitanAuthGateProps = {
  children: ReactNode;
};

const SESSION_LOAD_TIMEOUT_MS = 10_000;

function isValidPublishableKey(key: string | undefined): key is string {
  const v = key?.trim() ?? "";
  return v.startsWith("pk_test_") || v.startsWith("pk_live_");
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="titan-auth-page relative min-h-screen overflow-hidden">
      <TitanInstitutionalBackdrop />
      <div className="titan-auth-page__veil pointer-events-none absolute inset-0 z-[1]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function AuthLoading() {
  const { t } = useTitanI18n();
  return (
    <AuthShell>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <TitanLogo className="titan-auth-logo h-16 w-auto opacity-90" showWordmark={false} />
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
          {t("auth.loading")}
        </p>
      </div>
    </AuthShell>
  );
}

function AuthErrorCard({ title, body }: { title: string; body: string }) {
  return (
    <AuthShell>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-950/35 px-5 py-4 text-sm text-rose-100/90 backdrop-blur-md">
          <p className="font-semibold text-rose-200">{title}</p>
          <p className="mt-2 text-rose-100/70">{body}</p>
        </div>
      </div>
    </AuthShell>
  );
}

function AuthMissingKey() {
  const { t } = useTitanI18n();
  return <AuthErrorCard title={t("auth.missingKeyTitle")} body={t("auth.missingKeyBody")} />;
}

function AuthInvalidKey() {
  const { t } = useTitanI18n();
  return <AuthErrorCard title={t("auth.invalidKeyTitle")} body={t("auth.invalidKeyBody")} />;
}

function AuthSessionStuck() {
  const { t } = useTitanI18n();
  return <AuthErrorCard title={t("auth.sessionStuckTitle")} body={t("auth.sessionStuckBody")} />;
}

function AuthLanding() {
  const { t } = useTitanI18n();
  const [mode, setMode] = useState<"sign-in" | "waitlist">("sign-in");

  return (
    <AuthShell>
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>

      <div className="mx-auto grid min-h-screen w-full max-w-[1120px] items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-10">
        <section className="titan-auth-brand mx-auto max-w-lg text-center lg:mx-0 lg:text-left">
          <div className="titan-auth-brand__logo-wrap mx-auto lg:mx-0">
            <TitanLogo className="titan-auth-logo h-[4.5rem] w-auto sm:h-20" showWordmark={false} />
          </div>
          <p className="mt-7 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-titan-gold/90">
            {t("auth.eyebrow")}
          </p>
          <h1 className="titan-auth-brand__title mt-3 font-display text-[2rem] font-bold uppercase leading-[1.05] tracking-[0.06em] text-stone-50 sm:text-[2.45rem]">
            {t("auth.heroTitle")}
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-stone-400 lg:text-[15px]">
            {t("auth.subtitle")}
          </p>
          <ul className="mt-8 hidden gap-3 text-left sm:grid">
            <li className="titan-auth-feature">{t("auth.feature1")}</li>
            <li className="titan-auth-feature">{t("auth.feature2")}</li>
            <li className="titan-auth-feature">{t("auth.feature3")}</li>
          </ul>
        </section>

        <section className="titan-auth-panel mx-auto w-full max-w-[440px] lg:mx-0 lg:justify-self-end">
          <div className="titan-auth-panel__inner">
            <div className="mb-1 flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-titan-gold/80">
                  {t("auth.access")}
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold tracking-wide text-stone-100">
                  {mode === "sign-in" ? t("auth.signInTitle") : t("auth.waitlistTitle")}
                </h2>
              </div>
            </div>

            <div className="titan-auth-tabs mt-4 mb-5 flex rounded-lg border border-white/10 bg-black/35 p-1">
              <button
                type="button"
                onClick={() => setMode("sign-in")}
                className={`titan-auth-tabs__btn ${mode === "sign-in" ? "is-active" : ""}`}
              >
                {t("auth.signIn")}
              </button>
              <button
                type="button"
                onClick={() => setMode("waitlist")}
                className={`titan-auth-tabs__btn ${mode === "waitlist" ? "is-active" : ""}`}
              >
                {t("auth.waitlist")}
              </button>
            </div>

            <div className="titan-auth-clerk flex justify-center">
              {mode === "sign-in" ? (
                <SignIn
                  routing="hash"
                  appearance={titanClerkAppearance}
                  forceRedirectUrl="/"
                  fallbackRedirectUrl="/"
                />
              ) : (
                <Waitlist appearance={titanClerkAppearance} />
              )}
            </div>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-stone-600">
              {t("auth.disclaimer")}
            </p>
          </div>
        </section>
      </div>
    </AuthShell>
  );
}

function AuthSessionGate({ children }: { children: ReactNode }) {
  const { isLoaded } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setTimedOut(false);
      return;
    }
    const id = window.setTimeout(() => setTimedOut(true), SESSION_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [isLoaded]);

  if (!isLoaded && timedOut) return <AuthSessionStuck />;
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
  if (!isValidPublishableKey(key)) return <AuthInvalidKey />;

  return <AuthSessionGate>{children}</AuthSessionGate>;
}

export function hasClerkPublishableKey(): boolean {
  return isValidPublishableKey(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
}

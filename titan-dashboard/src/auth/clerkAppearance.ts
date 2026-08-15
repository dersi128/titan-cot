/** Dark TITAN shell for Clerk SignIn / SignUp / UserButton. */
export const titanClerkAppearance = {
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: "#2ea8ff",
    colorBackground: "transparent",
    colorInputBackground: "rgba(8, 10, 14, 0.85)",
    colorInputText: "#f5f5f4",
    colorText: "#e7e5e4",
    colorTextSecondary: "#78716c",
    colorDanger: "#fb7185",
    colorNeutral: "#a8a29e",
    borderRadius: "0.55rem",
    fontFamily: '"Outfit", system-ui, sans-serif',
    fontFamilyButtons: '"Outfit", system-ui, sans-serif',
    fontSize: "14px",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-[400px]",
    cardBox: "w-full shadow-none",
    card: "titan-auth-clerk-card border-0 bg-transparent shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    header: "hidden",
    logoBox: "hidden",
    logoImage: "hidden",
    main: "gap-3",
    socialButtonsBlockButton:
      "border border-white/10 bg-black/45 text-stone-100 hover:border-[#2ea8ff]/35 hover:bg-black/60",
    socialButtonsBlockButtonText: "text-[13px] font-medium tracking-wide",
    dividerLine: "bg-white/10",
    dividerText: "text-[10px] uppercase tracking-[0.16em] text-stone-600",
    formFieldLabel: "text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500",
    formFieldInput:
      "h-11 border border-white/10 bg-[rgba(8,10,14,0.9)] text-stone-100 placeholder:text-stone-600 focus:border-[#2ea8ff]/45 focus:ring-1 focus:ring-[#2ea8ff]/25",
    formButtonPrimary:
      "h-11 bg-[#2ea8ff] text-[#05070a] text-[12px] font-semibold uppercase tracking-[0.12em] hover:bg-[#5bbcff] shadow-none",
    footer: "hidden",
    footerAction: "hidden",
    identityPreviewEditButton: "text-[#2ea8ff]",
    formFieldInputShowPasswordButton: "text-stone-500 hover:text-stone-300",
    alertText: "text-sm",
    userButtonPopoverCard:
      "border border-[rgba(46,168,255,0.18)] bg-[#0c0d10] shadow-none",
    userButtonPopoverActionButton: "text-stone-200 hover:bg-white/5",
  },
} as const;

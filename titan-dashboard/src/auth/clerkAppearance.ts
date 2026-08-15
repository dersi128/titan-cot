/** Dark TITAN shell for Clerk SignIn / SignUp / UserButton. */
export const titanClerkAppearance = {
  variables: {
    colorPrimary: "#2ea8ff",
    colorBackground: "#0c0d10",
    colorInputBackground: "#12141a",
    colorInputText: "#f5f5f4",
    colorText: "#e7e5e4",
    colorTextSecondary: "#a8a29e",
    colorDanger: "#fb7185",
    borderRadius: "0.5rem",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: "mx-auto w-full",
    card: "border border-[rgba(46,168,255,0.18)] bg-[#0c0d10]/95 shadow-none",
    headerTitle: "font-semibold tracking-wide text-stone-100",
    headerSubtitle: "text-stone-500",
    socialButtonsBlockButton:
      "border border-white/10 bg-black/40 text-stone-200 hover:bg-black/60",
    formButtonPrimary:
      "bg-[#2ea8ff] text-[#0c0d10] hover:bg-[#5bbcff] shadow-none",
    footerActionLink: "text-[#2ea8ff] hover:text-[#5bbcff]",
    identityPreviewEditButton: "text-[#2ea8ff]",
    formFieldInput:
      "border border-white/10 bg-[#12141a] text-stone-100 focus:border-[#2ea8ff]/50",
    userButtonPopoverCard:
      "border border-[rgba(46,168,255,0.18)] bg-[#0c0d10] shadow-none",
    userButtonPopoverActionButton: "text-stone-200 hover:bg-white/5",
  },
} as const;

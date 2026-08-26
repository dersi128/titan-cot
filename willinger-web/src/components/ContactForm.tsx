"use client";

import { FormEvent, useState } from "react";
import { copy, game, site, specialties, type Locale } from "@/lib/site";

export function ContactForm({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const interests = [
    ...game[locale].map((item) => item.name),
    ...specialties[locale].map((item) => item.name),
    t.takeoverInterest,
  ];
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const message = String(data.get("message") || "").trim();
    const selected = interests.filter((item) => data.get(`i-${item}`));
    const body = [
      `${t.name}: ${name}`,
      `${t.mail}: ${email}`,
      phone ? `${t.phone}: ${phone}` : "",
      selected.length ? `${t.interest}: ${selected.join(", ")}` : "",
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      `${t.subject} ${name}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-gold/40 bg-cream/60 p-8">
        <p className="font-serif text-3xl text-pine">{t.thanks}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t.thanksText} {site.email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-xs tracking-[0.18em] uppercase text-muted">
          {t.name}
          <input
            required
            name="name"
            autoComplete="name"
            className="mt-2 w-full border border-pine/15 bg-ivory px-4 py-3 text-sm tracking-normal text-ink outline-none focus:border-gold"
          />
        </label>
        <label className="block text-xs tracking-[0.18em] uppercase text-muted">
          {t.mail}
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            className="mt-2 w-full border border-pine/15 bg-ivory px-4 py-3 text-sm tracking-normal text-ink outline-none focus:border-gold"
          />
        </label>
      </div>
      <label className="block text-xs tracking-[0.18em] uppercase text-muted">
        {t.phone} <span className="normal-case tracking-normal">{t.optional}</span>
        <input
          name="phone"
          autoComplete="tel"
          className="mt-2 w-full border border-pine/15 bg-ivory px-4 py-3 text-sm tracking-normal text-ink outline-none focus:border-gold"
        />
      </label>
      <fieldset>
        <legend className="text-xs tracking-[0.18em] uppercase text-muted">
          {t.interest}
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {interests.map((item) => (
            <label
              key={item}
              className="cursor-pointer border border-pine/15 bg-ivory px-3 py-1.5 text-xs text-pine has-[:checked]:border-gold has-[:checked]:bg-gold/15"
            >
              <input type="checkbox" name={`i-${item}`} className="sr-only" />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-xs tracking-[0.18em] uppercase text-muted">
        {t.message}
        <textarea
          required
          name="message"
          rows={6}
          className="mt-2 w-full border border-pine/15 bg-ivory px-4 py-3 text-sm tracking-normal text-ink outline-none focus:border-gold"
          placeholder={t.placeholder}
        />
      </label>
      <button
        type="submit"
        className="bg-oxblood px-8 py-3 text-[0.72rem] tracking-[0.24em] uppercase text-cream transition-colors hover:bg-pine"
      >
        {t.send}
      </button>
    </form>
  );
}

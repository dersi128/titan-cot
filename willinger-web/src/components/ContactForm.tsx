"use client";

import { FormEvent, useState } from "react";
import { game, site, specialties } from "@/lib/site";

const interests = [
  ...game.map((item) => item.name),
  ...specialties.map((item) => item.name),
  "Wildübernahme",
];

export function ContactForm() {
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
      `Name: ${name}`,
      `E-Mail: ${email}`,
      phone ? `Telefon: ${phone}` : "",
      selected.length ? `Interesse: ${selected.join(", ")}` : "",
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      `Anfrage von ${name}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-gold/40 bg-cream/60 p-8">
        <p className="font-serif text-3xl text-pine">Danke für Ihre Anfrage.</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht an{" "}
          {site.email}. Falls nichts passiert, schreiben Sie uns bitte direkt.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-xs tracking-[0.18em] uppercase text-muted">
          Name
          <input
            required
            name="name"
            autoComplete="name"
            className="mt-2 w-full border border-pine/15 bg-ivory px-4 py-3 text-sm tracking-normal text-ink outline-none focus:border-gold"
          />
        </label>
        <label className="block text-xs tracking-[0.18em] uppercase text-muted">
          E-Mail
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
        Telefon <span className="normal-case tracking-normal">(optional)</span>
        <input
          name="phone"
          autoComplete="tel"
          className="mt-2 w-full border border-pine/15 bg-ivory px-4 py-3 text-sm tracking-normal text-ink outline-none focus:border-gold"
        />
      </label>
      <fieldset>
        <legend className="text-xs tracking-[0.18em] uppercase text-muted">
          Interesse
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
        Nachricht
        <textarea
          required
          name="message"
          rows={6}
          className="mt-2 w-full border border-pine/15 bg-ivory px-4 py-3 text-sm tracking-normal text-ink outline-none focus:border-gold"
          placeholder="Menge, Wunschtermin, Abholung oder Lieferung…"
        />
      </label>
      <button
        type="submit"
        className="bg-oxblood px-8 py-3 text-[0.72rem] tracking-[0.24em] uppercase text-cream transition-colors hover:bg-pine"
      >
        Anfrage senden
      </button>
    </form>
  );
}

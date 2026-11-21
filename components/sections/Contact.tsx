"use client";

import { useState } from "react";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { contact, credits } from "@/lib/mockData";

const inputClass =
  "w-full border-0 border-b border-hairline bg-transparent px-0 py-2.5 font-mono text-sm tracking-[0.06em] text-strobe caret-cobalt [color-scheme:dark] transition-colors duration-150 ease-linear focus:border-cobalt focus:outline-none";

export function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    event: "",
    date: "",
    type: "PHOTO + VIDEO",
    message: "",
  });

  const update =
    (field: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[MEDIA PASS REQUEST] ${form.event || "EVENT"} — ${form.name || "PROMOTER"}`;
    const body = [
      `> NAME / COLLECTIVE: ${form.name}`,
      `> EMAIL: ${form.email}`,
      `> EVENT / VENUE: ${form.event}`,
      `> DATE: ${form.date}`,
      `> COVERAGE: ${form.type}`,
      ``,
      `> BRIEF:`,
      form.message,
    ].join("\n");
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const types = [
    t.contact.typePhoto,
    t.contact.typeVideo,
    t.contact.typeBoth,
    `${t.contact.typeBoth} ${t.contact.typeDrone}`,
  ];

  const linkClass =
    "snap-link w-fit break-all font-display text-lg font-extrabold uppercase tracking-[-0.01em] lg:text-xl";

  return (
    <section id="booking" className="bg-void">
      <SectionHeader label={t.contact.label} title={t.contact.title} sub={t.contact.sub} />

      <div className="grid border-t border-hairline md:grid-cols-12">
        {/* Direct lines */}
        <BlurReveal className="border-b border-hairline px-4 py-10 sm:px-8 md:col-span-5 md:border-b-0 md:border-r md:py-14">
          <div className="flex flex-col gap-8">
            <div>
              <p className="meta mb-2">{`/ ${t.contact.directEmail}`}</p>
              <a href={`mailto:${contact.email}`} className={linkClass}>
                {contact.email}
              </a>
            </div>
            <div>
              <p className="meta mb-2">{`/ ${t.contact.phoneLabel}`}</p>
              <a href={contact.phoneHref} className={linkClass}>
                {contact.phone}
              </a>
            </div>
            <div>
              <p className="meta mb-2">{`/ ${t.contact.instagram}`}</p>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                @{contact.instagram}
              </a>
            </div>
            <div className="flex flex-col items-start gap-1.5 pt-4">
              <span className="label-block label-block--cobalt text-[11px] tracking-[0.2em]">
                {t.contact.basedIn}
              </span>
              <span className="meta mt-2">
                {credits.festivals.length} {t.lineup.festivals} / {credits.artists.length}+ ARTISTS
              </span>
            </div>
          </div>
        </BlurReveal>

        {/* Media pass request */}
        <BlurReveal delay={0.06} className="md:col-span-7">
          <form onSubmit={submit} className="flex flex-col gap-5 px-4 py-10 sm:px-8 md:py-14">
            <span className="label-block w-fit text-[11px] tracking-[0.18em]">{t.contact.formTitle}</span>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="meta">{t.contact.name}</span>
                <input required value={form.name} onChange={update("name")} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="meta">{t.contact.email}</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="meta">{t.contact.eventField}</span>
                <input required value={form.event} onChange={update("event")} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="meta">{t.contact.dateField}</span>
                <input type="date" value={form.date} onChange={update("date")} className={inputClass} />
              </label>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="meta mb-2">{t.contact.typeField}</legend>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={form.type === type}
                    onClick={() => setForm((prev) => ({ ...prev, type }))}
                    className={`border px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] transition-colors duration-150 ease-linear ${
                      form.type === type
                        ? "border-strobe bg-strobe text-void"
                        : "border-hairline text-bone hover:border-cobalt hover:bg-cobalt hover:text-strobe"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className="meta">{t.contact.message}</span>
              <textarea rows={5} value={form.message} onChange={update("message")} className={inputClass} />
            </label>

            <button
              type="submit"
              className="mt-2 flex items-center justify-between border border-strobe bg-strobe px-5 py-4 font-display text-sm font-extrabold uppercase tracking-[0.18em] text-void transition-colors duration-150 ease-linear hover:border-cobalt hover:bg-cobalt hover:text-strobe"
            >
              {t.contact.send}
              <span aria-hidden>→</span>
            </button>
            <p className="meta">{t.contact.sendHint}</p>
          </form>
        </BlurReveal>
      </div>
    </section>
  );
}

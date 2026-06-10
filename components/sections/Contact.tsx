"use client";

import { useState } from "react";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { contact, gear } from "@/lib/mockData";

const inputClass =
  "w-full border border-smoke bg-void px-3 py-2.5 text-xs tracking-[0.1em] text-strobe placeholder:text-ash focus:border-strobe focus:outline-none";

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

  return (
    <section id="booking" className="bg-iron">
      <SectionHeader
        label={t.contact.label}
        title={t.contact.title}
        sub={t.contact.sub}
      />

      <div className="grid md:grid-cols-2">
        {/* Gear manifest */}
        <BlurReveal className="border-b border-smoke md:border-b-0 md:border-r">
          <div className="p-5 sm:p-8">
            <p className="tech-label mb-6">{`> ${t.contact.gearTitle}`}</p>
            <ul className="flex flex-col">
              {gear.map((g) => (
                <li
                  key={g.item}
                  className="flex items-baseline justify-between gap-4 border-b border-steel py-3"
                >
                  <span className="text-xs font-bold tracking-[0.12em]">
                    {g.item}
                  </span>
                  <span className="tech-label shrink-0">{g.role}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-2">
              <p className="tech-label">{`> ${t.contact.directEmail}`}</p>
              <a
                href={`mailto:${contact.email}`}
                className="w-fit text-sm font-bold tracking-[0.1em] underline decoration-smoke underline-offset-4 hover:bg-strobe hover:text-void"
              >
                {contact.email}
              </a>
              <p className="tech-label mt-4">{`> ${t.contact.instagram}`}</p>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-sm font-bold tracking-[0.1em] underline decoration-smoke underline-offset-4 hover:bg-strobe hover:text-void"
              >
                @{contact.instagram}
              </a>
              <p className="tech-label mt-4 animate-blink">
                ● {t.contact.basedIn}
              </p>
            </div>
          </div>
        </BlurReveal>

        {/* Media pass request — terminal form */}
        <BlurReveal delay={0.1}>
          <form onSubmit={submit} className="flex flex-col gap-4 p-5 sm:p-8">
            <p className="tech-label mb-2">{`> ${t.contact.formTitle}`}</p>

            <label className="flex flex-col gap-1.5">
              <span className="tech-label">{t.contact.name}</span>
              <input
                required
                value={form.name}
                onChange={update("name")}
                className={inputClass}
                placeholder="_"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="tech-label">{t.contact.email}</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={update("email")}
                className={inputClass}
                placeholder="_"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="tech-label">{t.contact.eventField}</span>
                <input
                  required
                  value={form.event}
                  onChange={update("event")}
                  className={inputClass}
                  placeholder="_"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="tech-label">{t.contact.dateField}</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={update("date")}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="tech-label">{t.contact.typeField}</span>
              <select
                value={form.type}
                onChange={update("type")}
                className={inputClass}
              >
                {types.map((type) => (
                  <option key={type} value={type} className="bg-void">
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="tech-label">{t.contact.message}</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={update("message")}
                className={inputClass}
                placeholder="_"
              />
            </label>

            <button
              type="submit"
              className="mt-2 border border-strobe bg-strobe px-6 py-3 text-xs font-bold tracking-[0.3em] text-void transition-colors hover:bg-void hover:text-strobe"
            >
              {t.contact.send} →
            </button>
            <p className="tech-label">{t.contact.sendHint}</p>
          </form>
        </BlurReveal>
      </div>
    </section>
  );
}

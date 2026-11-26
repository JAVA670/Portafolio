"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { WordsReveal, Rise } from "@/components/fx/Reveal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { setInquiryType, useInquiryType, type InquiryType } from "@/lib/inquiry";
import { site } from "@/lib/site";

const TYPES: InquiryType[] = ["celebration", "event", "portrait", "other"];

const field =
  "w-full border-0 border-b border-line bg-transparent px-0 py-3 text-[16px] text-ink outline-none transition-colors duration-300 placeholder:text-ash focus:border-ink";

/**
 * 05 — Contact: the closing call to action, direct lines, and an inquiry
 * form that composes an email (no backend to break). "Book this" links
 * above pre-select the session type.
 */
export function Contact() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const type = useInquiryType();
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", location: "", message: "" });

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `${site.name} — ${t.contact.types[type]}${form.date ? ` — ${form.date}` : ""}`;
    const details = [
      `${t.contact.name}: ${form.name}`,
      `${t.contact.emailField}: ${form.email}`,
      form.phone && `${t.contact.phoneField}: ${form.phone}`,
      `${t.contact.type}: ${t.contact.types[type]}`,
      form.date && `${t.contact.date}: ${form.date}`,
      form.location && `${t.contact.location}: ${form.location}`,
    ].filter(Boolean);
    const body = [details.join("\n"), form.message].filter(Boolean).join("\n\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const lines = [
    { label: t.contact.email, value: site.email, href: `mailto:${site.email}` },
    { label: t.contact.phone, value: site.phone, href: site.phoneHref },
    { label: t.contact.instagram, value: `@${site.instagram}`, href: site.instagramUrl },
  ];

  return (
    <section id="contact" className="relative scroll-mt-20 bg-paper">
      <div className="shell py-28 md:py-40">
        <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
          <p className="eyebrow text-stone">{t.contact.label}</p>
          <p className="eyebrow hidden text-stone sm:block">{t.hero.based}</p>
        </div>

        <div className="mt-12 grid grid-cols-12 gap-x-4 gap-y-16 md:mt-16">
          <div className="col-span-12 lg:col-span-6">
            <h2 className="serif text-[clamp(48px,6.6vw,116px)] leading-[0.98] [perspective:800px]">
              <WordsReveal text={t.contact.title} stagger={0.05} />
            </h2>
            <Rise delay={0.2}>
              <p className="mt-8 max-w-[40ch] text-[17px] leading-[1.6] text-graphite">{t.contact.sub}</p>
              <dl className="mt-12 border-t border-line">
                {lines.map((line) => (
                  <div key={line.label} className="grid grid-cols-12 items-baseline gap-3 border-b border-line py-4">
                    <dt className="eyebrow col-span-4 text-stone sm:col-span-3">{line.label}</dt>
                    <dd className="col-span-8 sm:col-span-9">
                      <a
                        href={line.href}
                        target={line.href.startsWith("http") ? "_blank" : undefined}
                        rel={line.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="wipe-link break-all text-[clamp(16px,1.5vw,20px)]"
                      >
                        {line.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </Rise>
          </div>

          <motion.form
            onSubmit={submit}
            className="col-span-12 grid grid-cols-2 gap-x-8 gap-y-7 self-start bg-bone p-6 shadow-[0_40px_120px_-40px_rgba(11,11,12,0.25)] md:p-10 lg:col-span-6"
            initial={reduceMotion ? false : { opacity: 0, rotateX: 14, y: 60 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformPerspective: 1200, transformOrigin: "50% 0%" }}
          >
            <fieldset className="col-span-2">
              <legend className="eyebrow mb-3 text-stone">{t.contact.type}</legend>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={type === key}
                    onClick={() => setInquiryType(key)}
                    className={`border px-4 py-2 text-[14px] transition-colors duration-300 ${
                      type === key ? "border-ink bg-ink text-bone" : "border-line text-ink hover:border-ink"
                    }`}
                  >
                    {t.contact.types[key]}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
              <span className="eyebrow text-stone">{t.contact.name}</span>
              <input required value={form.name} onChange={update("name")} className={field} autoComplete="name" />
            </label>
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
              <span className="eyebrow text-stone">{t.contact.emailField}</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={update("email")}
                className={field}
                autoComplete="email"
              />
            </label>
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
              <span className="eyebrow text-stone">{t.contact.phoneField}</span>
              <input type="tel" value={form.phone} onChange={update("phone")} className={field} autoComplete="tel" />
            </label>
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
              <span className="eyebrow text-stone">{t.contact.date}</span>
              <input type="date" value={form.date} onChange={update("date")} className={field} />
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              <span className="eyebrow text-stone">{t.contact.location}</span>
              <input value={form.location} onChange={update("location")} className={field} />
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              <span className="eyebrow text-stone">{t.contact.message}</span>
              <textarea rows={4} value={form.message} onChange={update("message")} className={`${field} resize-none`} />
            </label>
            <div className="col-span-2 mt-2 flex flex-col gap-3">
              <button
                type="submit"
                className="group flex items-center justify-between bg-ink px-6 py-5 text-bone transition-colors duration-300 hover:bg-graphite"
              >
                <span className="text-[15px] font-medium tracking-[0.02em]">{t.contact.send}</span>
                <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </button>
              <p className="text-[13px] text-stone">{t.contact.hint}</p>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { CameraRender } from "@/components/hero/CameraRender";
import { TextReveal } from "@/components/fx/TextReveal";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { contact, heroRender } from "@/lib/mockData";

const field =
  "w-full border-0 border-b border-divider bg-transparent px-0 py-3 font-sans text-[16px] text-strobe caret-cobalt outline-none [color-scheme:dark] transition-colors duration-150 ease-linear placeholder:text-dim focus:border-cobalt";

type CoverageKey = "typePhoto" | "typeVideo" | "typeBoth" | "typeDrone";
const COVERAGE: CoverageKey[] = ["typePhoto", "typeVideo", "typeBoth", "typeDrone"];

/**
 * 04 BOOKING — the closing statement. Big call to action, direct lines and
 * the front-view render; below it, the media pass request (composes an
 * email — no backend to break).
 */
export function Booking() {
  const { t } = useLanguage();
  const [coverage, setCoverage] = useState<CoverageKey>("typeBoth");
  const [form, setForm] = useState({ name: "", email: "", event: "", date: "", brief: "" });

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const coverageLabel = (key: CoverageKey) =>
    key === "typeDrone" ? `${t.booking.typeBoth} ${t.booking.typeDrone}` : t.booking[key];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[MEDIA PASS REQUEST] ${form.event || "EVENT"} — ${form.name || "PROMOTER"}`;
    const body = [
      `NAME / COLLECTIVE: ${form.name}`,
      `EMAIL: ${form.email}`,
      `EVENT / VENUE: ${form.event}`,
      `DATE: ${form.date}`,
      `COVERAGE: ${coverageLabel(coverage)}`,
      "",
      "BRIEF:",
      form.brief,
    ].join("\n");
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const lines = [
    { label: t.booking.email, value: contact.email, href: `mailto:${contact.email}` },
    { label: t.booking.phone, value: contact.phone, href: contact.phoneHref },
    { label: t.booking.instagram, value: `@${contact.instagram}`, href: contact.instagramUrl, external: true },
  ];

  return (
    <section id="booking" className="relative overflow-hidden">
      <div className="shell pt-28 md:pt-40">
        <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4">
          <span className="label-block">{t.booking.label}</span>
          <span className="meta hidden text-right sm:block">{t.booking.available}</span>
        </div>

        <div className="mt-10 grid grid-cols-12 items-center gap-x-3 gap-y-10 md:mt-14">
          <div className="col-span-12 lg:col-span-7">
            <h2 className="display text-[clamp(76px,12vw,210px)]">
              <span className="block">
                <TextReveal text={t.booking.title.split(" ").slice(0, 1).join(" ")} stagger={0.03} />
              </span>
              <span className="block">
                <TextReveal text={t.booking.title.split(" ").slice(1).join(" ")} stagger={0.03} delay={0.1} />
              </span>
            </h2>
            <p className="mt-6 max-w-[38ch] text-[15px] leading-[1.5] text-mute md:text-base">{t.booking.sub}</p>

            <dl className="mt-10 border-t border-hairline">
              {lines.map((line) => (
                <div key={line.label} className="grid grid-cols-1 items-baseline gap-1 border-b border-hairline py-4 sm:grid-cols-12 sm:gap-3">
                  <dt className="meta sm:col-span-3">{line.label}</dt>
                  <dd className="sm:col-span-9">
                    <a
                      href={line.href}
                      {...(line.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="snap-link wide break-words text-[clamp(16px,1.6vw,22px)] font-bold uppercase tracking-[0.06em]"
                    >
                      {line.value}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
            <span className="label-block label-block--cobalt mt-6 sm:hidden">{t.booking.available}</span>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <CameraRender
              src={heroRender.front}
              width={heroRender.width}
              height={heroRender.height}
              alt="Front view of the liquid-chrome camera, its spiral lens staring back"
              glow={0.85}
              className="lg:scale-[1.18]"
            />
          </div>
        </div>

        {/* Media pass request */}
        <BlurReveal className="mt-24 grid grid-cols-12 gap-x-3 gap-y-8 border-t border-divider pt-8 md:mt-32" distance={14}>
          <div className="col-span-12 lg:col-span-4">
            <span className="label-block">{t.booking.formTitle}</span>
            <p className="meta mt-4 max-w-[32ch]">{t.booking.hint}</p>
          </div>

          <form onSubmit={submit} className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-6 lg:col-span-8">
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
              <span className="meta">{t.booking.name}</span>
              <input required value={form.name} onChange={update("name")} className={field} autoComplete="name" />
            </label>
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
              <span className="meta">{t.booking.emailField}</span>
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
              <span className="meta">{t.booking.event}</span>
              <input required value={form.event} onChange={update("event")} className={field} />
            </label>
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
              <span className="meta">{t.booking.date}</span>
              <input type="date" value={form.date} onChange={update("date")} className={field} />
            </label>

            <fieldset className="col-span-2">
              <legend className="meta mb-3">{t.booking.coverage}</legend>
              <div className="flex flex-wrap gap-2">
                {COVERAGE.map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={coverage === key}
                    onClick={() => setCoverage(key)}
                    className={`border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-150 ease-linear ${
                      coverage === key
                        ? "border-strobe bg-strobe text-void"
                        : "border-divider text-strobe hover:border-cobalt hover:bg-cobalt"
                    }`}
                  >
                    {coverageLabel(key)}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="col-span-2 flex flex-col gap-1">
              <span className="meta">{t.booking.brief}</span>
              <textarea rows={4} value={form.brief} onChange={update("brief")} className={`${field} resize-none`} />
            </label>

            <button
              type="submit"
              className="col-span-2 mt-2 flex items-center justify-between bg-strobe px-5 py-5 text-void transition-colors duration-150 ease-linear hover:bg-cobalt hover:text-strobe"
            >
              <span className="wide text-[13px] font-bold uppercase tracking-[0.14em]">{t.booking.send}</span>
              <span aria-hidden className="font-mono">→</span>
            </button>
          </form>
        </BlurReveal>
      </div>
    </section>
  );
}

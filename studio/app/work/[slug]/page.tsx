import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SessionView } from "@/components/work/SessionView";
import { coverOf, sessionBySlug, sessions } from "@/lib/sessions";

export function generateStaticParams() {
  return sessions.map((session) => ({ slug: session.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const session = sessionBySlug(slug);
  if (!session) return {};
  const cover = coverOf(session);
  return {
    title: session.title.en,
    description: session.blurb.en,
    openGraph: cover ? { images: [{ url: cover.src }] } : undefined,
  };
}

export default async function SessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = sessionBySlug(slug);
  if (!session) notFound();
  return (
    <>
      <Header />
      <main>
        <SessionView slug={session.slug} />
      </main>
      <Footer />
    </>
  );
}

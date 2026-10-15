import type { Metadata } from "next";
import Image from "next/image";
import { Open_Sans } from "next/font/google";
import { delay, noto } from "./InviteHero";
import InviteTree from "./InviteTree";
import Snowfall from "./Snowfall";
import Countdown from "./Countdown";
import Reveal from "./Reveal";
import RsvpCard, { CalendarButtons } from "./RsvpCard";
import { EVENT, mapsUrl } from "./event";

const openSans = Open_Sans({ subsets: ["latin"], weight: ["300", "700"] });

export const metadata: Metadata = {
  title: "ALLE JAHRE WIEDER | Novitas Weihnachtsfeier 2026",
  description: "Einladung zur Novitas Weihnachtsfeier am 10. Dezember 2026",
  openGraph: {
    title: "ALLE JAHRE WIEDER",
    description: "Einladung zur Novitas Weihnachtsfeier am 10. Dezember 2026",
    locale: "de_DE",
    type: "website",
  },
};

// Personal links: /invite?an=Frau%20M%C3%BCller
export default async function Invite({ searchParams }: { searchParams: Promise<{ an?: string | string[] }> }) {
  const an = (await searchParams).an;
  const guest = (Array.isArray(an) ? an[0] : an)?.trim().slice(0, 80) ?? "";

  return (
    <main className={`${noto.className} relative overflow-hidden bg-[#1B060B] text-[#D8895F]`}>
      <Snowfall />

      <div className="flex min-h-[100svh] flex-col">
        <header className="flex flex-col items-center gap-4 pt-6 md:pt-8">
          <Image src="/logo_novitas.png" alt="Novitas Logo" width={110} height={42} priority className="invite-rise" style={delay(0.1)} />
          {guest && (
            <p className="invite-rise text-center text-xs uppercase tracking-[0.35em] text-[#D8895F]/80" style={delay(0.6)}>
              Persönliche Einladung für <span className="text-[#F2D3A8]">{guest}</span>
            </p>
          )}
        </header>

        <section className="relative min-h-[62svh] flex-1 md:min-h-[60svh]">
          <div className="parallax-far absolute inset-0">
            <InviteTree dust={false} className="h-full w-full" />
          </div>
          <h1
            className={`${openSans.className} parallax-near absolute inset-x-0 bottom-2 text-center text-[2.6rem] font-bold leading-[1.05] tracking-[0.01em] md:inset-x-auto md:bottom-auto md:left-[6vw] md:top-[52%] md:text-left md:text-[clamp(3rem,5.6vw,5.75rem)]`}
          >
            <span className="invite-rise block" style={delay(1.5)}>
              <span className="foil">ALLE JAHRE</span>
            </span>
            <span className="invite-rise block" style={delay(1.8)}>
              <span className="foil" style={{ animationDelay: "0.25s" }}>WIEDER</span>
            </span>
          </h1>
        </section>

        <a
          href="#antwort"
          className="invite-rise relative z-20 mx-auto mb-6 mt-4 flex flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-[#D8895F]/70 transition-colors hover:text-[#F2D3A8]"
          style={delay(2.6)}
        >
          Zur Einladung
          <svg viewBox="0 0 24 24" className="scroll-cue h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </div>

      <div id="antwort" className="relative z-20 mx-auto flex max-w-4xl flex-col gap-20 px-4 pb-20 pt-10">
        <Reveal className="text-center">
          <p className="mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
            Wir laden Sie herzlich ein, das Jahr mit uns ausklingen zu lassen: bei gutem
            Essen, schönen Gesprächen und in festlicher Stimmung.
          </p>
        </Reveal>

        <Reveal>
          <dl className="grid grid-cols-1 border-y border-[#D8895F]/25 text-center md:grid-cols-3 md:divide-x md:divide-[#D8895F]/25">
            <Detail label="Datum" value="Donnerstag" sub="10. Dezember 2026" />
            <Detail label="Beginn" value="18:30 Uhr" />
            <Detail
              label="Ort"
              value={EVENT.venue}
              sub={
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-[#D8895F]/40 underline-offset-4 transition-colors hover:text-[#F2D3A8]">
                  {EVENT.street}, {EVENT.city}
                </a>
              }
            />
          </dl>
          <div className="mt-12 flex flex-col items-center gap-8">
            <Countdown />
            <CalendarButtons />
          </div>
        </Reveal>

        <Reveal>
          <div className="border border-[#D8895F]/25 bg-[#1B060B]/80 px-6 py-10 backdrop-blur-sm md:px-12">
            <h2 className={`${openSans.className} mb-2 text-center text-2xl font-bold tracking-[0.04em] text-[#F2D3A8] md:text-3xl`}>Ihre Antwort</h2>
            <p className="mb-10 text-center text-sm text-[#D8895F]/70">Bitte bis zum {EVENT.rsvpBy}</p>
            <RsvpCard guest={guest} />
          </div>
        </Reveal>

        <Reveal className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg italic text-[#F2D3A8]">Wir freuen uns auf einen festlichen Abend mit Ihnen.</p>
          <p className="text-xs uppercase tracking-[0.35em] text-[#D8895F]/60">Ihr Novitas Team</p>
        </Reveal>
      </div>
    </main>
  );
}

function Detail({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-7 [&+&]:border-t [&+&]:border-[#D8895F]/25 md:[&+&]:border-t-0">
      <dt className="text-[0.65rem] uppercase tracking-[0.35em] text-[#D8895F]/70">{label}</dt>
      <dd className="text-xl font-bold text-[#F2D3A8]">{value}</dd>
      {sub && <dd className="text-sm">{sub}</dd>}
    </div>
  );
}

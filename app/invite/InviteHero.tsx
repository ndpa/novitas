import Image from "next/image";
import { Noto_Sans } from "next/font/google";
import InviteTree from "./InviteTree";

export const noto = Noto_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export const delay = (s: number) => ({ animationDelay: `${s}s` });

export default function InviteHero({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <header className="flex justify-center pt-6 md:pt-8">
        <Image
          src="/logo_novitas.png"
          alt="Novitas Logo"
          width={110}
          height={42}
          priority
          className="invite-rise"
          style={delay(0.1)}
        />
      </header>

      <section className="relative min-h-[62svh] flex-1 md:min-h-[60svh]">
        <InviteTree className="absolute inset-0 h-full w-full" />
        <h1 className="absolute inset-x-0 bottom-2 text-center text-[2.6rem] font-bold leading-[1.05] tracking-[0.01em] md:inset-x-auto md:bottom-auto md:left-[6vw] md:top-[52%] md:text-left md:text-[clamp(3rem,5.6vw,5.75rem)]">
          <span className="invite-rise block" style={delay(1.5)}>
            ALLE JAHRE
          </span>
          <span className="invite-rise block" style={delay(1.8)}>
            WIEDER
          </span>
        </h1>
      </section>

      <section className="flex flex-col items-center gap-7 px-4 pb-12 pt-6 text-center md:pt-4">
        <p className="invite-rise max-w-5xl text-base leading-relaxed md:text-lg" style={delay(2.3)}>
          Donnerstag, 10. Dezember 2026 um 18:30 Uhr,{" "}
          <span className="whitespace-nowrap">„Zum Dorfkrug“,</span>{" "}
          <span className="whitespace-nowrap">Alte Landstraße 47,</span>{" "}
          <span className="whitespace-nowrap">22949 Ammersbek.</span>
          <br />
          Antwort bitte bis spätestens <span className="whitespace-nowrap">18. November 2026.</span>
        </p>
        {children}
      </section>
    </div>
  );
}

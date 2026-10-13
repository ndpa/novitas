import type { Metadata } from "next";
import Link from "next/link";
import InviteHero, { delay, noto } from "./InviteHero";

export const metadata: Metadata = {
  title: "ALLE JAHRE WIEDER | Novitas Weihnachtsfeier 2026",
  description: "Einladung zur Novitas Weihnachtsfeier am 10. Dezember 2026",
};

export default function Invite() {
  return (
    <main className={`${noto.className} bg-[#1B060B] text-[#D8895F]`}>
      <InviteHero>
        <Link
          href="/"
          className="invite-rise rounded-lg bg-[#D8895F] px-8 py-3 font-bold text-[#1B060B] transition-colors hover:bg-[#E9A27C]"
          style={delay(2.7)}
        >
          Jetzt antworten
        </Link>
      </InviteHero>
    </main>
  );
}

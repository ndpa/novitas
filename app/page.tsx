import InviteHero, { noto } from "./invite/InviteHero";
import RsvpForm from "./RsvpForm";

export default function Home() {
  return (
    <main className={`${noto.className} bg-[#1B060B] text-[#D8895F]`}>
      <InviteHero />
      <div className="flex justify-center px-4 pb-16">
        <RsvpForm />
      </div>
    </main>
  );
}

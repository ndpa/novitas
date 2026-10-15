"use client";

import { useState } from "react";
import { EVENT, googleCalendarUrl } from "./event";

type Attendance = "coming" | "not-coming";

const field =
  "peer w-full rounded-none border-0 border-b border-[#D8895F]/40 bg-transparent px-0 pb-2 pt-6 text-[#F2D3A8] placeholder-transparent transition-colors focus:border-[#F2D3A8] focus:outline-none";
const floating =
  "pointer-events-none absolute left-0 top-1 text-xs uppercase tracking-[0.2em] text-[#D8895F]/70 transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-1 peer-focus:text-xs peer-focus:uppercase peer-focus:tracking-[0.2em]";

export default function RsvpCard({ guest = "" }: { guest?: string }) {
  const [name, setName] = useState(guest);
  const [email, setEmail] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("coming");
  const [dietary, setDietary] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [sent, setSent] = useState<Attendance | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, attendance, dietary: attendance === "coming" ? dietary : "" }),
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      setSent(attendance);
      setStatus("idle");
    } catch (err) {
      console.error("Error submitting form:", err);
      setStatus("error");
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center" role="status">
        <svg viewBox="0 0 52 52" className="h-16 w-16 text-[#F2D3A8]" aria-hidden="true">
          <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" className="rsvp-draw" />
          <path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="2" className="rsvp-draw rsvp-draw-late" />
        </svg>
        <h3 className="text-2xl font-bold text-[#F2D3A8]">
          {sent === "coming" ? "Wunderbar!" : "Vielen Dank für Ihre Rückmeldung"}
        </h3>
        <p className="max-w-md leading-relaxed">
          {sent === "coming"
            ? "Wir freuen uns sehr, dass Sie dabei sind. Halten Sie sich den Abend gleich im Kalender frei:"
            : "Schade, dass Sie diesmal nicht dabei sein können. Wir wünschen Ihnen schon jetzt frohe Festtage!"}
        </p>
        {sent === "coming" && <CalendarButtons />}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <fieldset>
        <legend className="sr-only">Teilnahme</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              ["coming", "Ich komme gern", "Zusage"],
              ["not-coming", "Ich kann leider nicht teilnehmen", "Absage"],
            ] as const
          ).map(([value, label, kicker]) => (
            <label
              key={value}
              className={`cursor-pointer border px-5 py-4 text-left transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#F2D3A8] ${
                attendance === value
                  ? "border-[#F2D3A8] bg-[#D8895F]/15 text-[#F2D3A8]"
                  : "border-[#D8895F]/30 hover:border-[#D8895F]/70"
              }`}
            >
              <input
                type="radio"
                name="attendance"
                value={value}
                checked={attendance === value}
                onChange={() => setAttendance(value)}
                className="sr-only"
              />
              <span className="block text-[0.65rem] uppercase tracking-[0.3em] opacity-70">{kicker}</span>
              <span className="mt-1 block font-bold">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative">
          <input id="rsvp-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoComplete="name" className={field} />
          <label htmlFor="rsvp-name" className={floating}>Name</label>
        </div>
        <div className="relative">
          <input id="rsvp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail" autoComplete="email" className={field} />
          <label htmlFor="rsvp-email" className={floating}>E-Mail</label>
        </div>
      </div>

      <div className={`grid transition-all duration-500 ${attendance === "coming" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="relative overflow-hidden">
          <textarea
            id="rsvp-dietary"
            rows={3}
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            placeholder="Unverträglichkeiten"
            tabIndex={attendance === "coming" ? 0 : -1}
            className={`${field} resize-none`}
          />
          <label htmlFor="rsvp-dietary" className={floating}>Unverträglichkeiten / Allergien / vegetarische Option?</label>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group relative cursor-pointer overflow-hidden bg-[#D8895F] px-12 py-3.5 text-sm font-bold uppercase tracking-[0.25em] text-[#1B060B] transition-colors hover:bg-[#F2D3A8] disabled:cursor-wait disabled:opacity-60"
        >
          <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
          {status === "sending" ? "Wird gesendet …" : "Antwort senden"}
        </button>
        <p className="text-xs text-[#D8895F]/60">Bitte antworten Sie bis zum {EVENT.rsvpBy}.</p>
        {status === "error" && (
          <p className="text-sm text-red-300" role="alert">
            Es gab einen Fehler beim Senden. Bitte versuchen Sie es erneut.
          </p>
        )}
      </div>
    </form>
  );
}

export function CalendarButtons() {
  const cls =
    "border border-[#D8895F]/50 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:border-[#F2D3A8] hover:text-[#F2D3A8]";
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <a href="/invite/kalender.ics" className={cls}>
        Apple / Outlook
      </a>
      <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" className={cls}>
        Google Kalender
      </a>
    </div>
  );
}

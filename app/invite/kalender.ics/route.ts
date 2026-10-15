import { icsFile } from "../event";

export function GET() {
  return new Response(icsFile(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="novitas-weihnachtsfeier-2026.ics"',
    },
  });
}

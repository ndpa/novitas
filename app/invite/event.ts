export const EVENT = {
  title: "Novitas Weihnachtsfeier 2026",
  start: "2026-12-10T18:30:00+01:00",
  // No end time is on the invitation; calendars need one.
  end: "2026-12-10T23:00:00+01:00",
  venue: "„Zum Dorfkrug“",
  street: "Alte Landstraße 47",
  city: "22949 Ammersbek",
  rsvpBy: "18. November 2026",
};

export const location = `Zum Dorfkrug, ${EVENT.street}, ${EVENT.city}`;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

// 20261210T173000Z
const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export const googleCalendarUrl =
  "https://calendar.google.com/calendar/render?" +
  new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT.title,
    dates: `${utc(EVENT.start)}/${utc(EVENT.end)}`,
    location,
    details: "ALLE JAHRE WIEDER - wir freuen uns auf Sie!",
  });

export function icsFile() {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Novitas//Weihnachtsfeier//DE",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:weihnachtsfeier-2026@novitas",
    `DTSTAMP:${utc(new Date().toISOString())}`,
    `DTSTART:${utc(EVENT.start)}`,
    `DTEND:${utc(EVENT.end)}`,
    `SUMMARY:${EVENT.title}`,
    `LOCATION:${location.replace(/,/g, "\\,")}`,
    "DESCRIPTION:ALLE JAHRE WIEDER - wir freuen uns auf Sie!",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:Morgen: ${EVENT.title}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

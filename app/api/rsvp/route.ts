import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

interface RSVPData {
  name: string;
  email: string;
  attendance: string;
  dietary: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RSVPData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.attendance) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Prepare the attendance field
    const teilnahme = body.attendance === "coming"
      ? "Ich komme gern"
      : "Ich kann leider nicht teilnehmen";

    // Prepare the comment field (dietary restrictions)
    const kommentar = body.dietary || "";

    // Set up Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Append the data to the sheet
    // Columns: Name, E-Mail, Teilnahme, Kommentar
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:D", // Columns Name, E-Mail, Teilnahme, Kommentar
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[body.name, body.email, teilnahme, kommentar]],
      },
    });

    console.log("=== New RSVP submitted to Google Sheets ===");
    console.log("Name:", body.name);
    console.log("E-Mail:", body.email);
    console.log("Teilnahme:", teilnahme);
    console.log("Kommentar:", kommentar);
    console.log("Timestamp:", new Date().toISOString());
    console.log("==========================================");

    return NextResponse.json(
      {
        message: "RSVP received successfully",
        data: {
          name: body.name,
          email: body.email,
          attendance: body.attendance,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing RSVP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

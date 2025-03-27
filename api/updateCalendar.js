import { format } from "date-fns";

export default async function handler(req, res) {
  try {
    // Define location (adjust coordinates for accuracy)
    const latitude = "35.7806";  // Replace with your actual latitude
    const longitude = "-5.8039"; // Replace with your actual longitude
    const method = "2";          // Calculation method (ISNA, Umm al-Qura, etc.)

    // Fetch prayer times from Aladhan API
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=Tangier&country=Morocco&method=${method}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch prayer times");
    }

    const data = await response.json();
    const timings = data.data.timings;

    // Convert prayer times into events
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const timezone = "UTC"; // Adjust if needed

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourApp//PrayerTimes//EN
CALSCALE:GREGORIAN
NAME:Prayer Times
X-WR-CALNAME:Prayer Times
TIMEZONE-ID:${timezone}
`;

    const today = new Date();
    const dateStr = format(today, "yyyyMMdd");

    prayers.forEach((prayer) => {
      const prayerTime = timings[prayer]; // Get time from API response
      const startTime = `${dateStr}T${prayerTime.replace(":", "")}00Z`; // Format for ICS

      icsContent += `
BEGIN:VEVENT
UID:${Date.now()}@yourapp.com
DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}
DTSTART:${startTime}
DTEND:${startTime}
SUMMARY:${prayer} Pray
DESCRIPTION:Proclaim Christ is King
END:VEVENT
`;
    });

    icsContent += "END:VCALENDAR";

    // Set response headers for ICS download
    res.setHeader("Content-Type", "text/calendar");
    res.setHeader("Content-Disposition", `attachment; filename="prayer_times.ics"`);

    return res.status(200).send(icsContent);
  } catch (error) {
    console.error("Error generating calendar:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

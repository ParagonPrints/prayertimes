const axios = require("axios");
const fs = require("fs");
const moment = require("moment");

// CONFIG: Set your desired location
const COUNTRY = "Morocco";
const CITY = "Casablanca"; // Change if needed
const METHOD = 2; // Calculation method (2 = Muslim World League)

async function fetchPrayerTimes() {
    try {
        const today = moment().format("YYYY-MM-DD");
        const url = `http://api.aladhan.com/v1/timingsByCity/${today}?city=${CITY}&country=${COUNTRY}&method=${METHOD}`;
        const response = await axios.get(url);
        return response.data.data.timings;
    } catch (error) {
        console.error("Error fetching prayer times:", error);
        return null;
    }
}

function createICS(prayerTimes) {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Your Organization//Prayer Times//EN\n`;

    const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    prayerNames.forEach((prayer) => {
        const timeUTC = moment(`${moment().format("YYYY-MM-DD")} ${prayerTimes[prayer]}`, "YYYY-MM-DD HH:mm")
            .utc()
            .format("YYYYMMDDTHHmmss[Z]");

        icsContent += `
BEGIN:VEVENT
UID:${prayer}-${timeUTC}
DTSTAMP:${timeUTC}
DTSTART:${timeUTC}
SUMMARY:Proclaim Christ is King over ${COUNTRY}
DESCRIPTION:It’s time for ${prayer}. Proclaim Christ is King over ${COUNTRY}!
END:VEVENT`;
    });

    icsContent += `\nEND:VCALENDAR`;

    fs.writeFileSync("prayer_times.ics", icsContent);
    console.log("✅ ICS file generated: prayer_times.ics");
}

// Main function
async function main() {
    const prayerTimes = await fetchPrayerTimes();
    if (prayerTimes) createICS(prayerTimes);
}

main();


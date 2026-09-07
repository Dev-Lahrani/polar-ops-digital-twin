import { db } from "@/lib/db";

const STATION_COORDS: Record<string, { lat: number; lon: number }> = {
  maitri: { lat: -70.7668, lon: 11.7397 },
  bharati: { lat: -69.4072, lon: 76.1950 },
};

export async function fetchAndSyncWeather(stationId: string) {
  const coords = STATION_COORDS[stationId];
  if (!coords) return null;

  // Check if we have recent data (less than 15 mins old)
  const latest = await db.environmentalData.findFirst({
    where: { stationId },
    orderBy: { timestamp: "desc" },
  });

  if (latest && (Date.now() - latest.timestamp.getTime()) < 15 * 60 * 1000) {
    return latest; // Still fresh
  }

  // Fetch real data from Open-Meteo
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,visibility,wind_direction_10m&wind_speed_unit=kmh&timezone=auto`;
  
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Open-Meteo API failed");
    
    const data = await res.json();
    const current = data.current;
    
    // Convert visibility (m) to km, cap at 100
    const visKm = current.visibility ? current.visibility / 1000 : 10;
    
    const newRecord = await db.environmentalData.create({
      data: {
        stationId,
        timestamp: new Date(current.time), // ISO time
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDir: current.wind_direction_10m.toString(),
        pressure: current.surface_pressure,
        visibility: visKm,
        uvIndex: 0, // Not available in this endpoint easily, mock as 0 for winter
      }
    });
    
    // Also update the current station's telemetry
    await db.station.update({
      where: { id: stationId },
      data: {
        temperature: current.temperature_2m,
        windSpeed: current.wind_speed_10m,
      }
    });

    return newRecord;
  } catch (err) {
    console.error(`Failed to sync weather for ${stationId}:`, err);
    return latest; // fallback to old data if API fails
  }
}

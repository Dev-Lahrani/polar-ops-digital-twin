export interface WeatherData {
  stationId: string;
  temperatureC: number;
  windSpeedKmh: number;
  windChillC: number;
  humidity: number;
  visibility: number;
  pressureHPA: number;
  timestamp: string;
  source: "live" | "simulated";
  conditions: string;
  uvIndex: number;
  solarRadiation: number;
}

export interface WeatherForecast {
  hourly: WeatherData[];
  trend: "worsening" | "stable" | "improving";
  nextSevereWindow: string | null;
  windChillWarning: boolean;
}

const BASE_WEATHER: Record<string, { temp: number; wind: number; humidity: number; pressure: number }> = {
  maitri: { temp: -32, wind: 45, humidity: 55, pressure: 988 },
  bharati: { temp: -18, wind: 38, humidity: 60, pressure: 992 },
};

function computeWindChill(tempC: number, windKmh: number): number {
  if (tempC > 10 || windKmh < 4.8) return tempC;
  return Math.round(
    13.12 +
      0.6215 * tempC -
      11.37 * Math.pow(windKmh, 0.16) +
      0.3965 * tempC * Math.pow(windKmh, 0.16)
  );
}

function getConditionFromParams(tempC: number, windKmh: number): string {
  if (tempC <= -45 && windKmh > 60) return "BLIZZARD";
  if (tempC <= -40 && windKmh > 40) return "SEVERE GALE";
  if (tempC <= -35 && windKmh > 50) return "WIND CHILL WARNING";
  if (windKmh > 50) return "GALE FORCE WINDS";
  if (tempC <= -35) return "EXTREME COLD";
  if (tempC <= -25) return "COLD";
  if (tempC <= -15) return "COOL";
  return "MILD (for Antarctica)";
}

function jitter(base: number, stdDev: number): number {
  return base + (Math.random() - 0.5) * 2 * stdDev;
}

export function getCurrentWeather(stationId: string): WeatherData {
  const base = BASE_WEATHER[stationId] ?? BASE_WEATHER.maitri;
  const tempC = Math.round(jitter(base.temp, 3));
  const windSpeedKmh = Math.round(Math.max(0, jitter(base.wind, 8)));
  const windChillC = computeWindChill(tempC, windSpeedKmh);
  const humidity = Math.round(Math.max(20, Math.min(100, jitter(base.humidity, 10))));
  const visibility = windSpeedKmh > 50 ? Math.round(jitter(0.5, 0.3)) : Math.round(jitter(8, 3));
  const uvIndex = Math.max(0, Math.round(jitter(2, 1.5)));
  const solarRadiation = Math.max(0, Math.round(jitter(120, 40)));

  return {
    stationId,
    temperatureC: tempC,
    windSpeedKmh,
    windChillC,
    humidity,
    visibility: Math.max(0.1, visibility),
    pressureHPA: Math.round(jitter(base.pressure, 5)),
    timestamp: new Date().toISOString(),
    source: "simulated",
    conditions: getConditionFromParams(tempC, windSpeedKmh),
    uvIndex,
    solarRadiation,
  };
}

export function generateWeatherForecast(stationId: string, hours: number = 24): WeatherForecast {
  const base = BASE_WEATHER[stationId] ?? BASE_WEATHER.maitri;
  const hourly: WeatherData[] = [];

  for (let h = 0; h < hours; h++) {
    const timeOffset = h * 3600000;
    const futureTime = new Date(Date.now() + timeOffset);
    const hourOfDay = futureTime.getUTCHours();

    const diurnal = Math.sin((hourOfDay - 6) * Math.PI / 12) * 4;
    const tempC = Math.round(base.temp + diurnal + (Math.random() - 0.5) * 6);
    const windSpeedKmh = Math.round(Math.max(0, base.wind + (Math.random() - 0.5) * 15));
    const windChillC = computeWindChill(tempC, windSpeedKmh);
    const humidity = Math.round(Math.max(20, Math.min(100, base.humidity + (Math.random() - 0.5) * 15)));
    const visibility = windSpeedKmh > 50 ? Math.round(Math.max(0.1, 0.5 + Math.random() * 0.5)) : Math.round(Math.max(1, 8 + (Math.random() - 0.5) * 6));

    hourly.push({
      stationId,
      temperatureC: tempC,
      windSpeedKmh,
      windChillC,
      humidity,
      visibility,
      pressureHPA: Math.round(base.pressure + (Math.random() - 0.5) * 8),
      timestamp: futureTime.toISOString(),
      source: "simulated",
      conditions: getConditionFromParams(tempC, windSpeedKmh),
      uvIndex: Math.max(0, Math.round(jitter(2, 1.5))),
      solarRadiation: Math.max(0, Math.round(jitter(120, 40))),
    });
  }

  const temps = hourly.map(h => h.temperatureC);
  const winds = hourly.map(h => h.windSpeedKmh);
  const firstHalfTemp = temps.slice(0, Math.floor(hours / 2)).reduce((s, t) => s + t, 0) / (hours / 2);
  const secondHalfTemp = temps.slice(Math.floor(hours / 2)).reduce((s, t) => s + t, 0) / (hours / 2);

  let trend: WeatherForecast["trend"];
  if (secondHalfTemp < firstHalfTemp - 3) trend = "worsening";
  else if (secondHalfTemp > firstHalfTemp + 3) trend = "improving";
  else trend = "stable";

  const severeHours = hourly.filter(h => h.temperatureC <= -40 || h.windSpeedKmh > 60);
  const nextSevereWindow = severeHours.length > 0 ? severeHours[0].timestamp : null;

  const windChillWarning = hourly.some(h => h.windChillC <= -55);

  return {
    hourly,
    trend,
    nextSevereWindow,
    windChillWarning,
  };
}

export function getHeatingDemandMultiplier(weather: WeatherData, baselineTempC: number): number {
  const deltaT = Math.max(0, baselineTempC - weather.temperatureC);
  const windFactor = 1 + Math.max(0, (weather.windSpeedKmh - 30)) * 0.005;
  return (1 + deltaT * 0.01) * windFactor;
}

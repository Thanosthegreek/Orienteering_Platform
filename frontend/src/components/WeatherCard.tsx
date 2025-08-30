import { useEffect, useState } from "react";

// Open-Meteo uses "weathercode" → map to description + emoji
const weatherMap: Record<number, { text: string; icon: string }> = {
  0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Fog", icon: "🌫️" },
  48: { text: "Depositing rime fog", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌦️" },
  53: { text: "Moderate drizzle", icon: "🌧️" },
  55: { text: "Dense drizzle", icon: "🌧️" },
  61: { text: "Slight rain", icon: "🌦️" },
  63: { text: "Moderate rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  71: { text: "Slight snow fall", icon: "🌨️" },
  73: { text: "Moderate snow fall", icon: "🌨️" },
  75: { text: "Heavy snow fall", icon: "❄️" },
  80: { text: "Rain showers", icon: "🌦️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  99: { text: "Hailstorm", icon: "🌩️" },
};

type Weather = {
  temperature: number;
  windspeed: number;
  weathercode: number;
};

export default function WeatherCard() {
  const [data, setData] = useState<Weather | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Athens coords (adjust if you want dynamic)
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=37.9838&longitude=23.7275&current_weather=true";

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.current_weather) {
          setData(json.current_weather);
        } else {
          setErr("No weather data");
        }
      })
      .catch((e) => setErr(String(e)));
  }, []);

  const w = data ? weatherMap[data.weathercode] || { text: "Unknown", icon: "❔" } : null;

  return (
    <div className="card" style={{ maxWidth: 300 }}>
      <h3 style={{ marginTop: 0 }}>Weather in Athens</h3>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {data ? (
        <div style={{ fontSize: "1.2rem" }}>
          <div>
            {w?.icon} {w?.text}
          </div>
          <div>
            🌡 {data.temperature} °C
          </div>
          <div>
            💨 {data.windspeed} km/h
          </div>
        </div>
      ) : !err ? (
        <div>Loading...</div>
      ) : null}
      <small style={{ display: "block", marginTop: 6, fontSize: ".8rem", color: "#555" }}>
        Weather data by{" "}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo.com
        </a>
      </small>
    </div>
  );
}

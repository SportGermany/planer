/* ============================================================
   WETTER-ENGINE (Open-Meteo, kein API-Schlüssel nötig)
   Reine Daten- und Netzwerklogik, keine DOM-Zugriffe.
   ============================================================ */
(function(root){
"use strict";
var W = root.WK;

/* ---------- WMO-Wettercodes -> Kategorie & Text ---------- */
var WMO = {
  0:["sun","Klarer Himmel"], 1:["suncloud","Überwiegend klar"], 2:["suncloud","Teilweise bewölkt"],
  3:["cloud","Bedeckt"], 45:["fog","Nebel"], 48:["fog","Reifnebel"],
  51:["drizzle","Leichter Nieselregen"], 53:["drizzle","Nieselregen"], 55:["drizzle","Starker Nieselregen"],
  56:["drizzle","Gefrierender Nieselregen"], 57:["drizzle","Starker gefr. Nieselregen"],
  61:["rain","Leichter Regen"], 63:["rain","Regen"], 65:["rain","Starker Regen"],
  66:["rain","Gefrierender Regen"], 67:["rain","Starker gefr. Regen"],
  71:["snow","Leichter Schneefall"], 73:["snow","Schneefall"], 75:["snow","Starker Schneefall"],
  77:["snow","Schneegriesel"],
  80:["rain","Regenschauer"], 81:["rain","Kräftige Regenschauer"], 82:["rain","Heftige Regenschauer"],
  85:["snow","Schneeschauer"], 86:["snow","Starke Schneeschauer"],
  95:["thunder","Gewitter"], 96:["thunder","Gewitter mit Hagel"], 99:["thunder","Schweres Gewitter mit Hagel"]
};
function wmoInfo(code){ return WMO[code] || ["cloud","Unbekannt"]; }

/* ---------- Kompakte Inline-SVG-Icons ---------- */
var WEATHER_ICONS = {
  sun:      '<circle cx="12" cy="12" r="5"/><g stroke-linecap="round"><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></g>',
  suncloud: '<circle cx="8" cy="9" r="4"/><path d="M6 20h11a4 4 0 0 0 .5-8 6 6 0 0 0-11.3-1.6" stroke-linejoin="round"/>',
  cloud:    '<path d="M6 19h12a4.5 4.5 0 0 0 .4-9A6.5 6.5 0 0 0 6.2 12.6 4 4 0 0 0 6 19z" stroke-linejoin="round"/>',
  fog:      '<path d="M6 15h12M4 19h16M8 11h8" stroke-linecap="round"/><circle cx="12" cy="6" r="3"/>',
  drizzle:  '<path d="M6 13h11a4 4 0 0 0 .4-8A6 6 0 0 0 6.2 6.6 3.6 3.6 0 0 0 6 13z" stroke-linejoin="round"/><g stroke-linecap="round"><path d="M8 18v2M12 18v2M16 18v2"/></g>',
  rain:     '<path d="M6 12h11a4 4 0 0 0 .4-8A6 6 0 0 0 6.2 5.6 3.6 3.6 0 0 0 6 12z" stroke-linejoin="round"/><g stroke-linecap="round"><path d="M7 16l-2 5M12 16l-2 5M17 16l-2 5"/></g>',
  snow:     '<path d="M6 12h11a4 4 0 0 0 .4-8A6 6 0 0 0 6.2 5.6 3.6 3.6 0 0 0 6 12z" stroke-linejoin="round"/><g stroke-linecap="round"><path d="M8 17v5M8 19l-2 1M8 19l2 1M13 17v5M13 19l-2 1M13 19l2 1M17 17v5M17 19l-2 1M17 19l2 1"/></g>',
  thunder:  '<path d="M6 11h11a4 4 0 0 0 .4-8A6 6 0 0 0 6.2 4.6 3.6 3.6 0 0 0 6 11z" stroke-linejoin="round"/><path d="M13 13l-4 6h3l-2 5 6-7h-3z" stroke-linejoin="round" fill="currentColor" stroke="none"/>'
};
function weatherIconSvg(cat, cls){
  var body = WEATHER_ICONS[cat] || WEATHER_ICONS.cloud;
  return '<svg viewBox="0 0 24 24" class="' + (cls||"wicon") + '" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
}

/* ---------- Geocoding: Stadtname -> Koordinaten ---------- */
function geocodeCity(name){
  var url = "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(name) + "&count=6&language=de&format=json";
  return fetch(url).then(function(res){
    if (!res.ok) throw new Error("Ortssuche nicht erreichbar (" + res.status + ")");
    return res.json();
  }).then(function(data){
    return (data.results || []).map(function(r){
      return {
        name: r.name, admin1: r.admin1 || "", country: r.country || "",
        lat: r.latitude, lon: r.longitude
      };
    });
  });
}

/* ---------- Vorhersage laden: 14 Tage + stündlich ---------- */
function fetchForecast(lat, lon, unit){
  var url = "https://api.open-meteo.com/v1/forecast?latitude=" + encodeURIComponent(lat) +
    "&longitude=" + encodeURIComponent(lon) +
    "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,windspeed_10m_max" +
    "&hourly=temperature_2m,weathercode,precipitation_probability" +
    "&current_weather=true&timezone=auto&forecast_days=14" +
    (unit === "f" ? "&temperature_unit=fahrenheit" : "");
  return fetch(url).then(function(res){
    if (!res.ok) throw new Error("Wetterdienst nicht erreichbar (" + res.status + ")");
    return res.json();
  }).then(function(raw){ return normalizeForecast(raw); });
}
/* Rohantwort in ein handliches Format bringen: Tage nach Datum, Stunden ab jetzt */
function normalizeForecast(raw){
  var days = [];
  if (raw.daily && raw.daily.time){
    for (var i = 0; i < raw.daily.time.length; i++){
      days.push({
        date: raw.daily.time[i],
        code: raw.daily.weathercode[i],
        tmax: Math.round(raw.daily.temperature_2m_max[i]),
        tmin: Math.round(raw.daily.temperature_2m_min[i]),
        pop: raw.daily.precipitation_probability_max ? raw.daily.precipitation_probability_max[i] : null,
        sunrise: raw.daily.sunrise ? raw.daily.sunrise[i] : null,
        sunset: raw.daily.sunset ? raw.daily.sunset[i] : null,
        windMax: raw.daily.windspeed_10m_max ? Math.round(raw.daily.windspeed_10m_max[i]) : null
      });
    }
  }
  var hours = [];
  if (raw.hourly && raw.hourly.time){
    var nowIso = raw.current_weather ? raw.current_weather.time : raw.hourly.time[0];
    var startIdx = raw.hourly.time.indexOf(nowIso);
    if (startIdx < 0) startIdx = 0;
    for (var h = startIdx; h < Math.min(raw.hourly.time.length, startIdx + 24); h++){
      hours.push({
        time: raw.hourly.time[h],
        temp: Math.round(raw.hourly.temperature_2m[h]),
        code: raw.hourly.weathercode[h],
        pop: raw.hourly.precipitation_probability ? raw.hourly.precipitation_probability[h] : null
      });
    }
  }
  return {
    unit: (raw.current_weather_units && raw.current_weather_units.temperature) || "°C",
    current: raw.current_weather ? {
      temp: Math.round(raw.current_weather.temperature),
      code: raw.current_weather.weathercode,
      time: raw.current_weather.time
    } : null,
    days: days, hours: hours
  };
}
/* Wetter für ein bestimmtes Kalenderdatum aus den Tagesdaten heraussuchen */
function forecastForDate(forecast, dateStr){
  if (!forecast || !forecast.days) return null;
  for (var i = 0; i < forecast.days.length; i++){
    if (forecast.days[i].date === dateStr) return forecast.days[i];
  }
  return null;
}

var API = {
  wmoInfo:wmoInfo, weatherIconSvg:weatherIconSvg, WEATHER_ICONS:WEATHER_ICONS,
  geocodeCity:geocodeCity, fetchForecast:fetchForecast, normalizeForecast:normalizeForecast,
  forecastForDate:forecastForDate
};
for (var k in API) W[k] = API[k];
root.WEATHER = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof globalThis !== "undefined" ? globalThis : this);

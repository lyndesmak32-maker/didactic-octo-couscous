import { Cloud, CloudRain, Sun, Wind, Snowflake, CloudFog } from "lucide-react";
import type { WeatherData } from "~/types/dashboard";

const iconMap: Record<WeatherData["icon"], typeof Sun> = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: Snowflake,
  wind: Wind,
  fog: CloudFog,
};

export function WeatherWidget({ weather }: { weather: WeatherData }) {
  const Icon = iconMap[weather.icon];

  return (
    <div className="group rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-200 hover:border-surface-300 hover:shadow-lg hover:shadow-surface-200/50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:shadow-surface-950/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
            {weather.location}
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
              {weather.temperature}°
            </span>
            <span className="text-sm text-surface-500 dark:text-surface-400">F</span>
          </div>
          <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">
            {weather.condition}
          </p>
        </div>
        <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/40">
          <Icon className="size-7 text-sky-500" />
        </div>
      </div>
      <div className="mt-4 flex gap-4 border-t border-surface-100 pt-4 dark:border-surface-800">
        <div>
          <p className="text-xs text-surface-400 dark:text-surface-500">High</p>
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            {weather.high}°
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-400 dark:text-surface-500">Low</p>
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            {weather.low}°
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-400 dark:text-surface-500">Humidity</p>
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            {weather.humidity}%
          </p>
        </div>
      </div>
    </div>
  );
}

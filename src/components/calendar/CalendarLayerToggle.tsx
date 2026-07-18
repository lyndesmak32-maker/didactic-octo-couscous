import type { CalendarLayer } from "~/types/calendar";
import { LAYER_LABELS, LAYER_COLORS } from "~/types/calendar";
import { Eye, EyeOff } from "lucide-react";

interface CalendarLayerToggleProps {
  activeLayers: CalendarLayer[];
  onToggle: (layer: CalendarLayer) => void;
}

const allLayers: CalendarLayer[] = ["personal", "work", "family", "holidays"];

export function CalendarLayerToggle({ activeLayers, onToggle }: CalendarLayerToggleProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {allLayers.map((layer) => {
        const isActive = activeLayers.includes(layer);
        return (
          <button
            key={layer}
            onClick={() => onToggle(layer)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 ${
              isActive
                ? "bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-200"
                : "bg-surface-100 text-surface-400 line-through dark:bg-surface-800 dark:text-surface-500"
            }`}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: LAYER_COLORS[layer].replace("0.15", "0.6") }}
            />
            {isActive ? (
              <Eye className="size-3" />
            ) : (
              <EyeOff className="size-3" />
            )}
            {LAYER_LABELS[layer]}
          </button>
        );
      })}
    </div>
  );
}

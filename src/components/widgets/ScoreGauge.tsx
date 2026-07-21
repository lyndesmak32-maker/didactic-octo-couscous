interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 200 }: ScoreGaugeProps) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const gradientId = "score-gauge-gradient";

  const startAngle = 135;
  const totalAngle = 270;
  const arcStartRad = ((startAngle - 90) * Math.PI) / 180;
  const arcEndAngle = startAngle + (score / 100) * totalAngle;
  const arcEndRad = ((arcEndAngle - 90) * Math.PI) / 180;

  const x1 = center + radius * Math.cos(arcStartRad);
  const y1 = center + radius * Math.sin(arcStartRad);
  const x2 = center + radius * Math.cos(arcEndRad);
  const y2 = center + radius * Math.sin(arcEndRad);
  const largeArcFlag = score > 50 ? 1 : 0;
  const scorePath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

  const bgEndAngle = startAngle + 270;
  const bgEndRad = ((bgEndAngle - 90) * Math.PI) / 180;
  const bgX2 = center + radius * Math.cos(bgEndRad);
  const bgY2 = center + radius * Math.sin(bgEndRad);
  const bgPath = `M ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${bgX2} ${bgY2}`;

  let textColor: string;
  if (score >= 75) textColor = "text-emerald-600 dark:text-emerald-400";
  else if (score >= 50) textColor = "text-amber-600 dark:text-amber-400";
  else textColor = "text-red-600 dark:text-red-400";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-sm"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Background arc */}
      <path
        d={bgPath}
        fill="none"
        stroke="currentColor"
        className="text-surface-200 dark:text-surface-700"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Score arc */}
      <path
        d={scorePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />

      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const angle = startAngle + (tick / 100) * totalAngle;
        const rad = ((angle - 90) * Math.PI) / 180;
        const innerR = radius - strokeWidth - 4;
        const outerR = radius + 6;
        return (
          <line
            key={tick}
            x1={center + innerR * Math.cos(rad)}
            y1={center + innerR * Math.sin(rad)}
            x2={center + outerR * Math.cos(rad)}
            y2={center + outerR * Math.sin(rad)}
            stroke="currentColor"
            className="text-surface-300 dark:text-surface-600"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}

      {/* Score text */}
      <text
        x={center}
        y={center + 4}
        textAnchor="middle"
        dominantBaseline="central"
        className={`text-5xl font-extrabold ${textColor}`}
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {score}
      </text>

      <text
        x={center}
        y={center + 28}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-surface-400 dark:fill-surface-500 text-xs font-medium"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        out of 100
      </text>
    </svg>
  );
}

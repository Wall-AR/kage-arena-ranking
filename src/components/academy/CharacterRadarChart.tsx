import type { AcademyAttributes } from "@/hooks/useAcademy";

interface Props {
  attributes: AcademyAttributes;
  size?: number;
}

const AXES: { key: keyof AcademyAttributes; label: string }[] = [
  { key: "strength", label: "Força" },
  { key: "speed", label: "Velocidade" },
  { key: "technique", label: "Técnica" },
  { key: "defense", label: "Defesa" },
  { key: "mobility", label: "Mobilidade" },
  { key: "versatility", label: "Versatilidade" },
];

export const CharacterRadarChart = ({ attributes, size = 320 }: Props) => {
  const center = size / 2;
  const maxRadius = size * 0.35;
  const max = 10;

  const points = AXES.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
    const value = Math.min(max, Math.max(0, Number(attributes[axis.key] ?? 0)));
    const r = (value / max) * maxRadius;
    return {
      ...axis,
      value,
      angle,
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      lx: center + Math.cos(angle) * (maxRadius + 28),
      ly: center + Math.sin(angle) * (maxRadius + 28),
      ax: center + Math.cos(angle) * maxRadius,
      ay: center + Math.sin(angle) * maxRadius,
    };
  });

  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="w-full flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[360px] aspect-square">
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((s) => (
          <polygon
            key={s}
            points={AXES.map((_, i) => {
              const a = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
              return `${center + Math.cos(a) * maxRadius * s},${center + Math.sin(a) * maxRadius * s}`;
            }).join(" ")}
            fill="none"
            stroke="hsl(var(--border))"
            strokeOpacity={s === 1 ? 0.8 : 0.3}
          />
        ))}

        {points.map((p) => (
          <line key={p.key} x1={center} y1={center} x2={p.ax} y2={p.ay} stroke="hsl(var(--border))" strokeOpacity="0.3" />
        ))}

        <polygon
          points={polygon}
          fill="url(#radarFill)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
        />

        {points.map((p) => (
          <circle key={p.key} cx={p.x} cy={p.y} r="3.5" fill="hsl(var(--primary))" />
        ))}

        {points.map((p) => (
          <g key={p.key}>
            <text
              x={p.lx}
              y={p.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground"
              fontSize="11"
              fontWeight="600"
            >
              {p.label}
            </text>
            <text
              x={p.lx}
              y={p.ly + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-primary"
              fontSize="10"
              fontWeight="700"
            >
              {p.value}/10
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

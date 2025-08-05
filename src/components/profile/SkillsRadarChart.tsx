import { cn } from "@/lib/utils";

interface Skill {
  name: string;
  value: number;
  angle: number;
}

interface SkillsRadarChartProps {
  skills: Skill[];
  rankColor: string;
  className?: string;
}

export const SkillsRadarChart = ({ skills, rankColor, className }: SkillsRadarChartProps) => {
  const size = 340;
  const center = size / 2;
  const maxRadius = 140;
  
  return (
    <div className={cn("relative w-full h-80 flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Grids concêntricos com gradiente */}
        <defs>
          <radialGradient id="gridGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(var(--border))" stopOpacity="0.3" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid circular com efeito gradiente */}
        {[2, 4, 6, 8, 10].map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 10) * maxRadius}
            fill="none"
            stroke="url(#gridGradient)"
            strokeWidth={level === 10 ? "2" : "1"}
            opacity={level === 10 ? "0.8" : "0.4"}
            className="animate-pulse"
            style={{ animationDuration: `${3 + level * 0.5}s` }}
          />
        ))}
        
        {/* Linhas dos eixos com gradiente */}
        {skills.map((skill, index) => {
          const angle = (skill.angle * Math.PI) / 180;
          const x = center + Math.cos(angle) * maxRadius;
          const y = center + Math.sin(angle) * maxRadius;
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
              opacity="0.5"
              strokeDasharray="5,5"
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          );
        })}

        {/* Área preenchida das habilidades com gradiente */}
        <defs>
          <radialGradient id={`skillGradient-${rankColor}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`hsl(var(--${rankColor}))`} stopOpacity="0.6" />
            <stop offset="100%" stopColor={`hsl(var(--${rankColor}))`} stopOpacity="0.1" />
          </radialGradient>
        </defs>
        
        <polygon
          points={skills.map(skill => {
            const angle = (skill.angle * Math.PI) / 180;
            const radius = Math.max(0, Math.min(10, skill.value)) / 10 * maxRadius;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            return `${x},${y}`;
          }).join(' ')}
          fill={`url(#skillGradient-${rankColor})`}
          stroke={`hsl(var(--${rankColor}))`}
          strokeWidth="3"
          filter="url(#glow)"
          className="animate-scale-in drop-shadow-2xl"
        />

        {/* Pontos das habilidades com animação */}
        {skills.map((skill, index) => {
          const angle = (skill.angle * Math.PI) / 180;
          const radius = Math.max(0, Math.min(10, skill.value)) / 10 * maxRadius;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="8"
                fill={`hsl(var(--${rankColor}))`}
                stroke="hsl(var(--background))"
                strokeWidth="2"
                filter="url(#glow)"
                className="animate-scale-in hover:scale-125 transition-transform cursor-pointer"
                style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
              />
              <circle
                cx={x}
                cy={y}
                r="3"
                fill="hsl(var(--background))"
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1 + 0.7}s` }}
              />
            </g>
          );
        })}
      </svg>

      {/* Labels das habilidades com posicionamento melhorado */}
      {skills.map((skill, index) => {
        const angle = (skill.angle * Math.PI) / 180;
        const labelRadius = maxRadius + 30;
        const x = center + Math.cos(angle) * labelRadius;
        const y = center + Math.sin(angle) * labelRadius;
        
        return (
          <div
            key={index}
            className="absolute text-sm font-bold text-center transition-all duration-300 hover:scale-110 cursor-default"
            style={{
              left: `${x - 30}px`,
              top: `${y - 15}px`,
              width: '60px',
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="text-foreground">{skill.name}</div>
            <div className={`text-${rankColor} font-extrabold text-lg`}>
              {skill.value.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">/10</div>
          </div>
        );
      })}
    </div>
  );
};
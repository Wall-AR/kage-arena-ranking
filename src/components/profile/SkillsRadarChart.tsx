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
  return (
    <div className={cn("relative w-full h-80 flex items-center justify-center", className)}>
      <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
        {/* Grid do radar */}
        {[2, 4, 6, 8, 10].map((level) => (
          <circle
            key={level}
            cx="140"
            cy="140"
            r={level * 12}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}
        
        {/* Linhas dos eixos */}
        {skills.map((skill, index) => {
          const angle = (skill.angle * Math.PI) / 180;
          const x = 140 + Math.cos(angle) * 120;
          const y = 140 + Math.sin(angle) * 120;
          return (
            <line
              key={index}
              x1="140"
              y1="140"
              x2={x}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {/* Polígono das habilidades */}
        <polygon
          points={skills.map(skill => {
            const angle = (skill.angle * Math.PI) / 180;
            const radius = (skill.value / 10) * 120;
            const x = 140 + Math.cos(angle) * radius;
            const y = 140 + Math.sin(angle) * radius;
            return `${x},${y}`;
          }).join(' ')}
          fill={`hsl(var(--${rankColor}) / 0.3)`}
          stroke={`hsl(var(--${rankColor}))`}
          strokeWidth="2"
          className="drop-shadow-lg"
        />

        {/* Pontos das habilidades */}
        {skills.map((skill, index) => {
          const angle = (skill.angle * Math.PI) / 180;
          const radius = (skill.value / 10) * 120;
          const x = 140 + Math.cos(angle) * radius;
          const y = 140 + Math.sin(angle) * radius;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={`hsl(var(--${rankColor}))`}
              className="drop-shadow-md"
            />
          );
        })}
      </svg>

      {/* Labels das habilidades */}
      {skills.map((skill, index) => {
        const angle = (skill.angle * Math.PI) / 180;
        const x = 140 + Math.cos(angle) * 150;
        const y = 140 + Math.sin(angle) * 150;
        
        return (
          <div
            key={index}
            className="absolute text-xs font-semibold text-center transition-all duration-300 hover:scale-110"
            style={{
              left: `${x - 25}px`,
              top: `${y - 10}px`,
              width: '50px'
            }}
          >
            {skill.name}
            <div className="text-accent font-bold">{skill.value.toFixed(1)}</div>
          </div>
        );
      })}
    </div>
  );
};
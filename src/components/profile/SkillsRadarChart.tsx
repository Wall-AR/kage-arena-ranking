import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillsRadarChartProps {
  skills: {
    pin?: number;
    defense?: number;
    aerial?: number;
    kunai?: number;
    timing?: number;
    resource?: number;
    dash?: number;
    general?: number;
  };
}

export const SkillsRadarChart = ({ skills }: SkillsRadarChartProps) => {
  const size = 280;
  const center = size / 2;
  const maxRadius = 110;
  
  const skillsData = [
    { name: 'Dash', value: skills.dash || 0, angle: -90 },  // Topo
    { name: 'Geral', value: skills.general || 0, angle: -45 },  // Direita superior
    { name: 'Pin', value: skills.pin || 0, angle: 0 },  // Direita
    { name: 'Defesa', value: skills.defense || 0, angle: 45 },  // Direita inferior
    { name: 'Aéreo', value: skills.aerial || 0, angle: 90 },  // Baixo
    { name: 'Kunai', value: skills.kunai || 0, angle: 135 },  // Esquerda inferior
    { name: 'Timing', value: skills.timing || 0, angle: 180 },  // Esquerda
    { name: 'Recurso', value: skills.resource || 0, angle: 225 },  // Esquerda superior
  ];
  
  // Calcular dicas de melhoria baseadas nas habilidades mais baixas
  const weakestSkills = [...skillsData]
    .filter(s => s.name !== 'Geral')
    .sort((a, b) => a.value - b.value)
    .slice(0, 3);
  
  const improvementTips = weakestSkills.map(skill => {
    const tips: Record<string, string> = {
      "Pin": "Pratique combos e timing de guardbreak para melhorar seu Pin",
      "Defesa": "Trabalhe sua postura defensiva e aprenda a ler os movimentos do oponente",
      "Aéreo": "Treine combos aéreos e aprenda a usar o ar de forma mais efetiva",
      "Kunai": "Melhore sua precisão e timing de arremesso de kunais",
      "Timing": "Pratique o timing de substituição e contra-ataques",
      "Recurso": "Gerencie melhor sua chakra e aprenda quando usar jutsus",
      "Dash": "Aprimore sua mobilidade e aprenda a criar aberturas com dash"
    };
    return {
      skill: skill.name,
      tip: tips[skill.name] || "Continue praticando esta habilidade",
      score: skill.value
    };
  });
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Habilidades Avaliadas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Radar */}
          <div className="relative flex items-center justify-center min-h-[400px] w-full">
            <div className="relative w-full max-w-[280px] aspect-square">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg absolute inset-0">
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
              
              {/* Grid circular */}
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
                />
              ))}
              
              {/* Linhas dos eixos */}
              {skillsData.map((skill, index) => {
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
                  />
                );
              })}

              {/* Área preenchida das habilidades */}
              <defs>
                <radialGradient id="skillGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
                </radialGradient>
              </defs>
              
              <polygon
                points={skillsData.map(skill => {
                  const angle = (skill.angle * Math.PI) / 180;
                  const radius = Math.max(0, Math.min(10, skill.value)) / 10 * maxRadius;
                  const x = center + Math.cos(angle) * radius;
                  const y = center + Math.sin(angle) * radius;
                  return `${x},${y}`;
                }).join(' ')}
                fill="url(#skillGradient)"
                stroke="hsl(var(--accent))"
                strokeWidth="3"
                filter="url(#glow)"
                className="drop-shadow-2xl"
              />

              {/* Pontos das habilidades */}
              {skillsData.map((skill, index) => {
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
                      fill="hsl(var(--accent))"
                      stroke="hsl(var(--background))"
                      strokeWidth="2"
                      filter="url(#glow)"
                      className="hover:scale-125 transition-transform cursor-pointer"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="3"
                      fill="hsl(var(--background))"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Labels das habilidades */}
            {skillsData.map((skill, index) => {
              const angle = (skill.angle * Math.PI) / 180;
              const labelRadius = maxRadius + 30;
              const x = center + Math.cos(angle) * labelRadius;
              const y = center + Math.sin(angle) * labelRadius;
              
              // Converter coordenadas SVG para porcentagem
              const leftPercent = (x / size) * 100;
              const topPercent = (y / size) * 100;
              
              return (
                <div
                  key={index}
                  className="absolute text-xs font-bold text-center transition-all duration-300 hover:scale-110 cursor-default pointer-events-none"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    minWidth: '60px',
                  }}
                >
                  <div className="text-foreground text-xs whitespace-nowrap">{skill.name}</div>
                  <div className="text-accent font-extrabold text-sm">
                    {skill.value.toFixed(1)}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
          
          {/* Dicas de Melhoria */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">
              Áreas para Melhorar:
            </h4>
            {improvementTips.map((tip, index) => (
              <div 
                key={index}
                className="bg-muted/30 rounded-lg p-3 border-l-4 border-accent/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{index + 1}. {tip.skill}</span>
                  <Badge variant="outline" className="text-xs">
                    {tip.score.toFixed(1)}/10
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
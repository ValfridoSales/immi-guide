import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Target } from 'lucide-react';
import { ScenarioPatch } from '@/utils/simulation-engine';

interface ScenarioPresetCardProps {
  preset: ScenarioPatch;
  onSelect: (preset: ScenarioPatch) => void;
  disabled?: boolean;
}

const feasibilityColors = {
  easy: 'bg-green-500/10 text-green-700 dark:text-green-400',
  medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  hard: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

const feasibilityLabels = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

export function ScenarioPresetCard({ preset, onSelect, disabled }: ScenarioPresetCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <TrendingUp className="w-5 h-5 text-primary shrink-0" />
            <CardTitle className="text-base leading-tight">{preset.label}</CardTitle>
          </div>
          <Badge className={feasibilityColors[preset.feasibility]}>
            {feasibilityLabels[preset.feasibility]}
          </Badge>
        </div>
        <CardDescription className="text-sm mt-2">
          {preset.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{preset.estimatedTime}</span>
        </div>
        <Button 
          variant="outline" 
          className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={() => onSelect(preset)}
          disabled={disabled}
        >
          <Target className="w-4 h-4 mr-2" />
          Simular este cenário
        </Button>
      </CardContent>
    </Card>
  );
}

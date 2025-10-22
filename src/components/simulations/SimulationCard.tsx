import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { SimulationResult } from '@/utils/simulation-engine';
import { SavedSimulation } from '@/hooks/useSimulations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SimulationCardProps {
  simulation: SavedSimulation;
  onDelete: (id: string) => void;
  onView: (simulation: SavedSimulation) => void;
}

const categoryLabels: Record<string, string> = {
  language: 'Idioma',
  education: 'Educação',
  experience: 'Experiência',
  age: 'Idade',
  additional: 'Pontos Adicionais',
  spouse: 'Cônjuge',
  combo: 'Combinado',
};

export function SimulationCard({ simulation, onDelete, onView }: SimulationCardProps) {
  const difference = simulation.score_difference;
  const isPositive = difference > 0;
  const isNegative = difference < 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base mb-1">{simulation.simulation_name}</CardTitle>
            <CardDescription className="text-xs">
              {categoryLabels[simulation.simulation_type] || simulation.simulation_type}
            </CardDescription>
          </div>
          <Badge 
            variant={isPositive ? 'default' : isNegative ? 'destructive' : 'secondary'}
            className="shrink-0"
          >
            {isPositive && <TrendingUp className="w-3 h-3 mr-1" />}
            {isNegative && <TrendingDown className="w-3 h-3 mr-1" />}
            {difference > 0 ? '+' : ''}{difference} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Base → Projetado</span>
          <span className="font-semibold">
            {simulation.base_crs_score} → {simulation.projected_crs_score}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView(simulation)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deletar simulação?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja deletar "{simulation.simulation_name}"? 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(simulation.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

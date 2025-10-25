import { QuizResult } from '@/types/quiz';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgramCard } from '@/components/pdf/ProgramCard';

interface QuizResultsProps {
  results: QuizResult[];
  onRestart: () => void;
}

export function QuizResults({ results, onRestart }: QuizResultsProps) {
  const topResults = results.slice(0, 3);


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-4xl">🎉</div>
        <h1 className="text-3xl font-bold bg-gradient-canadian bg-clip-text text-transparent">
          Seus Resultados Personalizados
        </h1>
        <p className="text-lg text-muted-foreground">
          Baseado no seu perfil, aqui estão os melhores programas para você
        </p>
      </div>

      {/* Results Cards */}
      <div className="space-y-6">
        {topResults.map((result, index) => (
          <ProgramCard 
            key={result.programId} 
            result={result} 
            index={index} 
            printMode={false}
          />
        ))}
      </div>

      {/* Action */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onRestart}
          className="text-lg px-8 py-3"
        >
          Refazer Quiz
        </Button>
      </div>
    </div>
  );
}
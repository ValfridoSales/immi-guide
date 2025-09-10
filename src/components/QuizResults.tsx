import { QuizResult } from '@/types/quiz';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgramCard } from '@/components/pdf/ProgramCard';

interface QuizResultsProps {
  results: QuizResult[];
  onStartLeadCapture: () => void;
}

export function QuizResults({ results, onStartLeadCapture }: QuizResultsProps) {
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

      {/* CTA */}
      <Card className="p-8 bg-gradient-subtle text-center shadow-elevated">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-foreground">
            Quer uma Análise Completa Personalizada?
          </h3>
          <p className="text-muted-foreground">
            Receba um cronograma detalhado, checklist de documentos, calculadora do CRS Score e muito mais!
          </p>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Inclui:</div>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Calculadora CRS Score',
                'Cronograma personalizado',
                'Checklist de documentos',
                'Guia de custos detalhado',
                'Contatos de consultores'
              ].map((item) => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <Button 
              variant="canadian" 
              size="lg" 
              onClick={onStartLeadCapture}
              className="text-lg px-8 py-3"
            >
              Quero Minha Análise Completa Gratuita
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
import { QuizResult } from '@/types/quiz';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

interface QuizResultsProps {
  results: QuizResult[];
  onStartLeadCapture: () => void;
}

export function QuizResults({ results, onStartLeadCapture }: QuizResultsProps) {
  const topResults = results.slice(0, 3);

  const getRankEmoji = (index: number) => {
    const emojis = ['🥇', '🥈', '🥉'];
    return emojis[index] || '🏅';
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

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
          <Card key={result.programId} className="p-6 shadow-elevated hover:shadow-soft transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getRankEmoji(index)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {result.programName}
                    </h3>
                    {index === 0 && (
                      <Badge variant="default" className="mt-1">
                        MAIS RECOMENDADO
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Compatibilidade</div>
                  <div className={`text-2xl font-bold ${getCompatibilityColor(result.compatibility)}`}>
                    {result.compatibility}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <Progress value={result.compatibility} variant="canadian" />

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Tempo</div>
                    <div className="font-semibold">{result.estimatedTime}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Investimento</div>
                    <div className="font-semibold">{result.investment}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground">{result.description}</p>

              {/* Strengths and Improvements */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-700">Seus Pontos Fortes</span>
                  </div>
                  <ul className="space-y-1">
                    {result.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-orange-700">Pontos a Melhorar</span>
                  </div>
                  <ul className="space-y-1">
                    {result.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
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
          <Button 
            variant="canadian" 
            size="lg" 
            onClick={onStartLeadCapture}
            className="text-lg px-8 py-3"
          >
            Quero Minha Análise Completa Gratuita
          </Button>
        </div>
      </Card>
    </div>
  );
}
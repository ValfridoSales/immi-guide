import { QuizResult } from '@/types/quiz';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { immigrationPrograms } from '@/data/immigration-programs';

interface ProgramCardProps {
  result: QuizResult;
  index: number;
  printMode?: boolean;
}

export function ProgramCard({ result, index, printMode = false }: ProgramCardProps) {
  const getRankEmoji = (index: number) => {
    const emojis = ['🥇', '🥈', '🥉'];
    return emojis[index] || '🏅';
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const program = immigrationPrograms.find(p => p.id === result.programId);

  return (
    <Card 
      className={`p-6 shadow-elevated ${!printMode ? 'hover:shadow-soft transition-shadow' : ''} ${printMode ? 'break-inside-avoid' : ''}`}
    >
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

        {/* Official Website Link */}
        {program && !printMode && (
          <div className="pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(program.officialUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver informações oficiais no site do governo
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
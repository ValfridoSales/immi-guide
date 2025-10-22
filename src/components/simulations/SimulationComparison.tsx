import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Zap } from 'lucide-react';
import { SimulationResult, compareSimulations } from '@/utils/simulation-engine';

interface SimulationComparisonProps {
  results: SimulationResult[];
}

export function SimulationComparison({ results }: SimulationComparisonProps) {
  const comparison = compareSimulations(results);
  
  if (!comparison || results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Análise Comparativa</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* Melhor opção geral */}
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Maior Ganho</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">{comparison.biggestImpact.scenarioName}</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{comparison.biggestImpact.difference} pontos
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {comparison.biggestImpact.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vitória mais rápida */}
        <Card className="border-2 border-green-500/50 bg-green-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-base">Mais Rápido</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">{comparison.quickestWin.scenarioName}</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                  +{comparison.quickestWin.difference} pontos
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Tempo estimado: {comparison.quickestWin.estimatedTime}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas gerais */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Simulações:</span>
                <span className="font-semibold">{results.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Com ganho:</span>
                <span className="font-semibold text-green-600">
                  {results.filter(r => r.difference > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Com perda:</span>
                <span className="font-semibold text-red-600">
                  {results.filter(r => r.difference < 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Neutras:</span>
                <span className="font-semibold">
                  {results.filter(r => r.difference === 0).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela comparativa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparação Detalhada</CardTitle>
          <CardDescription>Todos os cenários lado a lado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cenário</th>
                  <th className="text-right p-2">Base</th>
                  <th className="text-right p-2">Projetado</th>
                  <th className="text-right p-2">Diferença</th>
                  <th className="text-center p-2">Dificuldade</th>
                  <th className="text-center p-2">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {results
                  .sort((a, b) => b.difference - a.difference)
                  .map((result) => (
                    <tr key={result.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{result.scenarioName}</td>
                      <td className="p-2 text-right font-mono">{result.baseScore.total}</td>
                      <td className="p-2 text-right font-mono">{result.projectedScore.total}</td>
                      <td className={`p-2 text-right font-mono font-semibold ${
                        result.difference > 0 ? 'text-green-600 dark:text-green-400' :
                        result.difference < 0 ? 'text-red-600 dark:text-red-400' : ''
                      }`}>
                        {result.difference > 0 ? '+' : ''}{result.difference}
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant="outline" className="text-xs">
                          {result.feasibility === 'easy' ? '✓ Fácil' :
                           result.feasibility === 'medium' ? '○ Médio' : '● Difícil'}
                        </Badge>
                      </td>
                      <td className="p-2 text-center text-xs text-muted-foreground">
                        {result.estimatedTime}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

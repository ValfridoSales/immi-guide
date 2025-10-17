import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { DrawsChart } from '@/components/express-entry/DrawsChart';
import { DrawsTable } from '@/components/express-entry/DrawsTable';
import { DrawFilters } from '@/components/express-entry/DrawFilters';
import { ChartLineSelector } from '@/components/express-entry/ChartLineSelector';
import { useDrawsTable, useDrawsSeries } from '@/hooks/useExpressEntryDraws';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

const ExpressEntryDraws = () => {
  const [window, setWindow] = useState<'6m' | '12m' | 'all'>('12m');
  const [type, setType] = useState<string>('all');
  const [userCrs, setUserCrs] = useState<number | null>(null);
  const [chartLines, setChartLines] = useState<'both' | 'crs' | 'itas'>('both');

  const handleTypeChange = (newType: string) => {
    setType(newType === 'all' ? '' : newType);
  };

  const filterType = type === 'all' ? '' : type;

  const { data: seriesData, isLoading: seriesLoading, error: seriesError } = useDrawsSeries({ 
    window, 
    type: filterType,
    minCrs: userCrs ?? undefined
  });
  const { data: tableData, isLoading: tableLoading, error: tableError } = useDrawsTable({ 
    limit: 20, 
    type: filterType,
    minCrs: userCrs ?? undefined
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-canadian bg-clip-text text-transparent">
              Express Entry Draws
            </h1>
            <p className="text-lg text-muted-foreground">
              Acompanhe os últimos rounds de convites do Express Entry com dados atualizados automaticamente
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Os dados são sincronizados automaticamente a cada 6 horas diretamente do site oficial do IRCC (Immigration, Refugees and Citizenship Canada).
            </AlertDescription>
          </Alert>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>
                Personalize a visualização dos dados de acordo com suas preferências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DrawFilters
                window={window}
                type={type}
                userCrs={userCrs}
                onWindowChange={setWindow}
                onTypeChange={handleTypeChange}
                onUserCrsChange={setUserCrs}
              />
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Gráfico de Tendências</CardTitle>
                  <CardDescription>
                    CRS mínimo e número de convites (ITAs) ao longo do tempo
                  </CardDescription>
                </div>
                <ChartLineSelector value={chartLines} onChange={setChartLines} />
              </div>
            </CardHeader>
            <CardContent>
              {seriesLoading ? (
                <Skeleton className="w-full h-[400px]" />
              ) : seriesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erro ao carregar dados do gráfico. Tente novamente mais tarde.
                  </AlertDescription>
                </Alert>
              ) : seriesData && seriesData.items.length > 0 ? (
                <>
                  <DrawsChart data={seriesData.items} visibleLines={chartLines} />
                  <p className="text-xs text-muted-foreground text-right mt-4">
                    Atualizado em: {new Date(seriesData.updatedAt).toLocaleString('pt-BR')}
                  </p>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Draws</CardTitle>
              <CardDescription>
                Tabela completa com todos os rounds de convites recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tableLoading ? (
                <div className="space-y-2">
                  <Skeleton className="w-full h-12" />
                  <Skeleton className="w-full h-12" />
                  <Skeleton className="w-full h-12" />
                </div>
              ) : tableError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erro ao carregar tabela de draws. Tente novamente mais tarde.
                  </AlertDescription>
                </Alert>
              ) : tableData ? (
                <>
                  <DrawsTable draws={tableData.draws} />
                  <p className="text-sm text-muted-foreground mt-4">
                    Mostrando {tableData.draws.length} draw{tableData.draws.length !== 1 ? 's' : ''}
                  </p>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Footer Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Nota importante:</strong> Os dados apresentados são para fins informativos apenas. 
              Para informações oficiais e atualizadas, visite sempre o{' '}
              <a 
                href="https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                site oficial do IRCC
              </a>.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    </div>
  );
};

export default ExpressEntryDraws;
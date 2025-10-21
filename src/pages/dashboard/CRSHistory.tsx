import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProFeatureGuard } from '@/components/dashboard/ProFeatureGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Target } from 'lucide-react';

export default function CRSHistory() {
  return (
    <DashboardLayout>
      <ProFeatureGuard feature="crs_history">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Histórico de Pontuação CRS</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe a evolução da sua pontuação ao longo do tempo
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Pontuação Atual</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">-- pts</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Calculado em: --
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Variação</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">-- pts</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Cálculos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">--</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de registros
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Pontuação</CardTitle>
              <CardDescription>
                Gráfico mostrando a variação da sua pontuação CRS ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">
                  Calcule seu CRS para começar a acompanhar seu histórico
                </p>
              </div>
            </CardContent>
          </Card>

          {/* History Table Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico Detalhado</CardTitle>
              <CardDescription>
                Todas as suas calculações anteriores com detalhes completos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">
                  Nenhum cálculo registrado ainda
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProFeatureGuard>
    </DashboardLayout>
  );
}

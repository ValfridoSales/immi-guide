import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProFeatureGuard } from '@/components/dashboard/ProFeatureGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Target, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CRSCalculation {
  id: string;
  total_score: number;
  core_score: number;
  spouse_score: number;
  transferability_score: number;
  additional_score: number;
  created_at: string;
}

export default function CRSHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [calculations, setCalculations] = useState<CRSCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCalculations();
    }
  }, [user]);

  const loadCalculations = async () => {
    try {
      const { data, error } = await supabase
        .from('crs_calculations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCalculations(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar histórico',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crs_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCalculations(calculations.filter(calc => calc.id !== id));
      toast({
        title: 'Cálculo removido',
        description: 'O cálculo foi removido do histórico.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const latestScore = calculations.length > 0 ? calculations[0].total_score : null;
  const previousScore = calculations.length > 1 ? calculations[1].total_score : null;
  const scoreDiff = latestScore && previousScore ? latestScore - previousScore : null;

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

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : (
            <>
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
                    <div className="text-3xl font-bold">
                      {latestScore !== null ? `${latestScore} pts` : '--'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {calculations.length > 0
                        ? `Calculado em: ${new Date(calculations[0].created_at).toLocaleDateString('pt-BR')}`
                        : 'Nenhum cálculo ainda'}
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
                    <div className={`text-3xl font-bold ${
                      scoreDiff && scoreDiff > 0 ? 'text-green-600' : 
                      scoreDiff && scoreDiff < 0 ? 'text-red-600' : 
                      'text-muted-foreground'
                    }`}>
                      {scoreDiff !== null 
                        ? `${scoreDiff > 0 ? '+' : ''}${scoreDiff} pts`
                        : '--'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {previousScore !== null ? 'Desde último cálculo' : 'Faça mais cálculos'}
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
                    <div className="text-3xl font-bold">{calculations.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total de registros
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* History Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico Detalhado</CardTitle>
                  <CardDescription>
                    Todas as suas calculações anteriores com detalhes completos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculations.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
                      <p className="text-muted-foreground">
                        Nenhum cálculo registrado ainda. Calcule seu CRS para começar!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {calculations.map((calc, index) => (
                        <div
                          key={calc.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold text-primary">
                                {calc.total_score}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(calc.created_at).toLocaleDateString('pt-BR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Core: {calc.core_score} | Spouse: {calc.spouse_score} | 
                                  Transfer: {calc.transferability_score} | 
                                  Additional: {calc.additional_score}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(calc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ProFeatureGuard>
    </DashboardLayout>
  );
}

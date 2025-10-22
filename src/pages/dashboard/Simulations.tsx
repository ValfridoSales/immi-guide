import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProFeatureGuard } from '@/components/dashboard/ProFeatureGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus, TrendingUp, Loader2 } from 'lucide-react';
import { useSimulations } from '@/hooks/useSimulations';
import { SimulationWizard } from '@/components/simulations/SimulationWizard';
import { SimulationCard } from '@/components/simulations/SimulationCard';
import { SimulationComparison } from '@/components/simulations/SimulationComparison';
import { SCENARIO_PRESETS } from '@/utils/simulation-engine';
import { ScenarioPresetCard } from '@/components/simulations/ScenarioPresetCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function Simulations() {
  const {
    simulations,
    loading,
    currentBaseInput,
    deleteSimulation,
    parseSimulation,
    runSimulation,
  } = useSimulations();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewSimulation, setViewSimulation] = useState<any>(null);

  const handleOpenWizard = () => {
    if (!currentBaseInput) {
      // Mostrar alerta para calcular CRS primeiro
      alert('Por favor, calcule seu CRS primeiro na página Calculadora CRS antes de criar simulações.');
      return;
    }
    setWizardOpen(true);
  };

  const handleViewSimulation = (simulation: any) => {
    const result = parseSimulation(simulation);
    setViewSimulation(result);
  };

  // Executar algumas simulações automáticas se não houver nenhuma salva
  const autoSimulations = currentBaseInput && simulations.length === 0 
    ? SCENARIO_PRESETS.slice(0, 4).map(preset => {
        try {
          return runSimulation(currentBaseInput, preset);
        } catch (error) {
          console.error('Erro ao rodar simulação preset:', preset.id, error);
          return null;
        }
      }).filter(Boolean) as any[]
    : [];

  return (
    <DashboardLayout>
      <ProFeatureGuard feature="simulations">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Simulações de Cenários</h1>
              <p className="text-muted-foreground mt-1">
                Teste diferentes cenários e veja o impacto na sua pontuação CRS
              </p>
            </div>
            <Button 
              className="bg-gradient-canadian border-0"
              onClick={handleOpenWizard}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Simulação
            </Button>
          </div>

          {/* Info sobre CRS base */}
          {!currentBaseInput && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Você precisa calcular seu CRS primeiro na página{' '}
                <a href="/crs-calculator" className="underline font-semibold">
                  Calculadora CRS
                </a>
                {' '}antes de criar simulações.
              </AlertDescription>
            </Alert>
          )}

          {/* Como funcionam as simulações */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Como funcionam as simulações?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Teste "e se" cenários: "E se eu melhorar meu inglês para CLB 9?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Compare múltiplos cenários lado a lado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Veja o impacto exato de cada mudança na sua pontuação</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Identifique as melhores estratégias para aumentar seu CRS</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Presets sugeridos (apenas se tiver CRS calculado) */}
          {currentBaseInput && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Cenários Sugeridos</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {SCENARIO_PRESETS.slice(0, 6).map(preset => (
                  <ScenarioPresetCard
                    key={preset.id}
                    preset={preset}
                    onSelect={(p) => {
                      const result = runSimulation(currentBaseInput, p);
                      setViewSimulation(result);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Simulações Salvas */}
          <Card>
            <CardHeader>
              <CardTitle>Suas Simulações Salvas</CardTitle>
              <CardDescription>
                Acesse suas simulações anteriores a qualquer momento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : simulations.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Você ainda não criou nenhuma simulação
                    </p>
                    <Button 
                      className="bg-gradient-canadian border-0"
                      onClick={handleOpenWizard}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Simulação
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {simulations.map(sim => (
                      <SimulationCard
                        key={sim.id}
                        simulation={sim}
                        onDelete={deleteSimulation}
                        onView={handleViewSimulation}
                      />
                    ))}
                  </div>

                  {/* Comparação se houver múltiplas simulações */}
                  {simulations.length > 1 && (
                    <SimulationComparison 
                      results={simulations.map(s => parseSimulation(s)!).filter(Boolean)} 
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview de simulações automáticas */}
          {autoSimulations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview de Cenários</CardTitle>
                <CardDescription>
                  Baseado no seu perfil atual - salve as que você gostar!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimulationComparison results={autoSimulations} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Wizard Dialog */}
        <SimulationWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          baseInput={currentBaseInput}
        />

        {/* View Simulation Dialog */}
        <Dialog open={!!viewSimulation} onOpenChange={() => setViewSimulation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{viewSimulation?.scenarioName}</DialogTitle>
              <DialogDescription>{viewSimulation?.description}</DialogDescription>
            </DialogHeader>
            {viewSimulation && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Score Base</div>
                    <div className="text-2xl font-bold">{viewSimulation.baseScore.total}</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Score Projetado</div>
                    <div className="text-2xl font-bold text-primary">{viewSimulation.projectedScore.total}</div>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${
                    viewSimulation.difference > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <div className="text-sm text-muted-foreground mb-1">Diferença</div>
                    <div className={`text-2xl font-bold ${
                      viewSimulation.difference > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {viewSimulation.difference > 0 ? '+' : ''}{viewSimulation.difference}
                    </div>
                  </div>
                </div>

                {viewSimulation.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recomendações:</h4>
                    <ul className="space-y-1 text-sm">
                      {viewSimulation.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </ProFeatureGuard>
    </DashboardLayout>
  );
}

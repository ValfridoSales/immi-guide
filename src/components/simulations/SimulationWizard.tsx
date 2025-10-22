import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScenarioPresetCard } from './ScenarioPresetCard';
import { SCENARIO_PRESETS, ScenarioPatch, SimulationResult } from '@/utils/simulation-engine';
import { InputCRS } from '@/utils/crs-engine';
import { useSimulations } from '@/hooks/useSimulations';
import { Loader2, Save, PlayCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SimulationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseInput: InputCRS | null;
}

export function SimulationWizard({ open, onOpenChange, baseInput }: SimulationWizardProps) {
  const { runSimulation, saveSimulation, loading } = useSimulations();
  const [selectedPreset, setSelectedPreset] = useState<ScenarioPatch | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelectPreset = (preset: ScenarioPatch) => {
    if (!baseInput) {
      toast({
        title: 'Erro',
        description: 'Calcule seu CRS primeiro antes de criar simulações',
        variant: 'destructive',
      });
      return;
    }

    // Para cenário de idade futura, ajustar dinamicamente
    let adjustedPreset = preset;
    if (preset.id === 'age-future-1y') {
      adjustedPreset = {
        ...preset,
        changes: {
          age: baseInput.age + 1,
        },
      };
    }

    const simulationResult = runSimulation(baseInput, adjustedPreset);
    setSelectedPreset(adjustedPreset);
    setResult(simulationResult);
  };

  const handleSave = async () => {
    if (!result || !baseInput) return;
    
    setSaving(true);
    try {
      await saveSimulation(result, baseInput);
      onOpenChange(false);
      setSelectedPreset(null);
      setResult(null);
    } finally {
      setSaving(false);
    }
  };

  const handleRunOnly = () => {
    toast({
      title: 'Simulação executada!',
      description: `${result?.scenarioName}: ${result?.difference! > 0 ? '+' : ''}${result?.difference} pontos`,
    });
    onOpenChange(false);
    setSelectedPreset(null);
    setResult(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedPreset(null);
    setResult(null);
  };

  // Separar presets por categoria
  const languagePresets = SCENARIO_PRESETS.filter(p => p.category === 'language');
  const educationPresets = SCENARIO_PRESETS.filter(p => p.category === 'education');
  const experiencePresets = SCENARIO_PRESETS.filter(p => p.category === 'experience');
  const additionalPresets = SCENARIO_PRESETS.filter(p => p.category === 'additional');
  const otherPresets = SCENARIO_PRESETS.filter(p => 
    !['language', 'education', 'experience', 'additional'].includes(p.category)
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {result ? 'Resultado da Simulação' : 'Nova Simulação de Cenário'}
          </DialogTitle>
          <DialogDescription>
            {result 
              ? 'Veja o impacto deste cenário na sua pontuação CRS'
              : 'Escolha um cenário para simular o impacto na sua pontuação CRS'
            }
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <Tabs defaultValue="language" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="language">Idioma</TabsTrigger>
              <TabsTrigger value="education">Educação</TabsTrigger>
              <TabsTrigger value="experience">Experiência</TabsTrigger>
              <TabsTrigger value="additional">Pontos+</TabsTrigger>
              <TabsTrigger value="other">Outros</TabsTrigger>
            </TabsList>

            <TabsContent value="language" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {languagePresets.map(preset => (
                  <ScenarioPresetCard
                    key={preset.id}
                    preset={preset}
                    onSelect={handleSelectPreset}
                    disabled={!baseInput}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="education" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {educationPresets.map(preset => (
                  <ScenarioPresetCard
                    key={preset.id}
                    preset={preset}
                    onSelect={handleSelectPreset}
                    disabled={!baseInput}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {experiencePresets.map(preset => (
                  <ScenarioPresetCard
                    key={preset.id}
                    preset={preset}
                    onSelect={handleSelectPreset}
                    disabled={!baseInput}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {additionalPresets.map(preset => (
                  <ScenarioPresetCard
                    key={preset.id}
                    preset={preset}
                    onSelect={handleSelectPreset}
                    disabled={!baseInput}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {otherPresets.map(preset => (
                  <ScenarioPresetCard
                    key={preset.id}
                    preset={preset}
                    onSelect={handleSelectPreset}
                    disabled={!baseInput}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            {/* Header com scores */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Score Base</div>
                <div className="text-3xl font-bold">{result.baseScore.total}</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Score Projetado</div>
                <div className="text-3xl font-bold text-primary">{result.projectedScore.total}</div>
              </div>
              <div className={`text-center p-4 rounded-lg ${
                result.difference > 0 ? 'bg-green-500/10' : 
                result.difference < 0 ? 'bg-red-500/10' : 'bg-muted/50'
              }`}>
                <div className="text-sm text-muted-foreground mb-1">Diferença</div>
                <div className={`text-3xl font-bold ${
                  result.difference > 0 ? 'text-green-600 dark:text-green-400' : 
                  result.difference < 0 ? 'text-red-600 dark:text-red-400' : ''
                }`}>
                  {result.difference > 0 ? '+' : ''}{result.difference}
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              <h4 className="font-semibold">Breakdown de Pontos:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Core/Human Capital:</span>
                  <span className="font-mono">
                    {result.baseScore.core} → {result.projectedScore.core}
                    {result.breakdown.core !== 0 && (
                      <span className={result.breakdown.core > 0 ? 'text-green-600' : 'text-red-600'}>
                        {' '}({result.breakdown.core > 0 ? '+' : ''}{result.breakdown.core})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Spouse Factors:</span>
                  <span className="font-mono">
                    {result.baseScore.spouse} → {result.projectedScore.spouse}
                    {result.breakdown.spouse !== 0 && (
                      <span className={result.breakdown.spouse > 0 ? 'text-green-600' : 'text-red-600'}>
                        {' '}({result.breakdown.spouse > 0 ? '+' : ''}{result.breakdown.spouse})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Skill Transferability:</span>
                  <span className="font-mono">
                    {result.baseScore.transferability} → {result.projectedScore.transferability}
                    {result.breakdown.transferability !== 0 && (
                      <span className={result.breakdown.transferability > 0 ? 'text-green-600' : 'text-red-600'}>
                        {' '}({result.breakdown.transferability > 0 ? '+' : ''}{result.breakdown.transferability})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Additional Points:</span>
                  <span className="font-mono">
                    {result.baseScore.additional} → {result.projectedScore.additional}
                    {result.breakdown.additional !== 0 && (
                      <span className={result.breakdown.additional > 0 ? 'text-green-600' : 'text-red-600'}>
                        {' '}({result.breakdown.additional > 0 ? '+' : ''}{result.breakdown.additional})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Recomendações */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Recomendações:</h4>
                <ul className="space-y-1 text-sm">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="space-y-2 p-3 bg-yellow-500/10 rounded-lg">
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">⚠️ Atenção:</h4>
                <ul className="space-y-1 text-sm">
                  {result.warnings.map((warn, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Fechar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRunOnly}
                className="flex-1"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Apenas Executar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-canadian border-0"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Simulação
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

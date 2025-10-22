import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { simulateScenario, SimulationResult, ScenarioPatch } from '@/utils/simulation-engine';
import { InputCRS } from '@/utils/crs-engine';

export interface SavedSimulation {
  id: string;
  user_id: string;
  simulation_name: string;
  simulation_type: string;
  base_crs_score: number;
  projected_crs_score: number;
  score_difference: number;
  changes: any; // JSONB com SimulationResult completo
  created_at: string;
}

export function useSimulations() {
  const { user, isPro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [currentBaseInput, setCurrentBaseInput] = useState<InputCRS | null>(null);

  // Carregar simulações salvas do banco
  const loadSimulations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crs_simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSimulations(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar simulações:', error);
      toast({
        title: 'Erro ao carregar simulações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar último cálculo de CRS como base se não houver currentBaseInput
  const loadLastCRSCalculation = async () => {
    if (!user) {
      console.log('❌ Sem usuário para carregar CRS');
      return;
    }
    
    if (currentBaseInput) {
      console.log('✅ CRS já carregado:', currentBaseInput);
      return;
    }
    
    console.log('🔍 Buscando último cálculo CRS no banco...');
    
    try {
      const { data, error } = await supabase
        .from('crs_calculations')
        .select('calculation_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Erro ao buscar cálculo:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('⚠️ Nenhum cálculo encontrado no banco');
        return;
      }
      
      console.log('📦 Dados carregados do banco:', data.calculation_data);
      
      if (data.calculation_data) {
        const inputData = data.calculation_data as any;
        
        // Validar se tem a estrutura mínima necessária
        if (inputData && inputData.firstOfficial && inputData.education) {
          console.log('✅ Dados válidos, setando currentBaseInput');
          setCurrentBaseInput(inputData as InputCRS);
        } else {
          console.warn('⚠️ Calculation data incompleto ou inválido:', inputData);
          console.log('Campos presentes:', Object.keys(inputData || {}));
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar último cálculo CRS:', error);
    }
  };

  // Carregar simulações e último CRS ao montar ou quando user muda
  useEffect(() => {
    if (user && isPro) {
      loadSimulations();
      loadLastCRSCalculation();
    }
  }, [user, isPro]);

  // Salvar nova simulação
  const saveSimulation = async (
    result: SimulationResult,
    baseInput: InputCRS
  ): Promise<string | null> => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para salvar simulações',
        variant: 'destructive',
      });
      return null;
    }

    if (!isPro) {
      toast({
        title: 'Feature Premium',
        description: 'Salvar simulações é uma funcionalidade do Plano Pro',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('crs_simulations')
        .insert({
          user_id: user.id,
          simulation_name: result.scenarioName,
          simulation_type: result.category,
          base_crs_score: result.baseScore.total,
          projected_crs_score: result.projectedScore.total,
          score_difference: result.difference,
          changes: {
            ...result,
            baseInput, // Salvar input base também para poder recriar
          } as any,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      await loadSimulations();
      
      toast({
        title: 'Simulação salva!',
        description: `"${result.scenarioName}" foi salva com sucesso`,
      });
      
      return data?.id || null;
    } catch (error: any) {
      console.error('Erro ao salvar simulação:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Deletar simulação
  const deleteSimulation = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('crs_simulations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await loadSimulations();
      
      toast({
        title: 'Simulação deletada',
        description: 'A simulação foi removida com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao deletar simulação:', error);
      toast({
        title: 'Erro ao deletar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Executar simulação sem salvar (preview)
  const runSimulation = (
    baseInput: InputCRS,
    patch: ScenarioPatch
  ): SimulationResult => {
    return simulateScenario(baseInput, patch);
  };

  // Executar múltiplas simulações
  const runMultipleSimulations = (
    baseInput: InputCRS,
    patches: ScenarioPatch[]
  ): SimulationResult[] => {
    return patches.map(patch => simulateScenario(baseInput, patch));
  };

  // Converter simulação salva de volta para SimulationResult
  const parseSimulation = (saved: SavedSimulation): SimulationResult | null => {
    try {
      if (!saved.changes) return null;
      return saved.changes as SimulationResult;
    } catch (error) {
      console.error('Erro ao parsear simulação:', error);
      return null;
    }
  };

  return {
    // Estado
    simulations,
    loading,
    currentBaseInput,
    
    // Ações
    loadSimulations,
    saveSimulation,
    deleteSimulation,
    runSimulation,
    runMultipleSimulations,
    parseSimulation,
    setCurrentBaseInput,
  };
}

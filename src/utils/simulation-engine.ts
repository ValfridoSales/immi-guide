import { InputCRS, CRSResult, computeCrs, EducationKey, LanguageCLBs, CLB } from './crs-engine';

// ===== Tipos para Simulação =====

export type SimulationCategory = 'language' | 'education' | 'experience' | 'age' | 'additional' | 'spouse' | 'combo';

export interface ScenarioPatch {
  id: string;
  label: string;
  description: string;
  category: SimulationCategory;
  changes: Partial<InputCRS>;
  feasibility: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}

export interface SimulationResult {
  id: string;
  scenarioName: string;
  description: string;
  category: SimulationCategory;
  baseScore: CRSResult;
  projectedScore: CRSResult;
  difference: number;
  percentageChange: number;
  recommendations: string[];
  warnings: string[];
  feasibility: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  breakdown: {
    core: number;
    spouse: number;
    transferability: number;
    additional: number;
  };
}

// ===== Função Principal: Simular Cenário =====

export function simulateScenario(
  baseInput: InputCRS,
  patch: ScenarioPatch
): SimulationResult {
  // 1. Calcular score base
  const baseScore = computeCrs(baseInput);
  
  // 2. Aplicar mudanças do cenário (deep merge)
  const modifiedInput: InputCRS = {
    ...baseInput,
    ...patch.changes,
    spouse: patch.changes.spouse 
      ? { ...baseInput.spouse, ...patch.changes.spouse }
      : baseInput.spouse,
    additional: patch.changes.additional
      ? { ...baseInput.additional, ...patch.changes.additional }
      : baseInput.additional,
  };
  
  // 3. Recalcular com as mudanças
  const projectedScore = computeCrs(modifiedInput);
  
  // 4. Analisar diferença
  const difference = projectedScore.total - baseScore.total;
  const percentageChange = baseScore.total > 0 
    ? ((difference / baseScore.total) * 100)
    : 0;
  
  // 5. Gerar recomendações e warnings
  const recommendations = generateRecommendations(baseInput, modifiedInput, difference, patch);
  const warnings = generateWarnings(modifiedInput, patch);
  
  // 6. Breakdown de diferenças
  const breakdown = {
    core: projectedScore.core - baseScore.core,
    spouse: projectedScore.spouse - baseScore.spouse,
    transferability: projectedScore.transferability - baseScore.transferability,
    additional: projectedScore.additional - baseScore.additional,
  };
  
  return {
    id: patch.id,
    scenarioName: patch.label,
    description: patch.description,
    category: patch.category,
    baseScore,
    projectedScore,
    difference,
    percentageChange,
    recommendations,
    warnings,
    feasibility: patch.feasibility,
    estimatedTime: patch.estimatedTime,
    breakdown,
  };
}

// ===== Helpers: Recomendações e Warnings =====

function generateRecommendations(
  baseInput: InputCRS,
  modifiedInput: InputCRS,
  difference: number,
  patch: ScenarioPatch
): string[] {
  const recs: string[] = [];
  
  if (difference > 0) {
    recs.push(`Ganho de ${difference} pontos neste cenário`);
    
    if (patch.category === 'language') {
      // Detectar se é inglês ou francês
      const isFrench = patch.changes.secondOfficial !== undefined;
      
      if (isFrench) {
        recs.push('Considere investir em cursos preparatórios para TEF Canada/TCF Canada');
      } else {
        recs.push('Considere investir em cursos preparatórios para IELTS/CELPIP');
      }
      recs.push('Prática regular de 2-3h por dia pode levar a progressos significativos');
    }
    
    if (patch.category === 'education') {
      recs.push('Verifique se seu diploma será reconhecido no Canadá (ECA)');
      recs.push('Mestrados online podem ser uma opção mais rápida');
    }
    
    if (patch.category === 'experience') {
      recs.push('Experiência canadense vale mais pontos - considere um visto de trabalho temporário');
    }
    
    if (patch.category === 'additional' && modifiedInput.additional?.pnpNomination) {
      recs.push('PNP é a maneira mais rápida de garantir 600 pontos extras');
      recs.push('Pesquise programas provinciais que se encaixam no seu perfil');
    }
    
    if (difference >= 50) {
      recs.push('Este cenário pode te colocar acima do cutoff típico do Express Entry!');
    }
  } else if (difference < 0) {
    recs.push(`Perda de ${Math.abs(difference)} pontos neste cenário`);
    recs.push('Este cenário não é recomendado - foque em outras estratégias');
  } else {
    recs.push('Nenhum impacto na pontuação com esta mudança');
  }
  
  return recs;
}

function generateWarnings(input: InputCRS, patch: ScenarioPatch): string[] {
  const warnings: string[] = [];
  
  if (input.age >= 40) {
    warnings.push('Atenção: pontuação por idade diminui após os 29 anos');
  }
  
  if (patch.category === 'age' && input.age >= 35) {
    warnings.push('Cada ano de idade após 35 anos reduz significativamente seus pontos');
  }
  
  if (patch.category === 'spouse' && !input.withSpouse) {
    warnings.push('Este cenário requer que você tenha cônjuge acompanhando');
  }
  
  return warnings;
}

// ===== Presets de Cenários =====

export const SCENARIO_PRESETS: ScenarioPatch[] = [
  {
    id: 'improve-english-clb9',
    label: 'Melhorar Inglês para CLB 9',
    description: 'Aumentar todas as habilidades de inglês para CLB 9 (IELTS 7.0+ em cada)',
    category: 'language',
    changes: {
      firstOfficial: { reading: 9, writing: 9, listening: 9, speaking: 9 } as LanguageCLBs,
    },
    feasibility: 'medium',
    estimatedTime: '3-6 meses',
  },
  {
    id: 'improve-english-clb10',
    label: 'Melhorar Inglês para CLB 10',
    description: 'Atingir CLB 10 em todas as habilidades (IELTS 8.0+ em cada)',
    category: 'language',
    changes: {
      firstOfficial: { reading: 10, writing: 10, listening: 10, speaking: 10 } as LanguageCLBs,
    },
    feasibility: 'hard',
    estimatedTime: '6-12 meses',
  },
  {
    id: 'add-french-clb7',
    label: 'Adicionar Francês CLB 7+',
    description: 'Aprender francês e obter CLB 7+ para ganhar pontos de segunda língua',
    category: 'language',
    changes: {
      secondOfficial: { reading: 7, writing: 7, listening: 7, speaking: 7 } as LanguageCLBs,
    },
    feasibility: 'hard',
    estimatedTime: '12-24 meses',
  },
  {
    id: 'add-masters',
    label: 'Completar Mestrado',
    description: 'Obter diploma de mestrado ou curso profissional',
    category: 'education',
    changes: {
      education: 'masters_or_professional' as EducationKey,
    },
    feasibility: 'hard',
    estimatedTime: '1-2 anos',
  },
  {
    id: 'add-canadian-exp-1',
    label: 'Ganhar 1 Ano de Experiência Canadense',
    description: 'Trabalhar 1 ano no Canadá com permissão de trabalho',
    category: 'experience',
    changes: {
      canadianExperienceYears: 1,
    },
    feasibility: 'medium',
    estimatedTime: '1 ano',
  },
  {
    id: 'add-canadian-exp-2',
    label: 'Ganhar 2+ Anos de Experiência Canadense',
    description: 'Acumular 2 ou mais anos de experiência de trabalho no Canadá',
    category: 'experience',
    changes: {
      canadianExperienceYears: 2,
    },
    feasibility: 'hard',
    estimatedTime: '2+ anos',
  },
  {
    id: 'get-pnp',
    label: 'Obter Provincial Nomination (PNP)',
    description: 'Conseguir nomeação provincial - adiciona 600 pontos!',
    category: 'additional',
    changes: {
      additional: {
        pnpNomination: true,
      },
    },
    feasibility: 'medium',
    estimatedTime: '6-12 meses',
  },
  {
    id: 'canadian-study-1-2',
    label: 'Estudar 1-2 Anos no Canadá',
    description: 'Completar programa de estudos de 1-2 anos no Canadá',
    category: 'additional',
    changes: {
      additional: {
        canadianStudy: '1_2',
      },
    },
    feasibility: 'medium',
    estimatedTime: '1-2 anos',
  },
  {
    id: 'canadian-study-3plus',
    label: 'Estudar 3+ Anos no Canadá',
    description: 'Completar programa de estudos de 3 ou mais anos no Canadá',
    category: 'additional',
    changes: {
      additional: {
        canadianStudy: '3plus',
      },
    },
    feasibility: 'hard',
    estimatedTime: '3+ anos',
  },
  {
    id: 'age-future-1y',
    label: 'Minha Pontuação Daqui a 1 Ano',
    description: 'Ver como sua idade afetará sua pontuação no futuro (sem outras mudanças)',
    category: 'age',
    changes: {
      // Age será calculado dinamicamente no wizard
    },
    feasibility: 'easy',
    estimatedTime: 'Imediato',
  },
  {
    id: 'combo-optimal',
    label: 'Combo Otimizado (Inglês + Mestrado)',
    description: 'Melhorar inglês para CLB 9 E completar mestrado',
    category: 'combo',
    changes: {
      firstOfficial: { reading: 9, writing: 9, listening: 9, speaking: 9 } as LanguageCLBs,
      education: 'masters_or_professional' as EducationKey,
    },
    feasibility: 'hard',
    estimatedTime: '1-2 anos',
  },
  {
    id: 'remove-spouse',
    label: 'Aplicar Como Single (Sem Cônjuge)',
    description: 'Comparar sua pontuação se aplicar sozinho(a) vs. com cônjuge',
    category: 'spouse',
    changes: {
      withSpouse: false,
      spouse: undefined,
    },
    feasibility: 'easy',
    estimatedTime: 'Imediato',
  },
];

// ===== Comparação de Múltiplas Simulações =====

export interface SimulationComparison {
  simulations: SimulationResult[];
  bestOption: SimulationResult;
  quickestWin: SimulationResult;
  biggestImpact: SimulationResult;
}

export function compareSimulations(results: SimulationResult[]): SimulationComparison | null {
  if (results.length === 0) return null;
  
  const positive = results.filter(r => r.difference > 0);
  
  const bestOption = positive.reduce((best, current) => 
    current.difference > best.difference ? current : best
  , positive[0] || results[0]);
  
  const quickestWin = positive
    .filter(r => r.feasibility === 'easy' || r.feasibility === 'medium')
    .reduce((best, current) => 
      current.difference > best.difference ? current : best
    , positive[0] || results[0]);
  
  const biggestImpact = positive.reduce((best, current) => 
    current.difference > best.difference ? current : best
  , positive[0] || results[0]);
  
  return {
    simulations: results,
    bestOption,
    quickestWin,
    biggestImpact,
  };
}

// ===== Helper: Criar Patch Customizado =====

export function createCustomPatch(
  id: string,
  label: string,
  description: string,
  category: SimulationCategory,
  changes: Partial<InputCRS>,
  feasibility: 'easy' | 'medium' | 'hard',
  estimatedTime: string
): ScenarioPatch {
  return {
    id,
    label,
    description,
    category,
    changes,
    feasibility,
    estimatedTime,
  };
}

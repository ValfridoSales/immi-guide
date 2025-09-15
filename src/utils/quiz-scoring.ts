import { QuizResponse, QuizResult } from '@/types/quiz';
import { 
  PROGRAM_WEIGHTS, 
  PROGRAM_THRESHOLDS, 
  AGE_SCORES, 
  EDUCATION_SCORES, 
  LANGUAGE_SCORES, 
  EXPERIENCE_SCORES, 
  CANADA_EXPERIENCE_SCORES,
  SETTLEMENT_FUNDS_MIN,
  STUDY_COST_OF_LIVING_MIN,
  CBS_CATEGORIES,
  PROVINCIAL_CONNECTION_SCORES 
} from '@/data/scoring-system';
import { immigrationPrograms } from '@/data/immigration-programs';

export function calculateQuizResults(responses: QuizResponse[]): QuizResult[] {
  // Convert responses to a map for easier lookup
  const responseMap = responses.reduce((acc, response) => {
    if (response.selectedValues.length === 1) {
      acc[response.questionId] = response.selectedValues[0];
    } else {
      acc[response.questionId] = response.selectedValues;
    }
    return acc;
  }, {} as Record<string, string | string[]>);

  // Calculate scores for each program
  const programs = ['fsw', 'cec', 'fst', 'pnp', 'quebec', 'family', 'study', 'selfemp'];
  const results: QuizResult[] = [];

  programs.forEach(programId => {
    // Check eligibility first
    const eligibilityResult = checkEligibility(programId, responseMap);
    if (!eligibilityResult.eligible) {
      // Program is not eligible, set score to 0
      const program = immigrationPrograms.find(p => p.id === programId);
      if (program) {
        results.push({
          programId,
          programName: program.name,
          compatibility: 0,
          estimatedTime: program.estimatedTime,
          investment: program.investment,
          description: `Não elegível: ${eligibilityResult.reason}`,
          strengths: [],
          improvements: eligibilityResult.improvements || [],
          nextSteps: eligibilityResult.nextSteps || [],
        });
      }
      return;
    }

    // Calculate score
    let score = 0;
    const weights = PROGRAM_WEIGHTS[programId];
    
    if (weights) {
      // Age scoring
      const age = responseMap.age as string;
      score += weights.idade * (AGE_SCORES[age] || 0) / 25;

      // Education scoring
      const education = responseMap.education as string;
      const hasEca = responseMap.has_eca as string;
      let educScore = EDUCATION_SCORES[education] || 0;
      
      // Reduce education score by half if no ECA for foreign education
      if (hasEca === 'no' && education !== 'high_school') {
        educScore *= 0.5;
      }
      score += weights.educ * educScore / 15;

      // Language scoring
      const primaryLang = responseMap.primary_language as string;
      const englishLevel = responseMap.english_level as string;
      const frenchLevel = responseMap.french_level as string;
      
      let langScore = calculateLanguageScore(programId, englishLevel, frenchLevel, primaryLang);
      
      // Secondary language bonus
      if ((primaryLang === 'english' && frenchLevel && frenchLevel.includes('clb_7')) ||
          (primaryLang === 'french' && englishLevel && englishLevel.includes('clb_7'))) {
        langScore += 3;
      }
      
      score += weights.idioma * langScore / 30;

      // Work experience scoring
      const workExp = responseMap.work_experience_teer as string;
      const continuous = responseMap.continuous_experience as string;
      let expScore = EXPERIENCE_SCORES[workExp] || 0;
      
      // For FST, higher experience scores
      if (programId === 'fst' && workExp === '6+') {
        expScore = 35;
      }
      
      // Continuous experience requirement
      if (continuous === 'no' && (programId === 'fsw' || programId === 'cec')) {
        expScore *= 0.5; // Reduce if not continuous
      }
      
      score += weights.exp_teer03 * expScore / (programId === 'fst' ? 35 : 20);

      // Canadian experience scoring
      const canExp = responseMap.canada_experience as string;
      let canExpScore = CANADA_EXPERIENCE_SCORES[canExp] || 0;
      
      // Adjust for program-specific maximums
      if (programId !== 'cec') {
        canExpScore = canExpScore === 20 ? 10 : canExpScore === 30 ? 15 : canExpScore;
      }
      
      score += weights.can_exp * canExpScore / (programId === 'cec' ? 30 : 15);

      // Provincial connection scoring
      const province = responseMap.province_preference as string;
      const provScore = PROVINCIAL_CONNECTION_SCORES[province] || 0;
      score += weights.vinc_prov * provScore / (programId === 'pnp' ? 15 : 5);

      // Category-based selection scoring
      const occupationAreas = responseMap.occupation_area as string[];
      let categoryScore = 0;
      if (Array.isArray(occupationAreas)) {
        const hasRelevantCategory = occupationAreas.some(area => CBS_CATEGORIES.includes(area));
        const hasFrenchAdvanced = frenchLevel && frenchLevel.includes('clb_7');
        
        if (hasRelevantCategory || hasFrenchAdvanced) {
          categoryScore = weights.categoria || 0;
        }
      }
      score += categoryScore;

      // Cost scoring for study program
      if (weights.custo && programId === 'study') {
        const funds = responseMap.funds as string;
        const familySize = parseInt(responseMap.family_size as string) || 1;
        const requiredFunds = STUDY_COST_OF_LIVING_MIN[familySize as keyof typeof STUDY_COST_OF_LIVING_MIN];
        
        let fundScore = 0;
        if (funds === '35k+' && requiredFunds <= 35000) fundScore = 50;
        else if (funds === '25k-35k' && requiredFunds <= 30000) fundScore = 40;
        else if (funds === '15k-25k' && requiredFunds <= 25000) fundScore = 30;
        
        score += fundScore;
      }


      // Cultural portfolio scoring for self-employed - inferred from profile
      if (weights.port_cultural && programId === 'selfemp') {
        const occupationAreas = responseMap.occupation_area as string[];
        const education = responseMap.education as string;
        // Infer cultural/artistic background from education or stated experience
        if (occupationAreas?.includes('education') || education === 'post_grad' || education === 'masters') {
          score += 40; // Inferred cultural portfolio potential
        }
      }

      // Sibling bonus for Express Entry programs
      const familyCanada = responseMap.family_canada as string;
      if ((programId === 'fsw' || programId === 'cec' || programId === 'fst') && familyCanada === 'sibling_pr') {
        score += 15;
      }

      // Category-based selection multipliers
      if (occupationAreas && Array.isArray(occupationAreas)) {
        const hasRelevantCategory = occupationAreas.some(area => CBS_CATEGORIES.includes(area));
        const hasFrenchAdvanced = frenchLevel && frenchLevel.includes('clb_7');
        
        if (hasRelevantCategory || hasFrenchAdvanced) {
          if (programId === 'fsw' || programId === 'cec' || programId === 'fst') {
            score *= 1.10; // 10% bonus for Express Entry
          } else if (programId === 'pnp') {
            score *= 1.05; // 5% bonus for PNP
          }
        }
      }

      // Clamp score to 0-100
      score = Math.max(0, Math.min(100, score));
    }

    // Create result if program exists
    const program = immigrationPrograms.find(p => p.id === programId);
    if (program) {
      results.push({
        programId,
        programName: program.name,
        compatibility: Math.round(score),
        estimatedTime: program.estimatedTime,
        investment: program.investment,
        description: program.description,
        strengths: generateStrengths(responseMap, programId),
        improvements: generateImprovements(responseMap, programId),
        nextSteps: generateNextSteps(programId),
      });
    }
  });

  // Filter results that meet threshold and sort by compatibility
  const eligibleResults = results.filter(r => r.compatibility >= PROGRAM_THRESHOLDS[r.programId as keyof typeof PROGRAM_THRESHOLDS]);
  eligibleResults.sort((a, b) => b.compatibility - a.compatibility);

  // If no programs meet threshold, recommend study path and top 2 others
  if (eligibleResults.length === 0) {
    const allResults = results.filter(r => r.compatibility > 0).sort((a, b) => b.compatibility - a.compatibility);
    const studyResult = allResults.find(r => r.programId === 'study');
    const otherResults = allResults.filter(r => r.programId !== 'study').slice(0, 2);
    
    return studyResult ? [studyResult, ...otherResults] : allResults.slice(0, 3);
  }

  return eligibleResults.slice(0, 3); // Return top 3 results
}

function checkEligibility(programId: string, responses: Record<string, string | string[]>): {
  eligible: boolean;
  reason?: string;
  improvements?: string[];
  nextSteps?: string[];
} {
  const englishLevel = responses.english_level as string;
  const frenchLevel = responses.french_level as string;
  const workExp = responses.work_experience_teer as string;
  const continuous = responses.continuous_experience as string;
  const canExp = responses.canada_experience as string;
  const funds = responses.funds as string;
  const familySize = parseInt(responses.family_size as string) || 1;
  const hasEca = responses.has_eca as string;
  const education = responses.education as string;

  switch (programId) {
    case 'fsw':
      // CLB 7 minimum in all skills
      if (!englishLevel.includes('clb_7') && !englishLevel.includes('clb_8') && !englishLevel.includes('clb_9') && !englishLevel.includes('clb_10')) {
        return {
          eligible: false,
          reason: 'CLB 7 mínimo exigido em todas as habilidades',
          improvements: ['Melhorar nível de inglês para CLB 7+']
        };
      }
      
      // 1+ year continuous experience required
      if (workExp === 'none' || workExp === 'less-1' || continuous === 'no') {
        return {
          eligible: false,
          reason: '1+ ano de experiência contínua exigida',
          improvements: ['Ganhar experiência contínua em ocupação qualificada']
        };
      }
      
      // ECA required for foreign education
      if (hasEca === 'no' && education !== 'high_school') {
        return {
          eligible: false,
          reason: 'ECA exigida para educação fora do Canadá',
          improvements: ['Fazer avaliação de credenciais (ECA)']
        };
      }
      
      // Settlement funds check (simplified)
      const requiredFunds = SETTLEMENT_FUNDS_MIN[familySize as keyof typeof SETTLEMENT_FUNDS_MIN];
      if (funds === 'less-10k' || (funds === '10k-15k' && requiredFunds > 15000)) {
        return {
          eligible: false,
          reason: 'Fundos insuficientes para settlement',
          improvements: ['Aumentar recursos financeiros disponíveis']
        };
      }
      
      return { eligible: true };

    case 'cec':
      // 12+ months Canadian experience required
      if (canExp === 'none') {
        return {
          eligible: false,
          reason: '12+ meses de experiência no Canadá exigidos',
          improvements: ['Ganhar experiência de trabalho no Canadá']
        };
      }
      
      // CLB requirements based on TEER level (simplified to CLB 5 minimum)
      if (!englishLevel.includes('clb_') || englishLevel === 'clb_4') {
        return {
          eligible: false,
          reason: 'CLB 5+ exigido para CEC',
          improvements: ['Melhorar nível de inglês']
        };
      }
      
      return { eligible: true };

    case 'fst':
      // Basic CLB requirements for trades
      if (!englishLevel.includes('clb_') || (englishLevel !== 'clb_4' && !englishLevel.includes('clb_'))) {
        return {
          eligible: false,
          reason: 'CLB 4+ exigido para FST',
          improvements: ['Melhorar nível de inglês básico']
        };
      }
      
      // Experience in trades required
      if (workExp === 'none' || workExp === 'less-1') {
        return {
          eligible: false,
          reason: '2+ anos de experiência em trades exigidos',
          improvements: ['Ganhar experiência em profissões técnicas qualificadas']
        };
      }
      
      return { eligible: true };

    case 'family':
      const familyCanada = responses.family_canada as string;
      if (familyCanada === 'none' || familyCanada === 'sibling_pr') {
        return {
          eligible: false,
          reason: 'Familiar elegível no Canadá exigido',
          improvements: ['Verificar elegibilidade de familiares para patrocínio']
        };
      }
      return { eligible: true };

    default:
      return { eligible: true };
  }
}

function calculateLanguageScore(programId: string, englishLevel: string, frenchLevel: string, primaryLang: string): number {
  if (primaryLang === 'english') {
    if (programId === 'fsw') {
      return LANGUAGE_SCORES.fsw[englishLevel as keyof typeof LANGUAGE_SCORES.fsw] || 0;
    } else if (programId === 'cec') {
      // Simplified - using general CEC scoring
      return LANGUAGE_SCORES.cec_teer01[englishLevel as keyof typeof LANGUAGE_SCORES.cec_teer01] || 0;
    } else if (programId === 'fst') {
      return LANGUAGE_SCORES.fst[englishLevel as keyof typeof LANGUAGE_SCORES.fst] || 0;
    } else {
      return LANGUAGE_SCORES.general[englishLevel as keyof typeof LANGUAGE_SCORES.general] || 0;
    }
  } else if (primaryLang === 'french') {
    // For French primary, use similar scoring but from French level
    if (programId === 'quebec') {
      return LANGUAGE_SCORES.fsw[frenchLevel as keyof typeof LANGUAGE_SCORES.fsw] || 0;
    } else {
      return LANGUAGE_SCORES.general[frenchLevel as keyof typeof LANGUAGE_SCORES.general] || 0;
    }
  }
  
  return 0;
}

function generateStrengths(responses: Record<string, string | string[]>, programId: string): string[] {
  const strengths: string[] = [];
  
  // Age-based strengths
  const age = responses.age as string;
  if (age === '18-29' || age === '30-35') {
    strengths.push('Idade ideal para imigração');
  }
  
  // Education strengths
  const education = responses.education as string;
  if (education === 'masters' || education === 'phd') {
    strengths.push('Alta qualificação educacional');
  }
  
  // Language strengths
  const englishLevel = responses.english_level as string;
  if (englishLevel.includes('clb_8') || englishLevel.includes('clb_9') || englishLevel.includes('clb_10')) {
    strengths.push('Excelente nível de inglês');
  }
  
  const frenchLevel = responses.french_level as string;
  if (frenchLevel && frenchLevel.includes('clb_7')) {
    if (programId === 'quebec') {
      strengths.push('Francês valorizado no Quebec');
    } else {
      strengths.push('Bilinguismo (inglês + francês)');
    }
  }
  
  // Experience strengths
  const workExp = responses.work_experience_teer as string;
  if (workExp === '4-5' || workExp === '6+') {
    strengths.push('Ampla experiência profissional');
  }
  
  // Canadian experience
  const canExp = responses.canada_experience as string;
  if (canExp !== 'none') {
    strengths.push('Experiência de trabalho no Canadá');
  }
  
  // Financial strengths
  const funds = responses.funds as string;
  if (funds === '35k+' || funds === '25k-35k') {
    strengths.push('Recursos financeiros adequados');
  }
  
  // Family connections
  const familyCanada = responses.family_canada as string;
  if (familyCanada !== 'none' && programId === 'family') {
    strengths.push('Conexões familiares no Canadá');
  }
  
  return strengths.slice(0, 3);
}

function generateImprovements(responses: Record<string, string | string[]>, programId: string): string[] {
  const improvements: string[] = [];
  
  // Age-based improvements
  const age = responses.age as string;
  if (age === '41-45' || age === '46+') {
    improvements.push('Considere acelerar o processo devido à idade');
  }
  
  // Language improvements
  const englishLevel = responses.english_level as string;
  if (englishLevel === 'clb_4' || englishLevel === 'clb_5' || englishLevel === 'clb_6') {
    improvements.push('Melhorar nível de inglês (IELTS/CELPIP)');
  }
  
  const frenchLevel = responses.french_level as string;
  if ((!frenchLevel || frenchLevel === 'none') && programId !== 'study') {
    improvements.push('Aprender francês para mais pontos');
  }
  
  // Education improvements
  const education = responses.education as string;
  const hasEca = responses.has_eca as string;
  if (education === 'high_school' || education === 'diploma') {
    improvements.push('Considerar educação adicional no Canadá');
  }
  
  if (hasEca === 'no' && education !== 'high_school') {
    improvements.push('Fazer avaliação de credenciais (ECA)');
  }
  
  // Experience improvements
  const workExp = responses.work_experience_teer as string;
  if (workExp === 'less-1' || workExp === '1-year' || workExp === 'none') {
    improvements.push('Ganhar mais experiência profissional qualificada');
  }
  
  const continuous = responses.continuous_experience as string;
  if (continuous === 'no') {
    improvements.push('Focar em experiência contínua na mesma ocupação');
  }
  
  // Financial improvements
  const funds = responses.funds as string;
  if (funds === 'less-10k' || funds === '10k-15k') {
    improvements.push('Aumentar recursos financeiros disponíveis');
  }
  
  return improvements.slice(0, 3);
}

function generateNextSteps(programId: string): string[] {
  const commonSteps: Record<string, string[]> = {
    fsw: [
      'Fazer avaliação educacional (WES ou similar)',
      'Fazer teste de idioma (IELTS/CELPIP)',
      'Criar perfil no sistema Express Entry',
    ],
    cec: [
      'Manter emprego atual no Canadá',
      'Fazer teste de idioma se necessário',
      'Criar perfil no Express Entry',
    ],
    fst: [
      'Verificar certificação de trade provincial',
      'Fazer teste de idioma (requisitos menores)',
      'Buscar oferta de trabalho se necessário',
    ],
    pnp: [
      'Identificar programas provinciais adequados',
      'Preparar documentos específicos da província',
      'Aplicar para indicação provincial',
    ],
    quebec: [
      'Fazer teste de francês (TEF/TCF)',
      'Submeter declaração de interesse (Arrima)',
      'Preparar documentos específicos do Quebec',
    ],
    family: [
      'Confirmar elegibilidade do patrocinador',
      'Reunir documentos de relacionamento',
      'Submeter aplicação de patrocínio',
    ],
    study: [
      'Pesquisar instituições e programas no Canadá',
      'Preparar documentos acadêmicos e financeiros',
      'Aplicar para permit de estudos',
    ],
    selfemp: [
      'Documentar experiência cultural/artística/agrícola',
      'Preparar plano de negócios para autoemprego',
      'Reunir evidências de experiência relevante',
    ],
  };
  
  return commonSteps[programId] || [
    'Consultar com especialista em imigração',
    'Organizar documentos necessários',
    'Iniciar processo de aplicação',
  ];
}
import { QuizResponse, QuizResult } from '@/types/quiz';
import { SCORING_MATRIX, PROGRAM_THRESHOLDS } from '@/data/scoring-system';
import { immigrationPrograms } from '@/data/immigration-programs';

export function calculateQuizResults(responses: QuizResponse[]): QuizResult[] {
  // Convert responses to a map for easier lookup
  const responseMap = responses.reduce((acc, response) => {
    acc[response.questionId] = response.selectedValues[0]; // Assuming single selection for now
    return acc;
  }, {} as Record<string, string>);

  // Calculate scores for each program
  const scores = {
    express: 0,
    pnp: 0,
    quebec: 0,
    family: 0,
    study: 0,
    startup: 0,
  };

  // Calculate scores based on responses
  Object.entries(responseMap).forEach(([questionId, value]) => {
    if (SCORING_MATRIX[questionId] && SCORING_MATRIX[questionId][value]) {
      const questionScores = SCORING_MATRIX[questionId][value];
      scores.express += questionScores.express;
      scores.pnp += questionScores.pnp;
      scores.quebec += questionScores.quebec;
      scores.family += questionScores.family;
      scores.study += questionScores.study;
      scores.startup += questionScores.startup;
    }
  });

  // Create results for programs that meet threshold
  const results: QuizResult[] = [];
  
  Object.entries(scores).forEach(([programId, score]) => {
    const program = immigrationPrograms.find(p => p.id === programId);
    if (program && score >= PROGRAM_THRESHOLDS[programId as keyof typeof PROGRAM_THRESHOLDS]) {
      results.push({
        programId,
        programName: program.name,
        compatibility: Math.min(Math.round((score / 100) * 100), 100), // Normalize to percentage
        estimatedTime: program.estimatedTime,
        investment: program.investment,
        description: program.description,
        strengths: generateStrengths(responseMap, programId),
        improvements: generateImprovements(responseMap, programId),
        nextSteps: generateNextSteps(programId),
      });
    }
  });

  // Sort by compatibility score (highest first)
  results.sort((a, b) => b.compatibility - a.compatibility);

  // If no programs meet threshold, recommend study path and top 2 others
  if (results.length === 0) {
    const studyProgram = immigrationPrograms.find(p => p.id === 'study')!;
    results.push({
      programId: 'study',
      programName: studyProgram.name,
      compatibility: Math.max(35, Math.round((scores.study / 100) * 100)),
      estimatedTime: studyProgram.estimatedTime,
      investment: studyProgram.investment,
      description: studyProgram.description,
      strengths: ['Flexibilidade para melhorar qualificações', 'Experiência canadense valiosa'],
      improvements: ['Investimento inicial mais alto', 'Processo mais longo'],
      nextSteps: generateNextSteps('study'),
    });

    // Add top 2 other programs even if below threshold
    const sortedPrograms = Object.entries(scores)
      .filter(([id]) => id !== 'study')
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    sortedPrograms.forEach(([programId, score]) => {
      const program = immigrationPrograms.find(p => p.id === programId)!;
      results.push({
        programId,
        programName: program.name,
        compatibility: Math.round((score / 100) * 100),
        estimatedTime: program.estimatedTime,
        investment: program.investment,
        description: program.description,
        strengths: generateStrengths(responseMap, programId),
        improvements: generateImprovements(responseMap, programId),
        nextSteps: generateNextSteps(programId),
      });
    });
  }

  return results.slice(0, 3); // Return top 3 results
}

function generateStrengths(responses: Record<string, string>, programId: string): string[] {
  const strengths: string[] = [];

  // Age-based strengths
  if (responses.age === '18-29' || responses.age === '30-35') {
    strengths.push('Idade ideal para imigração');
  }

  // Education strengths
  if (responses.education === 'masters' || responses.education === 'phd') {
    strengths.push('Alta qualificação educacional');
  }

  // Language strengths
  if (responses.english === 'advanced' || responses.english === 'upper_intermediate') {
    strengths.push('Excelente nível de inglês');
  }

  if (responses.french === 'advanced' || responses.french === 'intermediate') {
    if (programId === 'quebec') {
      strengths.push('Francês valorizado no Quebec');
    } else {
      strengths.push('Bilinguismo (inglês + francês)');
    }
  }

  // Experience strengths
  if (responses.experience === '4-5' || responses.experience === '6+') {
    strengths.push('Ampla experiência profissional');
  }

  // Financial strengths
  if (responses.funds === '30k+' || responses.funds === '20k-30k') {
    strengths.push('Recursos financeiros adequados');
  }

  // Family connections
  if (responses.family !== 'none' && programId === 'family') {
    strengths.push('Conexões familiares no Canadá');
  }

  return strengths.slice(0, 3); // Limit to 3 strengths
}

function generateImprovements(responses: Record<string, string>, programId: string): string[] {
  const improvements: string[] = [];

  // Age-based improvements
  if (responses.age === '41-45' || responses.age === '46+') {
    improvements.push('Considere acelerar o processo devido à idade');
  }

  // Language improvements
  if (responses.english === 'basic' || responses.english === 'intermediate') {
    improvements.push('Melhorar nível de inglês (IELTS/CELPIP)');
  }

  if (responses.french === 'none' && programId !== 'study') {
    improvements.push('Aprender francês para mais pontos');
  }

  // Education improvements
  if (responses.education === 'high_school' || responses.education === 'diploma') {
    improvements.push('Considerar educação adicional no Canadá');
  }

  // Experience improvements
  if (responses.experience === 'less-1' || responses.experience === '1-year') {
    improvements.push('Ganhar mais experiência profissional');
  }

  // Financial improvements
  if (responses.funds === 'less-12k') {
    improvements.push('Aumentar recursos financeiros disponíveis');
  }

  return improvements.slice(0, 3); // Limit to 3 improvements
}

function generateNextSteps(programId: string): string[] {
  const commonSteps: Record<string, string[]> = {
    express: [
      'Fazer avaliação educacional (WES ou similar)',
      'Fazer teste de idioma (IELTS/CELPIP)',
      'Criar perfil no sistema Express Entry',
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
      'Preparar documentos acadêmicos',
      'Aplicar para permit de estudos',
    ],
    startup: [
      'Desenvolver plano de negócios detalhado',
      'Buscar investidores ou incubadoras',
      'Preparar documentos empresariais',
    ],
  };

  return commonSteps[programId] || [
    'Consultar com especialista em imigração',
    'Organizar documentos necessários',
    'Iniciar processo de aplicação',
  ];
}
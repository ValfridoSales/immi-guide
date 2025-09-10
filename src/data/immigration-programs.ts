import { ImmigrationProgram } from '@/types/quiz';

export const immigrationPrograms: ImmigrationProgram[] = [
  {
    id: 'express',
    name: 'Express Entry',
    description: 'Sistema federal para trabalhadores qualificados com processo rápido e pontuação baseada em fatores como idade, educação, experiência profissional e idiomas.',
    estimatedTime: '6-8 meses',
    investment: 'CAD 4,500 - 6,500',
    threshold: 65,
  },
  {
    id: 'pnp',
    name: 'Provincial Nominee Program (PNP)',
    description: 'Programa provincial que permite às províncias indicar candidatos que atendem às necessidades específicas do mercado de trabalho local.',
    estimatedTime: '12-18 meses',
    investment: 'CAD 5,000 - 8,000',
    threshold: 45,
  },
  {
    id: 'quebec',
    name: 'Quebec Skilled Worker',
    description: 'Programa específico do Quebec para trabalhadores qualificados, com critérios próprios e valorização do francês.',
    estimatedTime: '18-24 meses',
    investment: 'CAD 6,000 - 9,000',
    threshold: 50,
  },
  {
    id: 'family',
    name: 'Family Sponsorship',
    description: 'Para quem tem cônjuge, pais ou outros familiares elegíveis no Canadá que podem patrocinar a imigração.',
    estimatedTime: '8-12 meses',
    investment: 'CAD 2,500 - 4,000',
    threshold: 30,
  },
  {
    id: 'study',
    name: 'Study Permit → PR',
    description: 'Caminho através de estudos no Canadá, ideal para melhorar qualificações e obter experiência canadense.',
    estimatedTime: '2-4 anos',
    investment: 'CAD 25,000 - 50,000',
    threshold: 40,
  },
  {
    id: 'startup',
    name: 'Startup Visa / Self-Employed',
    description: 'Para empreendedores com ideias inovadoras ou experiência comprovada em negócios próprios.',
    estimatedTime: '12-16 meses',
    investment: 'CAD 15,000 - 200,000',
    threshold: 55,
  },
];
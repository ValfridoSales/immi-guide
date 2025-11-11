import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { computeCrs, type InputCRS, type EducationKey, type CRSResult } from '@/utils/crs-engine';
import { mapIELTSGeneralToCLBs, mapCELPIPToCLBs, mapTEFCanadaToCLBs, mapTCFCanadaToCLBs } from '@/utils/language-maps';
import { Calculator, Loader2 } from 'lucide-react';

const formSchema = z.object({
  maritalStatus: z.string().min(1, 'Selecione seu estado civil'),
  spouseAccompanying: z.string().optional(),
  spouseIsPR: z.string().optional(),
  age: z.string().min(1, 'Selecione sua idade'),
  education: z.string().min(1, 'Selecione seu nível de educação'),
  firstLanguageTest: z.string().min(1, 'Selecione o teste de idioma'),
  firstLangReading: z.string().min(1, 'Insira a pontuação de Reading'),
  firstLangWriting: z.string().min(1, 'Insira a pontuação de Writing'),
  firstLangListening: z.string().min(1, 'Insira a pontuação de Listening'),
  firstLangSpeaking: z.string().min(1, 'Insira a pontuação de Speaking'),
  hasSecondLanguage: z.boolean().default(false),
  secondLanguageTest: z.string().optional(),
  secondLangReading: z.string().optional(),
  secondLangWriting: z.string().optional(),
  secondLangListening: z.string().optional(),
  secondLangSpeaking: z.string().optional(),
  canadianExperience: z.string().min(1, 'Selecione sua experiência canadense'),
  foreignExperience: z.string().min(1, 'Selecione sua experiência internacional'),
  hasTradeCertificate: z.string().min(1, 'Selecione se tem certificado'),
  spouseEducation: z.string().optional(),
  spouseLangReading: z.string().optional(),
  spouseLangWriting: z.string().optional(),
  spouseLangListening: z.string().optional(),
  spouseLangSpeaking: z.string().optional(),
  spouseCanadianExp: z.string().optional(),
  hasSiblingInCanada: z.string().min(1, 'Selecione se tem irmão no Canadá'),
  canadianStudy: z.string().min(1, 'Selecione se estudou no Canadá'),
  canadianStudyDuration: z.string().optional(),
  hasPNP: z.string().min(1, 'Selecione se tem nomeação provincial'),
});

type FormValues = z.infer<typeof formSchema>;

interface CRSFormProps {
  onCalculate: (result: CRSResult, input: InputCRS) => void;
}

export function CRSForm({ onCalculate }: CRSFormProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasSecondLanguage: false,
      maritalStatus: '',
      age: '',
      education: '',
      firstLanguageTest: '',
      canadianExperience: 'A',
      foreignExperience: 'A',
      hasTradeCertificate: 'A',
      hasSiblingInCanada: 'A',
      canadianStudy: 'A',
      hasPNP: 'A',
    },
  });

  const maritalStatus = form.watch('maritalStatus');
  const hasSecondLanguage = form.watch('hasSecondLanguage');
  const canadianStudy = form.watch('canadianStudy');
  const firstLanguageTest = form.watch('firstLanguageTest');
  const secondLanguageTest = form.watch('secondLanguageTest');

  const withSpouse = (maritalStatus === 'B' || maritalStatus === 'E') && 
                     form.watch('spouseAccompanying') === 'B' && 
                     form.watch('spouseIsPR') === 'A';

  // Helper function to generate score options based on test type
  const getScoreOptions = (testType: string, skill: 'reading' | 'writing' | 'listening' | 'speaking') => {
    if (testType === 'B') { // IELTS
      return ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'].map(v => (
        <SelectItem key={v} value={v}>{v}</SelectItem>
      ));
    } else if (testType === 'A') { // CELPIP
      return Array.from({length: 9}, (_, i) => i + 4).map(v => (
        <SelectItem key={v} value={String(v)}>{v}</SelectItem>
      ));
    } else if (testType === 'C') { // TEF Canada
      const maxScores = { reading: 300, writing: 450, listening: 360, speaking: 450 };
      const step = skill === 'reading' ? 10 : 15;
      return Array.from({length: Math.floor(maxScores[skill] / step) + 1}, (_, i) => i * step).map(v => (
        <SelectItem key={v} value={String(v)}>{v}</SelectItem>
      ));
    } else if (testType === 'D') { // TCF Canada
      const maxScores = { reading: 699, writing: 20, listening: 699, speaking: 20 };
      const step = (skill === 'writing' || skill === 'speaking') ? 1 : 20;
      return Array.from({length: Math.floor(maxScores[skill] / step) + 1}, (_, i) => i * step).map(v => (
        <SelectItem key={v} value={String(v)}>{v}</SelectItem>
      ));
    }
    return [];
  };

  const onSubmit = async (values: FormValues) => {
    setIsCalculating(true);
    
    try {
      // Pequeno delay para dar feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));
      // Map education
      const eduMap: Record<string, EducationKey> = {
        A: 'less_than_secondary', B: 'secondary', C: 'one_year', D: 'two_year',
        E: 'bachelor_or_3plus', F: 'two_or_more_with_one_3plus',
        G: 'masters_or_professional', H: 'phd',
      };
      const education = eduMap[values.education] || 'secondary';

      // Map age
      const ageMap: Record<string, number> = {
        A:17, B:18, C:19, D:20, E:21, F:22, G:23, H:24, I:25, J:26, K:27, L:28, M:29,
        N:30, O:31, P:32, Q:33, R:34, S:35, T:36, U:37, V:38, W:39, X:40, Y:41, Z:42, AA:43, AB:44, AC:45
      };
      const age = ageMap[values.age] || 25;

      // Map first language
      let firstOfficial;
      if (values.firstLanguageTest === 'B') { // IELTS
        firstOfficial = mapIELTSGeneralToCLBs({
          reading: parseFloat(values.firstLangReading),
          writing: parseFloat(values.firstLangWriting),
          listening: parseFloat(values.firstLangListening),
          speaking: parseFloat(values.firstLangSpeaking),
        });
      } else if (values.firstLanguageTest === 'A') { // CELPIP
        firstOfficial = mapCELPIPToCLBs({
          reading: parseInt(values.firstLangReading),
          writing: parseInt(values.firstLangWriting),
          listening: parseInt(values.firstLangListening),
          speaking: parseInt(values.firstLangSpeaking),
        });
      } else if (values.firstLanguageTest === 'C') { // TEF Canada
        firstOfficial = mapTEFCanadaToCLBs({
          reading: parseFloat(values.firstLangReading),
          writing: parseFloat(values.firstLangWriting),
          listening: parseFloat(values.firstLangListening),
          speaking: parseFloat(values.firstLangSpeaking),
        });
      } else if (values.firstLanguageTest === 'D') { // TCF Canada
        firstOfficial = mapTCFCanadaToCLBs({
          reading: parseFloat(values.firstLangReading),
          writing: parseFloat(values.firstLangWriting),
          listening: parseFloat(values.firstLangListening),
          speaking: parseFloat(values.firstLangSpeaking),
        });
      } else {
        throw new Error('Tipo de teste não suportado. Por favor, selecione um teste válido.');
      }

      // Map second language (if applicable)
      let secondOfficial;
      if (values.hasSecondLanguage && values.secondLangReading && values.secondLanguageTest) {
        if (values.secondLanguageTest === 'B') { // IELTS
          secondOfficial = mapIELTSGeneralToCLBs({
            reading: parseFloat(values.secondLangReading),
            writing: parseFloat(values.secondLangWriting || '0'),
            listening: parseFloat(values.secondLangListening || '0'),
            speaking: parseFloat(values.secondLangSpeaking || '0'),
          });
        } else if (values.secondLanguageTest === 'A') { // CELPIP
          secondOfficial = mapCELPIPToCLBs({
            reading: parseInt(values.secondLangReading),
            writing: parseInt(values.secondLangWriting || '0'),
            listening: parseInt(values.secondLangListening || '0'),
            speaking: parseInt(values.secondLangSpeaking || '0'),
          });
        } else if (values.secondLanguageTest === 'C') { // TEF Canada
          secondOfficial = mapTEFCanadaToCLBs({
            reading: parseFloat(values.secondLangReading),
            writing: parseFloat(values.secondLangWriting || '0'),
            listening: parseFloat(values.secondLangListening || '0'),
            speaking: parseFloat(values.secondLangSpeaking || '0'),
          });
        } else if (values.secondLanguageTest === 'D') { // TCF Canada
          secondOfficial = mapTCFCanadaToCLBs({
            reading: parseFloat(values.secondLangReading),
            writing: parseFloat(values.secondLangWriting || '0'),
            listening: parseFloat(values.secondLangListening || '0'),
            speaking: parseFloat(values.secondLangSpeaking || '0'),
          });
        }
      }

      // Map experience
      const cdnExpMap: Record<string, 0|1|2|3|4|5> = { A:0, B:1, C:2, D:3, E:4, F:5 };
      const forExpMap: Record<string, 0|1|2|3|4|5|6> = { A:0, B:1, C:2, D:3 };
      const canadianExperienceYears = cdnExpMap[values.canadianExperience] || 0;
      const foreignExperienceYears = forExpMap[values.foreignExperience] || 0;

      const hasTradeCertificate = values.hasTradeCertificate === 'B';

      // Additional factors
      const additional = {
        siblingInCanada: values.hasSiblingInCanada === 'B',
        pnpNomination: values.hasPNP === 'B',
        canadianStudy: (values.canadianStudy === 'B' && values.canadianStudyDuration === 'B' ? '1_2' :
                       values.canadianStudy === 'B' && values.canadianStudyDuration === 'C' ? '3plus' : 'none') as 'none'|'1_2'|'3plus',
        frenchCLBs: secondOfficial,
        englishCLBs: firstOfficial,
      };

      // Spouse factors
      let spouse;
      if (withSpouse && values.spouseEducation) {
        spouse = {
          education: eduMap[values.spouseEducation] as EducationKey,
          language: values.spouseLangReading ? mapIELTSGeneralToCLBs({
            reading: parseFloat(values.spouseLangReading),
            writing: parseFloat(values.spouseLangWriting || '0'),
            listening: parseFloat(values.spouseLangListening || '0'),
            speaking: parseFloat(values.spouseLangSpeaking || '0'),
          }) : undefined,
          canadianExperienceYears: cdnExpMap[values.spouseCanadianExp || 'A'] || 0,
        };
      }

      const input: InputCRS = {
        withSpouse,
        age,
        education,
        firstOfficial,
        secondOfficial,
        canadianExperienceYears,
        foreignExperienceYears,
        hasTradeCertificate,
        spouse,
        additional,
      };

      const result = computeCrs(input);
      onCalculate(result, input);
    } catch (error: any) {
      console.error('Erro ao calcular CRS:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={['personal', 'education', 'language']} className="w-full">
          {/* Personal Information */}
          <AccordionItem value="personal">
            <AccordionTrigger>1. Informações Pessoais</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Civil *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu estado civil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Solteiro(a)</SelectItem>
                        <SelectItem value="B">Casado(a)</SelectItem>
                        <SelectItem value="C">Divorciado(a)</SelectItem>
                        <SelectItem value="D">Viúvo(a)</SelectItem>
                        <SelectItem value="E">Common-law</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(maritalStatus === 'B' || maritalStatus === 'E') && (
                <>
                  <FormField
                    control={form.control}
                    name="spouseAccompanying"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu cônjuge/parceiro(a) virá com você para o Canadá? *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">Não</SelectItem>
                            <SelectItem value="B">Sim</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('spouseAccompanying') === 'B' && (
                    <FormField
                      control={form.control}
                      name="spouseIsPR"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seu cônjuge é cidadão canadense ou residente permanente? *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A">Não</SelectItem>
                              <SelectItem value="B">Sim</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua idade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">17 ou menos</SelectItem>
                        <SelectItem value="B">18</SelectItem>
                        <SelectItem value="C">19</SelectItem>
                        <SelectItem value="D">20</SelectItem>
                        <SelectItem value="E">21</SelectItem>
                        <SelectItem value="F">22</SelectItem>
                        <SelectItem value="G">23</SelectItem>
                        <SelectItem value="H">24</SelectItem>
                        <SelectItem value="I">25</SelectItem>
                        <SelectItem value="J">26</SelectItem>
                        <SelectItem value="K">27</SelectItem>
                        <SelectItem value="L">28</SelectItem>
                        <SelectItem value="M">29</SelectItem>
                        <SelectItem value="N">30</SelectItem>
                        <SelectItem value="O">31</SelectItem>
                        <SelectItem value="P">32</SelectItem>
                        <SelectItem value="Q">33</SelectItem>
                        <SelectItem value="R">34</SelectItem>
                        <SelectItem value="S">35</SelectItem>
                        <SelectItem value="T">36</SelectItem>
                        <SelectItem value="U">37</SelectItem>
                        <SelectItem value="V">38</SelectItem>
                        <SelectItem value="W">39</SelectItem>
                        <SelectItem value="X">40</SelectItem>
                        <SelectItem value="Y">41</SelectItem>
                        <SelectItem value="Z">42</SelectItem>
                        <SelectItem value="AA">43</SelectItem>
                        <SelectItem value="AB">44</SelectItem>
                        <SelectItem value="AC">45 ou mais</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Education */}
          <AccordionItem value="education">
            <AccordionTrigger>2. Educação</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Educação *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Menos que ensino médio</SelectItem>
                        <SelectItem value="B">Ensino médio</SelectItem>
                        <SelectItem value="C">Pós-secundário de 1 ano</SelectItem>
                        <SelectItem value="D">Pós-secundário de 2 anos</SelectItem>
                        <SelectItem value="E">Bacharelado (3+ anos)</SelectItem>
                        <SelectItem value="F">Dois ou mais diplomas (um de 3+ anos)</SelectItem>
                        <SelectItem value="G">Mestrado ou curso profissional</SelectItem>
                        <SelectItem value="H">Doutorado (PhD)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canadianStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Você estudou no Canadá? *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Não</SelectItem>
                        <SelectItem value="B">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {canadianStudy === 'B' && (
                <FormField
                  control={form.control}
                  name="canadianStudyDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração do estudo no Canadá *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="B">1-2 anos</SelectItem>
                          <SelectItem value="C">3 ou mais anos</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Language */}
          <AccordionItem value="language">
            <AccordionTrigger>3. Idioma (Primeiro Idioma Oficial)</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="firstLanguageTest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Teste *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o teste" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">CELPIP-G</SelectItem>
                        <SelectItem value="B">IELTS General</SelectItem>
                        <SelectItem value="C">TEF Canada</SelectItem>
                        <SelectItem value="D">TCF Canada</SelectItem>
                        <SelectItem value="E">PTE Core (em breve)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {firstLanguageTest === 'B' && 'IELTS: pontuações de 0.0 a 9.0 (incrementos de 0.5)'}
                      {firstLanguageTest === 'A' && 'CELPIP: níveis de 4 a 12'}
                      {firstLanguageTest === 'C' && 'TEF Canada: Reading (0-300), Writing (0-450), Listening (0-360), Speaking (0-450)'}
                      {firstLanguageTest === 'D' && 'TCF Canada: Reading (0-699), Writing (0-20), Listening (0-699), Speaking (0-20)'}
                      {firstLanguageTest === 'E' && 'PTE Core ainda não está implementado. Use outro teste por enquanto.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstLangReading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reading *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pontuação" />
                          </SelectTrigger>
                          <SelectContent>
                            {getScoreOptions(firstLanguageTest, 'reading')}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstLangWriting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Writing *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pontuação" />
                          </SelectTrigger>
                          <SelectContent>
                            {getScoreOptions(firstLanguageTest, 'writing')}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstLangListening"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listening *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pontuação" />
                          </SelectTrigger>
                          <SelectContent>
                            {getScoreOptions(firstLanguageTest, 'listening')}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstLangSpeaking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speaking *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pontuação" />
                          </SelectTrigger>
                          <SelectContent>
                            {getScoreOptions(firstLanguageTest, 'speaking')}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hasSecondLanguage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Tenho um segundo idioma oficial
                      </FormLabel>
                      <FormDescription>
                        Marque se você também fez teste de inglês/francês
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {hasSecondLanguage && (
                <>
                  <FormField
                    control={form.control}
                    name="secondLanguageTest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Teste (Segundo Idioma) *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o teste" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">CELPIP-G</SelectItem>
                            <SelectItem value="B">IELTS General</SelectItem>
                            <SelectItem value="C">TEF Canada</SelectItem>
                            <SelectItem value="D">TCF Canada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {secondLanguageTest === 'B' && 'IELTS: pontuações de 0.0 a 9.0 (incrementos de 0.5)'}
                          {secondLanguageTest === 'A' && 'CELPIP: níveis de 4 a 12'}
                          {secondLanguageTest === 'C' && 'TEF Canada: Reading (0-300), Writing (0-450), Listening (0-360), Speaking (0-450)'}
                          {secondLanguageTest === 'D' && 'TCF Canada: Reading (0-699), Writing (0-20), Listening (0-699), Speaking (0-20)'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="secondLangReading"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reading</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pontuação" />
                              </SelectTrigger>
                              <SelectContent>
                                {secondLanguageTest && getScoreOptions(secondLanguageTest, 'reading')}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondLangWriting"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Writing</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pontuação" />
                              </SelectTrigger>
                              <SelectContent>
                                {secondLanguageTest && getScoreOptions(secondLanguageTest, 'writing')}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondLangListening"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listening</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pontuação" />
                              </SelectTrigger>
                              <SelectContent>
                                {secondLanguageTest && getScoreOptions(secondLanguageTest, 'listening')}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondLangSpeaking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Speaking</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pontuação" />
                              </SelectTrigger>
                              <SelectContent>
                                {secondLanguageTest && getScoreOptions(secondLanguageTest, 'speaking')}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Work Experience */}
          <AccordionItem value="experience">
            <AccordionTrigger>4. Experiência de Trabalho</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="canadianExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experiência de trabalho no Canadá *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Nenhuma ou menos de 1 ano</SelectItem>
                        <SelectItem value="B">1 ano</SelectItem>
                        <SelectItem value="C">2 anos</SelectItem>
                        <SelectItem value="D">3 anos</SelectItem>
                        <SelectItem value="E">4 anos</SelectItem>
                        <SelectItem value="F">5 ou mais anos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="foreignExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experiência de trabalho internacional *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Nenhuma ou menos de 1 ano</SelectItem>
                        <SelectItem value="B">1 ano</SelectItem>
                        <SelectItem value="C">2 anos</SelectItem>
                        <SelectItem value="D">3 ou mais anos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasTradeCertificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Possui certificado de profissão (trade certificate)? *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Não</SelectItem>
                        <SelectItem value="B">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Additional Factors */}
          <AccordionItem value="additional">
            <AccordionTrigger>5. Fatores Adicionais</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="hasSiblingInCanada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tem irmão(ã) no Canadá (PR ou cidadão)? *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Não</SelectItem>
                        <SelectItem value="B">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasPNP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Possui nomeação provincial (PNP)? *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Não</SelectItem>
                        <SelectItem value="B">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      PNP adiciona +600 pontos ao seu CRS
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit" className="w-full" size="lg" disabled={isCalculating}>
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-5 w-5" />
              Calcular Pontuação CRS
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

import { supabase } from '@/integrations/supabase/client';
import { QuizResult } from '@/types/quiz';

export interface StoredQuizResult {
  id: string;
  user_id: string;
  session_id: string;
  results: QuizResult[];
  created_at: string;
  updated_at: string;
}

export async function storeQuizResults(
  userId: string,
  results: QuizResult[]
): Promise<string> {
  const { data, error } = await supabase
    .from('quiz_results')
    .insert({
      user_id: userId,
      session_id: crypto.randomUUID(),
      results: results as any,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Erro ao salvar resultados: ${error.message}`);
  }

  return data.id;
}

export async function getUserQuizResults(userId: string): Promise<StoredQuizResult[]> {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar resultados: ${error.message}`);
  }

  return data.map(row => ({
    ...row,
    results: row.results as unknown as QuizResult[]
  }));
}

export async function deleteQuizResult(resultId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_results')
    .delete()
    .eq('id', resultId);

  if (error) {
    throw new Error(`Erro ao deletar resultado: ${error.message}`);
  }
}

export async function getQuizResults(resultId: string): Promise<StoredQuizResult | null> {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('id', resultId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch quiz results: ${error.message}`);
  }

  return {
    ...data,
    results: data.results as unknown as QuizResult[] // Cast through unknown first
  };
}

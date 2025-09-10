import { supabase } from '@/integrations/supabase/client';
import { QuizResult, Lead } from '@/types/quiz';

export interface StoredQuizResult {
  id: string;
  session_id: string;
  user_email?: string;
  user_name?: string;
  user_whatsapp?: string;
  user_location?: string;
  user_timeline?: string;
  results: QuizResult[];
  created_at: string;
  updated_at: string;
}

export async function storeQuizResults(
  sessionId: string,
  results: QuizResult[],
  leadData?: Lead
): Promise<string> {
  const { data, error } = await supabase
    .from('quiz_results')
    .insert({
      session_id: sessionId,
      results: results as any, // Cast to any to handle Json type
      user_email: leadData?.email,
      user_name: leadData?.name,
      user_whatsapp: leadData?.whatsapp,
      user_location: leadData?.location,
      user_timeline: leadData?.immigrationTimeline,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to store quiz results: ${error.message}`);
  }

  return data.id;
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

export async function updateQuizResultsWithLead(
  resultId: string,
  leadData: Lead
): Promise<void> {
  const { error } = await supabase
    .from('quiz_results')
    .update({
      user_email: leadData.email,
      user_name: leadData.name,
      user_whatsapp: leadData.whatsapp,
      user_location: leadData.location,
      user_timeline: leadData.immigrationTimeline,
    })
    .eq('id', resultId);

  if (error) {
    throw new Error(`Failed to update quiz results: ${error.message}`);
  }
}
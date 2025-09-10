import { supabase } from '@/integrations/supabase/client';

export async function sendWelcomeEmail(email: string, resultId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('send-welcome-email', {
    body: { email, resultId }
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
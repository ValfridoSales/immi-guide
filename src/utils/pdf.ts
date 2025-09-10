import { supabase } from '@/integrations/supabase/client';

export async function generatePDF(resultId: string): Promise<Blob> {
  const { data, error } = await supabase.functions.invoke('generate-pdf', {
    body: { resultId }
  });

  if (error) {
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }

  return data;
}

export async function sendWelcomeEmail(email: string, resultId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('send-welcome-email', {
    body: { email, resultId }
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export function downloadPDF(pdfBlob: Blob, filename: string) {
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
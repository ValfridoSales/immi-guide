import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SyncData() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setLoading(true);
    setResult(null);

    try {
      // First, delete all potentially bad data (IDs >= 290)
      const { error: deleteError } = await supabase
        .from('express_entry_draws')
        .delete()
        .gte('id', 290);

      if (deleteError) {
        throw deleteError;
      }

      // Then trigger sync
      const { data, error } = await supabase.functions.invoke('sync-express-entry', {
        body: {},
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: 'Sincronização concluída',
        description: `${data.inserted} draws importados com sucesso`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro na sincronização',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Sincronizar Dados Express Entry</h1>
        <p className="mb-4">
          Esta página permite sincronizar os dados do Express Entry diretamente do site do governo canadense.
        </p>

        <Button onClick={handleSync} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Executar Sincronização
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h2 className="font-semibold mb-2">Resultado:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}

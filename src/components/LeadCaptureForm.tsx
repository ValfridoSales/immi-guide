import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lead } from '@/types/quiz';

interface LeadCaptureFormProps {
  onSubmit: (lead: Lead) => void;
  results: any[];
}

export function LeadCaptureForm({ onSubmit, results }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    location: '',
    immigrationTimeline: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.immigrationTimeline) {
      onSubmit({
        ...formData,
        quizResults: results,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="p-8 shadow-elevated">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="text-4xl">📧</div>
            <h2 className="text-2xl font-bold text-foreground">
              Receba Sua Análise Completa
            </h2>
            <p className="text-muted-foreground">
              Preencha os dados abaixo e receba em seu email um relatório detalhado com todos os próximos passos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+55 (11) 99999-9999"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Cidade/Estado (opcional)</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="São Paulo, SP"
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Quando pretende imigrar? *</Label>
              <Select 
                value={formData.immigrationTimeline} 
                onValueChange={(value) => setFormData({ ...formData, immigrationTimeline: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione um prazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6-months">Nos próximos 6 meses</SelectItem>
                  <SelectItem value="1-year">Em 1 ano</SelectItem>
                  <SelectItem value="1-2-years">Entre 1-2 anos</SelectItem>
                  <SelectItem value="2-years">Mais de 2 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              variant="canadian" 
              size="lg" 
              className="w-full text-lg py-3"
              disabled={!formData.name || !formData.email || !formData.immigrationTimeline}
            >
              Enviar Análise Completa
            </Button>
          </form>

          {/* Trust Signals */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              ✅ 100% gratuito • ✅ Sem spam • ✅ Baseado em dados oficiais
            </p>
            <p className="text-xs text-muted-foreground">
              Seus dados estão seguros e nunca serão compartilhados
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
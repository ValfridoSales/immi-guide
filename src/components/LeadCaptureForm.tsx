import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lead } from '@/types/quiz';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const leadSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  whatsapp: z.string()
    .trim()
    .regex(/^(\+?[1-9]\d{0,3}[\s.-]?)?\(?\d{1,4}\)?[\s.-]?\d{1,5}[\s.-]?\d{1,5}$/, 'Formato de WhatsApp inválido')
    .optional()
    .or(z.literal('')),
  location: z.string()
    .trim()
    .max(200, 'Localização muito longa')
    .optional()
    .or(z.literal('')),
  immigrationTimeline: z.enum(['6-months', '1-year', '1-2-years', '2-years'], {
    errorMap: () => ({ message: 'Selecione um prazo' })
  })
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureFormProps {
  onSubmit: (lead: Lead) => void;
  results: any[];
}

export function LeadCaptureForm({ onSubmit, results }: LeadCaptureFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    mode: 'onBlur'
  });

  const immigrationTimeline = watch('immigrationTimeline');

  const onFormSubmit = (data: LeadFormData) => {
    onSubmit({
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp || undefined,
      location: data.location || undefined,
      immigrationTimeline: data.immigrationTimeline,
      quizResults: results,
    });
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
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="Seu nome completo"
                  className="h-12"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  className="h-12"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  {...register('whatsapp')}
                  placeholder="+55 (11) 99999-9999"
                  className="h-12"
                />
                {errors.whatsapp && (
                  <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Cidade/Estado (opcional)</Label>
                <Input
                  id="location"
                  type="text"
                  {...register('location')}
                  placeholder="São Paulo, SP"
                  className="h-12"
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Quando pretende imigrar? *</Label>
              <Select 
                value={immigrationTimeline} 
                onValueChange={(value) => setValue('immigrationTimeline', value as any)}
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
              {errors.immigrationTimeline && (
                <p className="text-sm text-destructive">{errors.immigrationTimeline.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              variant="canadian" 
              size="lg" 
              className="w-full text-lg py-3"
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
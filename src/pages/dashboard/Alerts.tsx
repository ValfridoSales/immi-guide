import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProFeatureGuard } from '@/components/dashboard/ProFeatureGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, BellOff, TrendingDown, Calendar, Target, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function Alerts() {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alerts, setAlerts] = useState({
    newDraws: true,
    crsDrops: true,
    targetScore: false,
    weeklyDigest: false,
  });
  const [targetCRS, setTargetCRS] = useState<string>('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (user && profile) {
      loadPreferences();
      setEmail(profile.email || '');
      setWhatsapp(profile.whatsapp || '');
    }
  }, [user, profile]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_alert_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setAlerts({
          newDraws: data.new_draws_enabled,
          crsDrops: data.crs_drops_enabled,
          targetScore: data.target_score_enabled,
          weeklyDigest: data.weekly_digest_enabled,
        });
        setTargetCRS(data.target_crs_score?.toString() || '');
        setEmail(data.notification_email || profile?.email || '');
        setWhatsapp(data.notification_whatsapp || profile?.whatsapp || '');
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof typeof alerts) => {
    const newValue = !alerts[key];
    setAlerts(prev => ({ ...prev, [key]: newValue }));
    
    await savePreferences({
      ...alerts,
      [key]: newValue,
    });
  };

  const savePreferences = async (alertsToSave = alerts) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_alert_preferences')
        .upsert({
          user_id: user.id,
          new_draws_enabled: alertsToSave.newDraws,
          crs_drops_enabled: alertsToSave.crsDrops,
          target_score_enabled: alertsToSave.targetScore,
          weekly_digest_enabled: alertsToSave.weeklyDigest,
          target_crs_score: targetCRS ? parseInt(targetCRS) : null,
          notification_email: email,
          notification_whatsapp: whatsapp,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await savePreferences();
      toast({
        title: 'Preferências salvas!',
        description: 'Suas configurações de alerta foram atualizadas.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as preferências.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <ProFeatureGuard feature="alerts">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Alertas e Notificações</h1>
            <p className="text-muted-foreground mt-1">
              Configure alertas automáticos para ficar por dentro das últimas novidades
            </p>
          </div>

          {/* Alert Types */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Alertas</CardTitle>
              <CardDescription>
                Escolha quais notificações você deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <Label htmlFor="new-draws" className="text-base font-medium">
                      Novos Draws
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receba notificação imediata quando um novo draw for anunciado pelo IRCC
                    </p>
                  </div>
                </div>
                <Switch
                  id="new-draws"
                  checked={alerts.newDraws}
                  onCheckedChange={() => handleToggle('newDraws')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <TrendingDown className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <Label htmlFor="crs-drops" className="text-base font-medium">
                      Quedas de CRS
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Seja alertado quando o CRS mínimo cair abaixo da média recente
                    </p>
                  </div>
                </div>
                <Switch
                  id="crs-drops"
                  checked={alerts.crsDrops}
                  onCheckedChange={() => handleToggle('crsDrops')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Target className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <Label htmlFor="target-score" className="text-base font-medium">
                      Pontuação Meta
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Alerta quando um draw tiver CRS igual ou inferior à sua pontuação alvo
                    </p>
                  </div>
                </div>
                <Switch
                  id="target-score"
                  checked={alerts.targetScore}
                  onCheckedChange={() => handleToggle('targetScore')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <Label htmlFor="weekly-digest" className="text-base font-medium">
                      Resumo Semanal
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receba um email semanal com resumo dos draws e tendências
                    </p>
                  </div>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={alerts.weeklyDigest}
                  onCheckedChange={() => handleToggle('weeklyDigest')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Target CRS Configuration */}
          {alerts.targetScore && (
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Configure sua Pontuação Meta
                </CardTitle>
                <CardDescription>
                  Defina a pontuação CRS que você deseja acompanhar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-crs">Pontuação CRS Alvo</Label>
                    <Input
                      id="target-crs"
                      type="number"
                      placeholder="Ex: 470"
                      value={targetCRS}
                      onChange={(e) => setTargetCRS(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Você será notificado quando um draw tiver CRS igual ou inferior a este valor
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Canais de Notificação</CardTitle>
              <CardDescription>
                Escolha como você deseja receber as notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Email principal para receber notificações
                </p>
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+55 11 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Receba alertas importantes via WhatsApp (apenas usuários Pro)
                </p>
              </div>

              <Button 
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="w-full bg-gradient-canadian border-0"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Preferências'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas Recentes</CardTitle>
              <CardDescription>
                Histórico das últimas notificações enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Nenhum alerta enviado ainda
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Configure seus alertas acima para começar a receber notificações
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Como funcionam os Alertas?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Monitoramento automático 24/7 do site oficial do IRCC</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Notificações instantâneas quando novos draws são publicados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Alertas personalizados baseados na sua pontuação e preferências</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Email e WhatsApp para garantir que você não perca nada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Resumos semanais para você acompanhar as tendências</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </ProFeatureGuard>
    </DashboardLayout>
  );
}

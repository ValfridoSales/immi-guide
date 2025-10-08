import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface DrawFiltersProps {
  window: '6m' | '12m' | 'all';
  type: string;
  userCrs: number | null;
  onWindowChange: (window: '6m' | '12m' | 'all') => void;
  onTypeChange: (type: string) => void;
  onUserCrsChange: (crs: number | null) => void;
}

export const DrawFilters = ({ window, type, userCrs, onWindowChange, onTypeChange, onUserCrsChange }: DrawFiltersProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Período</label>
        <Tabs value={window} onValueChange={(v) => onWindowChange(v as '6m' | '12m' | 'all')}>
          <TabsList>
            <TabsTrigger value="6m">6 meses</TabsTrigger>
            <TabsTrigger value="12m">12 meses</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block">Tipo de Draw</label>
        <Select value={type || "all"} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="general">Geral (General)</SelectItem>
            <SelectItem value="pnp">Programa de Nomeação Provincial (PNP)</SelectItem>
            <SelectItem value="cec">Classe de Experiência Canadense (CEC)</SelectItem>
            <SelectItem value="category">Categoria Específica (Category-based)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block">Seu CRS Score (opcional)</label>
        <Input
          type="number"
          min="0"
          max="600"
          placeholder="Ex: 480"
          value={userCrs ?? ''}
          onChange={(e) => onUserCrsChange(e.target.value ? parseInt(e.target.value) : null)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Veja draws onde você seria elegível
        </p>
      </div>
    </div>
  );
};
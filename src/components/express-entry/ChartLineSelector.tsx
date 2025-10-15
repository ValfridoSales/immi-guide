import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TrendingUp, Users, LayoutGrid } from 'lucide-react';

interface ChartLineSelectorProps {
  value: 'both' | 'crs' | 'itas';
  onChange: (value: 'both' | 'crs' | 'itas') => void;
}

export const ChartLineSelector = ({ value, onChange }: ChartLineSelectorProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium">Mostrar:</span>
      <ToggleGroup 
        type="single" 
        value={value} 
        onValueChange={(v) => v && onChange(v as 'both' | 'crs' | 'itas')}
      >
        <ToggleGroupItem value="both" aria-label="Mostrar ambos">
          <LayoutGrid className="h-4 w-4 mr-1" />
          Ambos
        </ToggleGroupItem>
        <ToggleGroupItem value="crs" aria-label="Mostrar apenas CRS">
          <TrendingUp className="h-4 w-4 mr-1" />
          CRS
        </ToggleGroupItem>
        <ToggleGroupItem value="itas" aria-label="Mostrar apenas ITAs">
          <Users className="h-4 w-4 mr-1" />
          ITAs
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

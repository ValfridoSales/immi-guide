import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DrawSeriesItem } from '@/types/express-entry';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface DrawsChartProps {
  data: DrawSeriesItem[];
  visibleLines?: 'both' | 'crs' | 'itas';
}

export const DrawsChart = ({ data, visibleLines = 'both' }: DrawsChartProps) => {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    fullDate: item.date,
    CRS: item.points,
    ITAs: item.invitations,
    title: item.title,
    category: item.category,
    source_url: item.source_url,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-4 shadow-elevated">
          <div className="space-y-2">
            <p className="font-semibold">{data.title}</p>
            <p className="text-sm text-muted-foreground">
              Data: {new Date(data.fullDate).toLocaleDateString('pt-BR')}
            </p>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground">CRS Mínimo</p>
                <p className="text-lg font-bold text-primary">{data.CRS}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Convites (ITAs)</p>
                <p className="text-lg font-bold text-secondary">{data.ITAs.toLocaleString()}</p>
              </div>
            </div>
            {data.category && (
              <p className="text-sm">
                <span className="text-muted-foreground">Categoria:</span> {data.category}
              </p>
            )}
            <a
              href={data.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Ver no site do IRCC
            </a>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'hsl(var(--foreground))' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          {(visibleLines === 'both' || visibleLines === 'itas') && (
            <YAxis 
              yAxisId="left"
              tick={{ fill: 'hsl(var(--foreground))' }}
              label={{ value: 'Convites (ITAs)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
            />
          )}
          {(visibleLines === 'both' || visibleLines === 'crs') && (
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'hsl(var(--foreground))' }}
              label={{ value: 'CRS Score', angle: 90, position: 'insideRight', fill: 'hsl(var(--foreground))' }}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {(visibleLines === 'both' || visibleLines === 'itas') && (
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="ITAs" 
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ fill: '#4F46E5', r: 4 }}
              name="Convites (ITAs)"
            />
          )}
          {(visibleLines === 'both' || visibleLines === 'crs') && (
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="CRS" 
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#EF4444', r: 4 }}
              name="CRS Mínimo"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
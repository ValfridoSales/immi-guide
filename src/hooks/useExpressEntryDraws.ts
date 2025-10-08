import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExpressEntryDraw, DrawSeriesData, DrawFilters, DrawSeriesFilters } from '@/types/express-entry';

export const useDrawsTable = (filters: DrawFilters = {}) => {
  return useQuery({
    queryKey: ['ee-draws', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);

      const { data, error } = await supabase.functions.invoke('api-draws', {
        method: 'GET',
      });

      if (error) throw error;
      return data as { draws: ExpressEntryDraw[]; count: number };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDrawsSeries = (filters: DrawSeriesFilters) => {
  return useQuery({
    queryKey: ['ee-draws-series', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('window', filters.window);
      if (filters.type) params.append('type', filters.type);

      const { data, error } = await supabase.functions.invoke('api-draws-series', {
        method: 'GET',
      });

      if (error) throw error;
      return data as DrawSeriesData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
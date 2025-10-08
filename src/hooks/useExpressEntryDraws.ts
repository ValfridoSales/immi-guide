import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExpressEntryDraw, DrawSeriesData, DrawFilters, DrawSeriesFilters } from '@/types/express-entry';

export const useDrawsTable = (filters: DrawFilters = {}) => {
  return useQuery({
    queryKey: ['ee-draws', filters],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-draws', {
        body: {
          limit: filters.limit,
          type: filters.type,
          category: filters.category,
        },
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
      const { data, error } = await supabase.functions.invoke('api-draws-series', {
        body: {
          window: filters.window,
          type: filters.type,
        },
      });

      if (error) throw error;
      return data as DrawSeriesData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
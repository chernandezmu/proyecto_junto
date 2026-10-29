import { useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './api';
import { supabase } from './supabase';

/** Preferencia "Avisarme cuando…" (abra Wheels/Tours o haya planes en el feed). */
export function useModuleInterest(module: 'wheels' | 'tours' | 'feed') {
  const qc = useQueryClient();
  const key = ['moduleInterest', module];
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from('module_interest').select('module').eq('module', module).maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
  const set = async (on: boolean) => {
    qc.setQueryData(key, on);
    try {
      await api.setModuleInterest(module, on);
    } catch {
      qc.invalidateQueries({ queryKey: key });
    }
  };
  return { on: !!query.data, set };
}

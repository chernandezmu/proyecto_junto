import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { api } from './api';

/** Id del plan de la ruta /plan/[id]/… */
export function usePlanId() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return String(id);
}

export function usePlan(id: string) {
  return useQuery({ queryKey: ['plan', id], queryFn: () => api.plan(id) });
}

/** Refresca todo lo que depende de un plan después de una acción. */
export function useRefreshPlans() {
  const qc = useQueryClient();
  return (planId?: string) =>
    Promise.all([
      planId ? qc.invalidateQueries({ queryKey: ['plan', planId] }) : null,
      qc.invalidateQueries({ queryKey: ['feed'] }),
      qc.invalidateQueries({ queryKey: ['home'] }),
      qc.invalidateQueries({ queryKey: ['myPlans'] }),
      qc.invalidateQueries({ queryKey: ['me'] }),
    ]);
}

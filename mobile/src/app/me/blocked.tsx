import { useQuery } from '@tanstack/react-query';

import { Avatar, Button, Card, ErrorCard, Header, Screen, Skeleton, StateBlock, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { mediaUrl } from '@/lib/supabase';
import { useRefreshPlans } from '@/lib/usePlan';

export default function Blocked() {
  const list = useQuery({ queryKey: ['blocked'], queryFn: api.blocked });
  const refresh = useRefreshPlans();

  return (
    <Screen>
      <Header center={<Text variant="title">Usuarios bloqueados</Text>} />
      {list.isLoading ? (
        <Skeleton height={70} />
      ) : list.isError ? (
        <ErrorCard onRetry={list.refetch} />
      ) : list.data?.length ? (
        list.data.map((p) => (
          <Card key={p.id} row compact>
            <Avatar name={p.name} photoUrl={mediaUrl(p.photo)} />
            <Text variant="title" style={{ flex: 1 }}>
              {p.name}
            </Text>
            <Button
              label="Desbloquear"
              variant="secondary"
              onPress={async () => {
                await api.unblock(p.id).catch(() => {});
                await Promise.all([list.refetch(), refresh()]);
              }}
            />
          </Card>
        ))
      ) : (
        <StateBlock icon="block" fill="mint" title="No has bloqueado a nadie" body="Si alguien te incomoda, puedes bloquearle desde el chat de un plan. No verá tus planes ni podrá escribirte." />
      )}
    </Screen>
  );
}

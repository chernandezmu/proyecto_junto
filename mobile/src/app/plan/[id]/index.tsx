import { router } from 'expo-router';
import { Share, View } from 'react-native';

import { categoryOf, PlanMedia, PlanStatusTag } from '@/components/plan';
import { Avatar, AvatarStack, Banner, Button, Card, Chip, ErrorCard, Header, Icon, IconButton, LinkButton, Row, Screen, Skeleton, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { friendlyError } from '@/lib/errors';
import { when } from '@/lib/format';
import { usePlan, usePlanId, useRefreshPlans } from '@/lib/usePlan';
import { mediaUrl } from '@/lib/supabase';
import { fills } from '@/theme/tokens';

export default function PlanDetail() {
  const id = usePlanId();
  const { me } = useAuth();
  const plan = usePlan(id);
  const refresh = useRefreshPlans();

  if (plan.isLoading) {
    return (
      <Screen>
        <Header />
        <Skeleton height={200} />
        <Skeleton height={40} />
        <Skeleton height={90} />
      </Screen>
    );
  }
  if (plan.isError || !plan.data) {
    return (
      <Screen>
        <Header />
        <ErrorCard message={friendlyError(plan.error)} onRetry={plan.refetch} />
      </Screen>
    );
  }

  const p = plan.data;
  const c = categoryOf(p.category);
  const full = p.joined >= p.capacity;
  const approved = me?.verification === 'approved';

  const share = () =>
    Share.share({ message: `${p.title} · ${when(p.startsAt)} · ${p.place}. Únete en Junto (solo estudiantes de El Bosque).` }).catch(() => {});
  const toggleSaved = async () => {
    try {
      await api.toggleSaved(p.id);
      refresh(p.id);
    } catch {}
  };

  return (
    <Screen>
      <Header
        right={
          <Row gap={8}>
            <IconButton icon="ios_share" label="Compartir plan" onPress={share} />
            <IconButton icon="bookmark" label={p.saved ? 'Quitar de guardados' : 'Guardar plan'} onPress={toggleSaved} bg={p.saved ? fills.lime : undefined} color={p.saved ? fills.onFill : undefined} />
          </Row>
        }
      />
      <PlanMedia plan={p} height={200} />
      {p.status === 'cancelled' ? <Banner icon="event_busy" fill="coral" title={`${p.organizer.name} canceló el plan`} body="Ya no va. Si estabas inscrito, no afecta tu calificación." /> : null}
      <Row wrap gap={6}>
        <Chip label={c.label} icon={c.icon} />
        {p.access === 'approval' ? <Chip label="El organizador aprueba" icon="verified_user" /> : null}
      </Row>
      <Text variant="h1Sm">{p.title}</Text>
      <View style={{ gap: 8 }}>
        <Row>
          <Icon name="schedule" />
          <Text>{when(p.startsAt)}</Text>
        </Row>
        <Row style={{ alignItems: 'flex-start' }}>
          <Icon name="location_on" />
          <Text style={{ flex: 1 }}>{p.place}</Text>
        </Row>
      </View>
      {p.description ? <Text tone="muted">{p.description}</Text> : null}
      <Card row>
        <Avatar name={p.organizer.name} photoUrl={mediaUrl(p.organizer.photo)} />
        <View style={{ flex: 1 }}>
          <Text variant="title">{p.organizer.name}</Text>
          <Text variant="small" tone="muted">
            Organiza{p.organizer.verified ? ' · verificada/o' : ''}
            {p.organizerRating ? ` · ${String(p.organizerRating).replace('.', ',')} ★` : ' · nuevo'}
          </Text>
        </View>
        {p.organizer.verified ? <Icon name="verified" label="Verificado" /> : null}
      </Card>
      <Row justify="space-between">
        <Text variant="label">Quién va</Text>
        <PlanStatusTag plan={p} />
      </Row>
      {p.attendees.length ? (
        <AvatarStack people={p.attendees.map((a) => ({ name: a.name, photoUrl: mediaUrl(a.photo) }))} total={p.joined} max={5} />
      ) : (
        <Text variant="small" tone="muted">
          Aún no hay nadie. ¡Sé la primera persona!
        </Text>
      )}

      {p.status !== 'published' ? null : p.isOrganizer ? (
        <Button label="Gestionar mi plan" onPress={() => router.push(`/plan/${p.id}/manage`)} />
      ) : p.myStatus === 'joined' ? (
        <Button label="Ir al chat del plan" icon="chat" onPress={() => router.push(`/plan/${p.id}/chat`)} />
      ) : p.myStatus === 'pending' ? (
        <>
          <Button label="Solicitud enviada" disabled />
          <LinkButton label="Retirar mi solicitud" onPress={() => router.push(`/plan/${p.id}/cancel`)} />
        </>
      ) : p.myStatus === 'rejected' ? (
        <>
          <Button label="El organizador no aprobó tu solicitud" disabled />
          <LinkButton label="Ver otros planes" onPress={() => router.replace('/events/feed')} />
        </>
      ) : !approved ? (
        <Button label="Podrás unirte cuando aprobemos tu carné" disabled />
      ) : full ? (
        <Button label="Este plan se llenó" onPress={() => router.push(`/plan/${p.id}/full`)} />
      ) : (
        <Button label={p.access === 'approval' ? 'Pedir unirme' : 'Quiero ir'} onPress={() => router.push(`/plan/${p.id}/join`)} />
      )}
      {!p.isOrganizer ? <LinkButton label="Reportar este plan" onPress={() => router.push({ pathname: '/report', params: { type: 'plan', id: p.id, name: p.title } })} /> : null}
    </Screen>
  );
}

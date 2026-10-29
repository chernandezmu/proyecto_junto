import { View } from 'react-native';

import { Card, Icon, RootHeader, Row, Screen, Tag, Text, ToggleRow, type IconName } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { mediaUrl } from '@/lib/supabase';
import { useModuleInterest } from '@/lib/useModuleInterest';
import { fills, type FillName } from '@/theme/tokens';

type Props = {
  module: 'wheels' | 'tours';
  title: string;
  icon: IconName;
  fill: FillName;
  headline: string;
  body: string;
  points: { icon: IconName; title: string; body: string }[];
};

/** Pestaña de un módulo que abre en fases posteriores (Wheels, Tours). */
export function ModuleSoon({ module, title, icon, fill, headline, body, points }: Props) {
  const { me } = useAuth();
  const interest = useModuleInterest(module);
  if (!me) return null;

  return (
    <Screen tab fabClearance>
      <RootHeader title={title} name={me.fullName} photoUrl={mediaUrl(me.photo)} />
      <Card fill={fill}>
        <Row justify="space-between">
          <Icon name={icon} size={40} color={fills.onFill} />
          <Tag label="Próximamente" fill="lilac" />
        </Row>
        <Text variant="h2" tone="onFill">
          {headline}
        </Text>
        <Text tone="onFill">{body}</Text>
      </Card>
      {points.map((p) => (
        <Row key={p.title} gap={12} style={{ alignItems: 'flex-start' }}>
          <Icon name={p.icon} />
          <View style={{ flex: 1 }}>
            <Text variant="title">{p.title}</Text>
            <Text variant="small" tone="muted">
              {p.body}
            </Text>
          </View>
        </Row>
      ))}
      <Card>
        <ToggleRow icon="notifications_active" label="Avisarme cuando abra" value={interest.on} onChange={interest.set} />
      </Card>
    </Screen>
  );
}

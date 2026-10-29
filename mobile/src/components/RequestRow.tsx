import { View } from 'react-native';

import { Avatar, Card, IconButton, Row, Tag, Text } from '@/components/ui';
import type { Request } from '@/lib/api';
import { mediaUrl } from '@/lib/supabase';
import { fills } from '@/theme/tokens';

/** Persona inscrita o con solicitud, vista por el organizador. */
export function RequestRow({ r, onAccept, onReject }: { r: Request; onAccept?: () => void; onReject?: () => void }) {
  const sub = [r.career, r.semester ? `${r.semester}°` : null].filter(Boolean).join(' · ');
  return (
    <Card row compact>
      <Avatar name={r.name} photoUrl={mediaUrl(r.photo)} />
      <View style={{ flex: 1 }}>
        <Text variant="title">{r.name}</Text>
        {sub ? (
          <Text variant="small" tone="muted">
            {sub}
          </Text>
        ) : null}
      </View>
      {r.status === 'pending' && onAccept && onReject ? (
        <Row gap={6}>
          <IconButton icon="close" label={`Rechazar a ${r.name}`} onPress={onReject} />
          <IconButton icon="check" label={`Aceptar a ${r.name}`} onPress={onAccept} bg={fills.mint} color={fills.onFill} />
        </Row>
      ) : r.status === 'rejected' ? (
        <Tag label="Rechazado" fill="coral" />
      ) : r.checkedIn ? (
        <Tag label="Llegó" fill="mint" />
      ) : (
        <Tag label="Inscrito" fill="lilac" />
      )}
    </Card>
  );
}

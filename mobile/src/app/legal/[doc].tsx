import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Banner, Header, Screen, Text } from '@/components/ui';

// BORRADOR para la demo de clase. Antes de un lanzamiento público lo revisa asesoría legal
// (Ley 1581 de 2012 y Decreto 1377 de 2013). Ver SECURITY.md §6.
const CONTACT = 'chernandezmu@unbosque.edu.co';
const UPDATED = '29 de octubre de 2026';

type Doc = { title: string; sections: { h: string; p: string }[] };

const DOCS: Record<string, Doc> = {
  privacidad: {
    title: 'Política de tratamiento de datos',
    sections: [
      { h: 'Quién trata tus datos', p: `El equipo de Junto (proyecto de la Universidad El Bosque). Contacto: ${CONTACT}.` },
      { h: 'Qué datos pedimos y para qué', p: 'Correo institucional: saber a qué campus perteneces. Carné o certificado de matrícula, código estudiantil y fecha de nacimiento: validar que eres estudiante y mayor de 18 años. Nombre, foto, carrera, semestre e intereses: que la gente de tus planes te reconozca. Planes, mensajes y calificaciones: hacer funcionar la app.' },
      { h: 'Cuánto tiempo los guardamos', p: 'El carné se borra 30 días después de revisarlo; solo guardamos si fue aprobado. El resto, mientras tengas cuenta. Si la eliminas, borramos tu perfil, inscripciones, mensajes y calificaciones.' },
      { h: 'Quién los ve', p: 'Solo estudiantes verificados de tu misma universidad, y solo lo necesario: los mensajes, únicamente quienes están en el mismo plan. Nunca vendemos tus datos.' },
      { h: 'Tus derechos', p: `Puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar esta autorización. Desde la app: Perfil → Privacidad y seguridad → Descargar mis datos o Eliminar mi cuenta. También escribiendo a ${CONTACT}.` },
      { h: 'Edad mínima', p: 'Junto es solo para mayores de 18 años. No tratamos datos de menores.' },
    ],
  },
  normas: {
    title: 'Normas de la comunidad',
    sections: [
      { h: 'Respeto siempre', p: 'Nada de acoso, insultos, discriminación ni mensajes sexuales no deseados. Junto es para hacer planes, no una app de citas.' },
      { h: 'Planes reales', p: 'Publica planes que de verdad vas a hacer, con lugar y hora reales. Nada de ventas, publicidad ni planes falsos.' },
      { h: 'Cumple o avisa', p: 'Si te inscribes, ve. Si no puedes, cancela a tiempo para liberar el cupo. Faltar sin avisar baja tu calificación.' },
      { h: 'Seguridad', p: 'Encuéntrate en lugares públicos del campus. Si algo te incomoda, repórtalo o bloquea a la persona. Si estás en peligro, llama al 123.' },
      { h: 'Qué pasa si no se cumplen', p: 'Revisamos cada reporte en menos de 24 h. Podemos ocultar planes, suspender o cerrar cuentas.' },
    ],
  },
  terminos: {
    title: 'Términos de uso',
    sections: [
      { h: 'Quién puede usar Junto', p: 'Estudiantes mayores de 18 años con correo y carné vigentes de una universidad habilitada (por ahora, El Bosque).' },
      { h: 'Tu cuenta', p: 'Es personal. Entras con un código que llega a tu correo institucional; no lo compartas.' },
      { h: 'Los planes', p: 'Los organiza cada estudiante. Junto conecta a las personas, pero no organiza ni supervisa los planes.' },
      { h: 'Cambios', p: 'Si cambiamos estos términos, te avisamos en la app.' },
    ],
  },
};

export default function Legal() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const d = DOCS[String(doc)] ?? DOCS.terminos;
  return (
    <Screen>
      <Header />
      <Text variant="h1Sm">{d.title}</Text>
      <Text variant="small" tone="muted">
        Última actualización: {UPDATED}
      </Text>
      <Banner icon="info" fill="sky" title="Versión borrador" body="Texto para la demo del proyecto. Se revisará antes de un lanzamiento público." />
      {d.sections.map((s) => (
        <View key={s.h} style={{ gap: 4 }}>
          <Text variant="title">{s.h}</Text>
          <Text>{s.p}</Text>
        </View>
      ))}
    </Screen>
  );
}

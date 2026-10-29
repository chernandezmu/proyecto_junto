import { ModuleSoon } from '@/components/ModuleSoon';

export default function Wheels() {
  return (
    <ModuleSoon
      module="wheels"
      title="Wheels"
      icon="directions_car"
      fill="lime"
      headline="Carpooling a la U, entre estudiantes"
      body="Sube al carro de alguien de tu campus que pasa por tu ruta, o comparte tus puestos libres."
      points={[
        { icon: 'verified_user', title: 'Solo estudiantes verificados', body: 'Conductores con licencia, SOAT y tecnomecánica al día.' },
        { icon: 'route', title: 'En tu ruta de siempre', body: 'Te mostramos quién pasa cerca de tu casa a la hora de tu clase.' },
        { icon: 'shield', title: 'Viaje seguro', body: 'Botón SOS, seguimiento en vivo y pago dentro de la app.' },
      ]}
    />
  );
}

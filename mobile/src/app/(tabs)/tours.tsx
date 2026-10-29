import { ModuleSoon } from '@/components/ModuleSoon';

export default function Tours() {
  return (
    <ModuleSoon
      module="tours"
      title="Tours"
      icon="landscape"
      fill="sky"
      headline="Viajes en grupo con gente de tu U"
      body="Arma un viaje con tu grupo o súmate a uno si no tienes con quién ir."
      points={[
        { icon: 'groups', title: 'Grupos compatibles', body: 'Te emparejamos con estudiantes que buscan el mismo plan.' },
        { icon: 'verified', title: 'Operadores verificados', body: 'Viajes con operadores revisados por el equipo de Junto.' },
        { icon: 'event_seat', title: 'Reserva con abono', body: 'Aseguras tu cupo con el 30% y el resto antes de salir.' },
      ]}
    />
  );
}

const MAIL_API_BASE_URL = 'https://eqv7ecjeolvi7q5ijpiu7zbaam0npwwf.lambda-url.us-east-1.on.aws/api/v1';
const MAIL_SEND_PATH = '/email/send';

interface MailSendPayload {
  to: string;
  subject: string;
  html: string;
}

interface ReservationDetails {
  reservationDate: string;
  reservationTime?: string | null;
  guestsCount: number;
  restaurantName?: string | null;
  specialRequest?: string;
  reasonCancellation?: string;
}

const escapeHtml = (input: string | null | undefined): string => {
  if (!input) {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const buildBaseEmail = ({
  preheader,
  title,
  greeting,
  introLines,
  highlight,
  sections,
  footerNote,
}: {
  preheader: string;
  title: string;
  greeting: string;
  introLines: string[];
  highlight?: { label: string; value: string };
  sections?: Array<{ heading: string; content: string }>;
  footerNote?: string;
}) => {
  const introHtml = introLines.map((line) => `<p style="margin: 12px 0; color: #1f2933;">${line}</p>`).join('');
  const highlightHtml = highlight
    ? `<div style="background: linear-gradient(135deg, #ede9fe, #e0f2fe); border-radius: 16px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0; text-transform: uppercase; font-size: 12px; letter-spacing: 0.12em; color: #475569;">${highlight.label}</p>
        <p style="margin: 8px 0 0; font-size: 20px; font-weight: 600; color: #0f172a;">${highlight.value}</p>
      </div>`
    : '';

  const sectionsHtml =
    sections
      ?.map(
        (section) => `
        <div style="margin: 20px 0; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; background: #f8fafc;">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">${section.heading}</h3>
          <p style="margin: 0; color: #1f2933;">${section.content}</p>
        </div>`
      )
      .join('') ?? '';

  const footerHtml = `
    <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 18px;">
      ${footerNote ?? 'Gracias por confiar en FoodAI. Estamos construyendo experiencias memorables alrededor de cada comida.'}
    </p>
    <p style="margin: 16px 0 0; color: #cbd5f5; font-size: 10px;">© ${new Date().getFullYear()} FoodAI. Todos los derechos reservados.</p>
  `;

  return `<!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(title)}</title>
      <style>
        @media (prefers-color-scheme: dark) {
          body { background: #020617; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(160deg, #0f172a, #1e293b); font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="width: 100%; padding: 32px 16px;">
        <span style="display: none; visibility: hidden; opacity: 0; height: 0; width: 0;">${preheader}</span>
        <table style="max-width: 560px; margin: 0 auto; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 60px rgba(15, 23, 42, 0.35);">
          <tr>
            <td style="padding: 32px; background: rgba(15, 23, 42, 0.85); border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
              <div style="display: inline-block; padding: 10px 18px; border-radius: 999px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #f8fafc; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-size: 11px;">
                FoodAI
              </div>
              <h1 style="margin: 24px 0 0; color: #f8fafc; font-size: 24px;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; background: #f8fafc;">
              <p style="margin: 0; font-weight: 600; color: #0f172a;">${greeting}</p>
              ${introHtml}
              ${highlightHtml}
              ${sectionsHtml}
              <div style="margin-top: 32px; text-align: center;">
                ${footerHtml}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
  </html>`;
};

const formatSchedule = ({ reservationDate, reservationTime }: ReservationDetails) => {
  if (!reservationDate) {
    return { dateLabel: 'Fecha por confirmar', timeLabel: '' };
  }

  const normalizedTime =
    reservationTime && reservationTime.length === 5
      ? `${reservationTime}:00`
      : reservationTime ?? '19:00:00';
  const candidate = normalizedTime ? `${reservationDate}T${normalizedTime}` : reservationDate;
  const parsed = new Date(candidate);

  if (Number.isNaN(parsed.getTime())) {
    return { dateLabel: reservationDate, timeLabel: reservationTime ?? '' };
  }

  const dateLabel = parsed.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const timeLabel = parsed.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    dateLabel: dateLabel.replace(/^\w/, (c) => c.toUpperCase()),
    timeLabel,
  };
};

export const sendMail = async ({ to, subject, html }: MailSendPayload): Promise<boolean> => {
  try {
    const response = await fetch(`${MAIL_API_BASE_URL}${MAIL_SEND_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Mail API responded with status ${response.status}: ${message}`);
    }

    return true;
  } catch (error) {
    console.error('Error enviando correo transaccional:', error);
    return false;
  }
};
export const sendReservationConfirmationEmail = async ({
  email,
  fullName,
  reservation,
}: {
  email: string;
  fullName: string;
  reservation: ReservationDetails;
}) => {
  const safeName = escapeHtml(fullName || email);
  const { dateLabel, timeLabel } = formatSchedule(reservation);

  const subject = `Confirmación de tu reserva en ${reservation.restaurantName ?? 'FoodAI'}`;

  const html = buildBaseEmail({
    preheader: `Tu reserva está confirmada para ${dateLabel} a las ${timeLabel}`,
    title: '¡Tu reserva está confirmada!',
    greeting: `Hola ${safeName},`,
    introLines: [
      'Nos complace informarte que tu reserva ha sido confirmada exitosamente.',
      'Prepárate para disfrutar de una experiencia gastronómica excepcional con el toque inteligente de FoodAI.',
    ],
    highlight: {
      label: 'Reserva confirmada',
      value: escapeHtml(reservation.restaurantName ?? 'Restaurante FoodAI'),
    },
    sections: [
      {
        heading: 'Detalles de tu reserva',
        content: `
          <strong>Fecha:</strong> ${escapeHtml(dateLabel)}<br/>
          <strong>Hora:</strong> ${escapeHtml(timeLabel)}<br/>
          <strong>Personas:</strong> ${reservation.guestsCount}<br/>
          ${
            reservation.specialRequest
              ? `<strong>Notas especiales:</strong> ${escapeHtml(reservation.specialRequest)}`
              : ''
          }
        `.trim(),
      },
      {
        heading: 'Consejos para disfrutar al máximo',
        content:
          'Llega unos minutos antes para relajarte y disfrutar la experiencia completa. Si necesitas modificar o cancelar tu reserva, puedes hacerlo fácilmente desde tu panel en FoodAI.',
      },
    ],
    footerNote:
      'Gracias por reservar con FoodAI. Cada mesa es una nueva historia culinaria. ¡Nos vemos pronto!',
  });

  await sendMail({ to: email, subject, html });
};

export const sendWelcomeEmail = async ({
  email,
  fullName,
  role,
}: {
  email: string;
  fullName: string;
  role: 'client' | 'restaurant' | 'admin';
}) => {
  const safeName = escapeHtml(fullName || email);
  const isRestaurant = role === 'restaurant';

  const subject = isRestaurant
    ? 'Bienvenido al ecosistema FoodAI para restaurantes'
    : 'Bienvenido a FoodAI, tu mesa te espera';

  const html = buildBaseEmail({
    preheader: isRestaurant
      ? 'Activa tu panel para gestionar reservas, menús y analíticas en tiempo real.'
      : 'Descubre experiencias gastronómicas personalizadas y gestiona tus reservas fácilmente.',
    title: subject,
    greeting: `Hola ${safeName},`,
    introLines: isRestaurant
      ? [
          'Gracias por elegir FoodAI para transformar la experiencia de tu restaurante.',
          'Desde hoy cuentas con herramientas inteligentes para recibir reservas en segundos, gestionar tu menú y entender a tus comensales con insights automatizados.',
        ]
      : [
          '¡Tu aventura gastronómica personalizada comienza ahora!',
          'En FoodAI podrás descubrir restaurantes únicos, reservar en tiempo real y recibir recomendaciones hechas a tu medida.',
        ],
    highlight: {
      label: 'Tu cuenta está activa',
      value: isRestaurant
        ? 'Panel inteligente de restaurante habilitado'
        : 'Experiencia personalizada desbloqueada',
    },
    sections: isRestaurant
      ? [
          {
            heading: '¿Qué puedes hacer a continuación?',
            content:
              'Completa el perfil de tu restaurante, configura tus horarios y comienza a aceptar reservas sin fricción. Tus clientes recibirán confirmaciones automáticas y tú tendrás visibilidad total desde el dashboard.',
          },
          {
            heading: 'Tips para un lanzamiento brillante',
            content:
              'Agrega imágenes auténticas, destaca tus platos icónicos y habilita notificaciones en tiempo real. Cada detalle ayuda a generar confianza y experiencias memorables.',
          },
        ]
      : [
          {
            heading: 'Experiencias que sentirás tuyas',
            content:
              'Personaliza tu perfil, agrega tus preferencias y deja que nuestro motor inteligente te sugiera el lugar perfecto para cada ocasión.',
          },
          {
            heading: 'Control total de tus reservas',
            content:
              'Agenda en segundos, recibe confirmaciones instantáneas y mantén un historial organizado de tus visitas y favoritos.',
          },
        ],
  });

  await sendMail({ to: email, subject, html });
};

export const sendReservationCreatedEmail = async ({
  email,
  fullName,
  reservation,
}: {
  email: string;
  fullName: string;
  reservation: ReservationDetails;
}) => {
  const safeName = escapeHtml(fullName || email);
  const { dateLabel, timeLabel } = formatSchedule(reservation);

  const subject = `Tu reserva en ${reservation.restaurantName ?? 'FoodAI'} está en camino`;

  const html = buildBaseEmail({
    preheader: `Reserva para ${dateLabel} a las ${timeLabel}`,
    title: 'Reserva registrada con éxito',
    greeting: `Hola ${safeName},`,
    introLines: [
      'Hemos recibido tu solicitud de reserva y ya estamos coordinando con el restaurante para confirmarla.',
      'A continuación, un resumen moderno para que tengas todo a mano.',
    ],
    highlight: {
      label: 'Restaurante',
      value: escapeHtml(reservation.restaurantName ?? 'Por confirmar'),
    },
    sections: [
      {
        heading: 'Detalles de la experiencia',
        content: `
          <strong>Fecha:</strong> ${escapeHtml(dateLabel)}<br/>
          <strong>Hora:</strong> ${escapeHtml(timeLabel)}<br/>
          <strong>Personas:</strong> ${reservation.guestsCount}<br/>
          ${
            reservation.specialRequest
              ? `<strong>Notas especiales:</strong> ${escapeHtml(reservation.specialRequest)}`
              : ''
          }
        `.trim(),
      },
      {
        heading: '¿Qué sigue?',
        content:
          'Te notificaremos automáticamente cuando el restaurante confirme tu mesa. También podrás consultar y gestionar tus reservas desde tu panel en FoodAI.',
      },
    ],
  });

  await sendMail({ to: email, subject, html });
};

export const sendReservationStatusEmail = async ({
  email,
  fullName,
  reservation,
  status,
}: {
  email: string;
  fullName: string;
  reservation: ReservationDetails;
  status: 'confirmed' | 'cancelled' | 'completed';
}) => {
  const safeName = escapeHtml(fullName || email);
  const { dateLabel, timeLabel } = formatSchedule(reservation);

  const statusCopy: Record<
    typeof status,
    { subject: string; title: string; intro: string[]; highlightLabel: string }
  > = {
    confirmed: {
      subject: `¡Tu mesa en ${reservation.restaurantName ?? 'FoodAI'} está confirmada!`,
      title: 'Reserva confirmada',
      intro: [
        'El restaurante ha confirmado tu reserva. Ya puedes prepararte para una experiencia deliciosa.',
        'Estos son los detalles finales, listos para compartir o guardar.',
      ],
      highlightLabel: 'Estado confirmado',
    },
    cancelled: {
      subject: `Tu reserva en ${reservation.restaurantName ?? 'FoodAI'} ha sido cancelada`,
      title: 'Reserva cancelada',
      intro: [
        'Hemos procesado la cancelación de tu reserva.',
        reservation.reasonCancellation
          ? `Motivo enviado: ${escapeHtml(reservation.reasonCancellation)}`
          : 'Si fue un cambio de planes, estaremos aquí cuando quieras reagendar.',
      ],
      highlightLabel: 'Reserva cancelada',
    },
    completed: {
      subject: `Esperamos que hayas disfrutado en ${reservation.restaurantName ?? 'FoodAI'}`,
      title: '¡Gracias por visitarnos!',
      intro: [
        'Tu reserva ha sido marcada como completada. Gracias por confiar en FoodAI para crear momentos memorables.',
        'No olvides marcar tus lugares favoritos y compartir tu experiencia.',
      ],
      highlightLabel: 'Experiencia completada',
    },
  };

  const copy = statusCopy[status];

  const html = buildBaseEmail({
    preheader: copy.subject,
    title: copy.title,
    greeting: `Hola ${safeName},`,
    introLines: copy.intro,
    highlight: {
      label: copy.highlightLabel,
      value: escapeHtml(reservation.restaurantName ?? 'Restaurante FoodAI'),
    },
    sections: [
      {
        heading: 'Detalles relevantes',
        content: `
          <strong>Fecha:</strong> ${escapeHtml(dateLabel)}<br/>
          <strong>Hora:</strong> ${escapeHtml(timeLabel)}<br/>
          <strong>Personas:</strong> ${reservation.guestsCount}<br/>
          ${
            reservation.specialRequest
              ? `<strong>Notas especiales:</strong> ${escapeHtml(reservation.specialRequest)}<br/>`
              : ''
          }
          ${
            status === 'cancelled' && reservation.reasonCancellation
              ? `<strong>Motivo:</strong> ${escapeHtml(reservation.reasonCancellation)}`
              : ''
          }
        `.trim(),
      },
    ],
    footerNote:
      status === 'confirmed'
        ? 'No olvides llegar unos minutos antes para disfrutar sin prisas. Si necesitas ajustar algo, puedes hacerlo desde tu panel en FoodAI.'
        : status === 'cancelled'
          ? 'Esperamos verte pronto de vuelta. Cuando estés listo, podrás crear una nueva reserva en segundos.'
          : 'Comparte tu experiencia y ayuda a otros FoodAI explorers a descubrir lugares increíbles.',
  });

  await sendMail({ to: email, subject: copy.subject, html });
};


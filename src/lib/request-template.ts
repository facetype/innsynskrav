import { formatDate } from './format';

export interface RequestInput {
  fullName: string;
  applicationEmail: string;
  phone: string;
  positionTitle: string;
  location: string;
  /** ISO date (YYYY-MM-DD) or empty */
  applicationDate: string;
  /** ISO date (YYYY-MM-DD) or empty */
  rejectionDate: string;
  reference: string;
}

export interface RequestContext {
  brand: string;
  atsNames: string[];
}

export interface GeneratedRequest {
  subject: string;
  body: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / MS_PER_DAY);
}

/** A same-day or next-day rejection is the applicant's main evidence of automation. */
function rejectionSpeedNote(applicationDate: string, rejectionDate: string): string | null {
  if (!applicationDate || !rejectionDate) return null;
  const days = daysBetween(applicationDate, rejectionDate);
  if (days === 0) return 'Avslaget kom samme dag som jeg sendte søknaden, noe som tyder på at avgjørelsen kan ha vært automatisert.';
  if (days === 1) return 'Avslaget kom dagen etter at jeg sendte søknaden, noe som tyder på at avgjørelsen kan ha vært automatisert.';
  return null;
}

export function buildRequest(input: RequestInput, context: RequestContext): GeneratedRequest {
  const position = input.positionTitle.trim() || '[stilling]';
  const name = input.fullName.trim() || '[fullt navn]';
  const positionLine = input.location.trim()
    ? `${position} (${input.location.trim()})`
    : position;

  const identifiers = [
    `- Navn: ${name}`,
    `- E-postadresse brukt i søknaden: ${input.applicationEmail.trim() || '[e-postadresse]'}`,
    input.phone.trim() && `- Telefon: ${input.phone.trim()}`,
    `- Stilling: ${positionLine}`,
    input.applicationDate && `- Søknadsdato: ${formatDate(input.applicationDate)}`,
    input.rejectionDate && `- Dato for avslag: ${formatDate(input.rejectionDate)}`,
    input.reference.trim() && `- Referanse/saksnummer: ${input.reference.trim()}`,
  ].filter(Boolean);

  const recipients = context.atsNames.length
    ? `inkludert databehandlere som rekrutteringssystemet ${context.atsNames.join(' / ')}`
    : 'inkludert eventuelle databehandlere som rekrutteringssystem';

  const speedNote = rejectionSpeedNote(input.applicationDate, input.rejectionDate);

  const body = [
    'Hei,',
    `Jeg ber med dette om innsyn i personopplysninger ${context.brand} behandler om meg, jf. personvernforordningen (GDPR) artikkel 15, i forbindelse med min søknad på stillingen som ${positionLine}.`,
    ['Opplysninger som identifiserer meg:', ...identifiers].join('\n'),
    [
      'Jeg ber om:',
      '1. En kopi av alle personopplysninger dere har om meg knyttet til søknaden, jf. artikkel 15 nr. 3, inkludert CV, søknadstekst, notater, vurderinger, poeng og rangeringer.',
      '2. Formålene med behandlingen.',
      `3. Hvem opplysningene er utlevert til, ${recipients}.`,
      '4. Hvor lenge opplysningene vil bli lagret, eller kriteriene for å fastsette dette.',
      '5. Hvor opplysningene er hentet fra, dersom de ikke er samlet inn fra meg.',
    ].join('\n'),
    [
      'Automatiserte avgjørelser (artikkel 22):',
      [
        'Jeg ber om å få vite om avslaget helt eller delvis ble tatt ved automatiserte avgjørelser, inkludert profilering. I så fall ber jeg om relevant informasjon om den underliggende logikken, samt betydningen og de forventede konsekvensene av behandlingen for meg, jf. artikkel 15 nr. 1 bokstav h. Dersom avgjørelsen var utelukkende automatisert, ber jeg om at den blir overprøvd av et menneske, jf. artikkel 22 nr. 3.',
        speedNote,
      ]
        .filter(Boolean)
        .join(' '),
    ].join('\n'),
    'Etter artikkel 12 nr. 3 skal dere svare uten ugrunnet opphold og senest innen én måned etter at dere mottok denne henvendelsen.',
    `Med vennlig hilsen\n${name}`,
  ].join('\n\n');

  return {
    subject: `Innsynskrav etter GDPR art. 15 og 22 – søknad på stilling som ${position}`,
    body,
  };
}

/** RFC 6068 wants CRLF line breaks in mailto bodies. */
export function buildMailtoHref(recipient: string, request: GeneratedRequest): string {
  const subject = encodeURIComponent(request.subject);
  const body = encodeURIComponent(request.body.replace(/\n/g, '\r\n'));
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

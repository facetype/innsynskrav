import { buildMailtoHref } from './request-template';

// TODO: replace with the real address (e.g. firma@<domain> via Cloudflare Email Routing) before deploying
export const CONTACT_EMAIL = 'firma@example.com';

export function buildAddCompanyHref(employerName = ''): string {
  const name = employerName.trim();
  return buildMailtoHref(CONTACT_EMAIL, {
    subject: name ? `Legg til arbeidsgiver: ${name}` : 'Legg til arbeidsgiver',
    body: [
      'Hei! Kan dere legge til denne arbeidsgiveren?',
      `Arbeidsgiver: ${name}`,
      'Lenke til personvernerklæringen (hvis du har den): ',
    ].join('\n\n'),
  });
}

export function buildCorrectionHref(brand: string, currentEmail: string): string {
  return buildMailtoHref(CONTACT_EMAIL, {
    subject: `Feil adresse: ${brand}`,
    body: [
      `Adressen dere har for ${brand} (${currentEmail}) ser ut til å være feil.`,
      'Riktig adresse eller lenke til personvernerklæringen (hvis du vet): ',
    ].join('\n\n'),
  });
}

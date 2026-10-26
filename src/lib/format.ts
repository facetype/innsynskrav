const dateFormatter = new Intl.DateTimeFormat('nb-NO', { dateStyle: 'long' });

/** `2026-10-26` → `26. oktober 2026` */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00`));
}

/** `936314783` → `936 314 783`, as Brønnøysundregistrene displays it */
export function formatOrgNr(orgNr: string): string {
  return orgNr.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
}

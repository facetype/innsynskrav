export type Ats = 'teamtailor' | 'webcruiter' | 'reachmee' | 'jobylon' | 'workday';

export const atsNames: Record<Ats, string> = {
  teamtailor: 'Teamtailor',
  webcruiter: 'Webcruiter',
  reachmee: 'ReachMee',
  jobylon: 'Jobylon',
  workday: 'Workday',
};

export interface AtsSender {
  ats: Ats;
  /** Subdomain in the ATS mail relay, e.g. `synoptikgroupnorway` in `x@synoptikgroupnorway.teamtailor-mail.com` */
  slug: string;
}

export interface Company {
  /** URL slug for /firma/<slug> */
  slug: string;
  /** Brand names applicants know the employer by */
  brands: string[];
  controller: {
    name: string;
    orgNr: string;
    address: string;
  };
  privacyEmail: string;
  privacyPolicyUrl: string;
  senders: AtsSender[];
  /** ISO date (YYYY-MM-DD) the privacy email was last checked against privacyPolicyUrl */
  lastVerified: string;
}

export const companies: Company[] = [
  {
    slug: 'brilleland',
    brands: ['Brilleland'],
    controller: {
      name: 'Synoptik Norge AS',
      orgNr: '936314783',
      address: 'Eyvind Lyches vei 19A, 1338 Sandvika',
    },
    privacyEmail: 'personvernombud@brilleland.no',
    privacyPolicyUrl: 'https://www.brilleland.no/personvernerklaring/',
    senders: [{ ats: 'teamtailor', slug: 'synoptikgroupnorway' }],
    lastVerified: '2026-10-26',
  },
];

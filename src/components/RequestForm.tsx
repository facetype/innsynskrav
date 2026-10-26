import { useId, useMemo, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { buildMailtoHref, buildRequest, type RequestInput } from '../lib/request-template';
import './RequestForm.css';

interface Props {
  brand: string;
  recipient: string;
  atsNames: string[];
}

interface Field {
  key: keyof RequestInput;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date';
  required?: boolean;
  autoComplete?: string;
  hint?: string;
}

const fields: Field[] = [
  { key: 'fullName', label: 'Fullt navn', type: 'text', required: true, autoComplete: 'name', hint: 'Slik det står i søknaden.' },
  { key: 'applicationEmail', label: 'E-post brukt i søknaden', type: 'email', required: true, autoComplete: 'email' },
  { key: 'phone', label: 'Telefon', type: 'tel', autoComplete: 'tel' },
  { key: 'positionTitle', label: 'Stilling', type: 'text', required: true, hint: 'F.eks. «Butikkmedarbeider».' },
  { key: 'location', label: 'Butikk / sted', type: 'text', hint: 'F.eks. «Skien sentrum».' },
  { key: 'applicationDate', label: 'Søknadsdato', type: 'date' },
  { key: 'rejectionDate', label: 'Dato for avslag', type: 'date' },
  { key: 'reference', label: 'Referanse fra avslaget', type: 'text', hint: 'Hvis avslaget har et saksnummer.' },
];

const emptyInput: RequestInput = {
  fullName: '',
  applicationEmail: '',
  phone: '',
  positionTitle: '',
  location: '',
  applicationDate: '',
  rejectionDate: '',
  reference: '',
};

const COPY_STATUS_MS = 3000;

export default function RequestForm({ brand, recipient, atsNames }: Props) {
  const idPrefix = useId();
  const [input, setInput] = useState<RequestInput>(emptyInput);
  const [copyStatus, setCopyStatus] = useState('');

  const request = useMemo(() => buildRequest(input, { brand, atsNames }), [input, brand, atsNames]);

  const update = (key: keyof RequestInput) => (event: ChangeEvent<HTMLInputElement>) =>
    setInput((current) => ({ ...current, [key]: event.target.value }));

  const openEmail = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href = buildMailtoHref(recipient, request);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(`Til: ${recipient}\nEmne: ${request.subject}\n\n${request.body}`);
      setCopyStatus('Kopiert til utklippstavlen.');
    } catch {
      setCopyStatus('Kunne ikke kopiere. Marker teksten og kopier manuelt.');
    }
    setTimeout(() => setCopyStatus(''), COPY_STATUS_MS);
  };

  return (
    <div className="request">
      <form className="request-form" onSubmit={openEmail} aria-describedby={`${idPrefix}-privacy`}>
        <p id={`${idPrefix}-privacy`} className="request-privacy">
          <span aria-hidden="true">🔒</span> Det du skriver forlater aldri nettleseren din.
        </p>
        <div className="request-fields">
          {fields.map((field) => {
            const id = `${idPrefix}-${field.key}`;
            const hintId = field.hint ? `${id}-hint` : undefined;
            return (
              <div className="request-field" key={field.key}>
                <label htmlFor={id}>
                  {field.label}
                  {!field.required && <span className="request-optional"> (valgfritt)</span>}
                </label>
                <input
                  id={id}
                  type={field.type}
                  required={field.required}
                  autoComplete={field.autoComplete ?? 'off'}
                  aria-describedby={hintId}
                  value={input[field.key]}
                  onChange={update(field.key)}
                />
                {field.hint && (
                  <p id={hintId} className="request-hint">
                    {field.hint}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="request-actions">
          <button type="submit" className="button">
            Skriv e-post <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="button button-secondary" onClick={copyText}>
            Kopier teksten
          </button>
          <p className="request-status" role="status">
            {copyStatus}
          </p>
        </div>
        <p className="request-hint">
          Send fra samme e-post som du søkte med. Blir teksten kuttet, bruk «Kopier teksten».
        </p>
      </form>

      <section className="request-preview" aria-labelledby={`${idPrefix}-preview-title`}>
        <h3 id={`${idPrefix}-preview-title`} className="request-preview-title">
          Slik blir e-posten
        </h3>
        <div className="request-sheet">
          <dl className="request-meta mono">
            <div>
              <dt>Til</dt>
              <dd>{recipient}</dd>
            </div>
            <div>
              <dt>Emne</dt>
              <dd>{request.subject}</dd>
            </div>
          </dl>
          <p className="request-body">{request.body}</p>
        </div>
      </section>
    </div>
  );
}

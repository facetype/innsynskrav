import { useId, useMemo, useState } from 'react';
import { buildAddCompanyHref } from '../lib/contact';
import './CompanySearch.css';

export interface CompanySummary {
  slug: string;
  brands: string[];
  controllerName: string;
}

interface Props {
  companies: CompanySummary[];
}

const normalize = (text: string) => text.toLocaleLowerCase('nb').trim();

export default function CompanySearch({ companies }: Props) {
  const inputId = useId();
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return companies;
    return companies.filter((company) =>
      [...company.brands, company.controllerName].some((name) => normalize(name).includes(needle)),
    );
  }, [companies, query]);

  return (
    <div className="search">
      <label htmlFor={inputId} className="search-label">
        Søk etter arbeidsgiver
      </label>
      <input
        id={inputId}
        className="search-input"
        type="search"
        placeholder="F.eks. Brilleland"
        autoComplete="off"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p className="search-count" role="status">
        {matches.length === companies.length
          ? `${companies.length} arbeidsgivere`
          : `${matches.length} av ${companies.length} arbeidsgivere`}
      </p>

      {matches.length > 0 ? (
        <ul className="search-results">
          {matches.map((company) => (
            <li key={company.slug}>
              <a href={`/firma/${company.slug}/`}>
                <span className="search-brand">{company.brands.join(' / ')}</span>
                <span className="search-controller">{company.controllerName}</span>
                <span className="search-arrow" aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="search-empty">Ingen treff på «{query.trim()}».</p>
      )}

      <div className="search-missing">
        <p className="search-missing-title">Finner du ikke arbeidsgiveren?</p>
        <p className="search-missing-text">Du kan fortsatt lage kravet — du må bare finne adressen selv.</p>
        <div className="search-missing-actions">
          <a className="button" href="/firma/annen/">
            Lag krav til en annen arbeidsgiver <span aria-hidden="true">→</span>
          </a>
          <a className="search-missing-add" href={buildAddCompanyHref(query)}>
            Be oss legge den til
          </a>
        </div>
      </div>
    </div>
  );
}

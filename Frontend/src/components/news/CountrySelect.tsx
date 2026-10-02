import type { NewsCountry } from '../../types/news';

interface CountrySelectProps {
  countries: NewsCountry[];
  value: string;
  onChange: (value: string) => void;
}

export function CountrySelect({ countries, value, onChange }: CountrySelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="shrink-0 font-semibold text-ink">Edition</span>
      <select
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="max-w-48 border border-line bg-white px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="Choose country edition"
      >
        <option value="">Worldwide</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>{country.name}</option>
        ))}
      </select>
    </label>
  );
}

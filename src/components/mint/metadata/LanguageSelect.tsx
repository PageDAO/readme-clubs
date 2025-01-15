import Select from 'react-select';
import ISO6391 from 'iso-639-1';

const LANGUAGE_OPTIONS = ISO6391.getAllCodes().map(code => ({
  value: code,
  label: `${ISO6391.getName(code)} (${ISO6391.getNativeName(code)})`
})).sort((a, b) => a.label.localeCompare(b.label));

export const LanguageSelect: React.FC<{
  value: string;
  onChange: (language: { code: string; name: string }) => void;
}> = ({ value, onChange }) => {
  return (
    <Select
      options={LANGUAGE_OPTIONS}
      value={LANGUAGE_OPTIONS.find(lang => lang.value === value)}
      onChange={(option) => onChange({
        code: option?.value || '',
        name: ISO6391.getName(option?.value || '')
      })}
      className="w-full"
      placeholder="Select language..."
    />
  );
};

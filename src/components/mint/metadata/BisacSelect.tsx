import Select from 'react-select';
import bisacData from 'subjects-utils/data/bisac.json';

// Transform the JSON data into the format React-Select expects
const BISAC_CODES = bisacData.map(code => ({
  value: code.label,
  label: code.label
}));

export const BisacSelect: React.FC<{
  values: string[];
  onChange: (codes: Array<{ code: string; description: string }>) => void;
}> = ({ values, onChange }) => {
  return (
    <Select
      isMulti
      options={BISAC_CODES}
      value={BISAC_CODES.filter(code => values.includes(code.value))}
      onChange={(options) => onChange(
        options.map(opt => ({
          code: opt.value,
          description: opt.label
        }))
      )}
      className="w-full"
      placeholder="Select BISAC codes..."
    />
  );
};

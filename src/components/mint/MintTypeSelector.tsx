export enum MintType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  TURBO = 'turbo'
}

const MintTypeSelector: React.FC<{
  selected: MintType;
  onSelect: (type: MintType) => void;
}> = ({ selected, onSelect }) => {
  return (
    <select 
      value={selected}
      onChange={(e) => onSelect(e.target.value as MintType)}
      className="form-select mt-1 block w-full"
    >
      <option value={MintType.PUBLIC}>Public Mint</option>
      <option value={MintType.PRIVATE}>Private Mint</option>
      <option value={MintType.TURBO}>Turbo Mint</option>
    </select>
  );
};

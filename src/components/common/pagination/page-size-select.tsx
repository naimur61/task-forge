interface PageSizeSelectProps {
  value: number;
  onChange: (size: number) => void;
  options?: number[];
  /** Total number of rows, shown as "of N". */
  total?: number;
}

/** "Rows per page" picker shown next to the pagination. */
export function PageSizeSelect({ value, onChange, options = [10, 20, 50], total }: PageSizeSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      Rows per page
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 rounded-md border border-border bg-card px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {total !== undefined && <span>of {total}</span>}
    </label>
  );
}

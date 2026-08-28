type ComparisonTableProps = {
  headers: string[];
  rows: { label: string; values: string[] }[];
  caption?: string;
  className?: string;
};

export default function ComparisonTable({ headers, rows, caption, className = '' }: ComparisonTableProps) {
  return (
    <div className={`table-wrap ${className}`}>
      <table className="comparison-table">
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            <th scope="col">项目</th>
            {headers.map((header) => <th scope="col" key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.values.map((value, index) => <td key={`${row.label}-${index}`}>{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

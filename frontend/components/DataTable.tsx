"use client";

interface DataTableProps {
  columns: string[];
  rows: Record<string, string | null | undefined>[];
  maxHeight?: string;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  rows,
  maxHeight,
  emptyMessage,
}: DataTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-sm text-ink-dim">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className="overflow-auto rounded-xl border border-border bg-surface"
      style={{ maxHeight }}
    >
      <table className="w-full min-w-max border-collapse font-mono text-xs">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="sticky left-0 z-20 border-b border-r border-border bg-canvas px-3 py-2.5 text-left font-medium text-ink-dim">
              #
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap border-b border-border bg-canvas px-3 py-2.5 text-left font-medium text-ink-muted"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="transition-colors odd:bg-surface even:bg-canvas/40 hover:bg-signal-amber/5"
            >
              <td className="sticky left-0 border-r border-b border-border bg-inherit px-3 py-2 text-ink-dim">
                {i + 1}
              </td>
              {columns.map((col) => {
                const value = row[col];
                return (
                  <td
                    key={col}
                    className="max-w-xs truncate border-b border-border px-3 py-2 text-ink"
                    title={value ?? ""}
                  >
                    {value === null || value === undefined || value === "" ? (
                      <span className="text-ink-dim">—</span>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

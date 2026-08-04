import clsx from 'clsx';

/*
|--------------------------------------------------------------------------
| Admin Table
|--------------------------------------------------------------------------
| Plain presentational table that matches the existing card/cream look.
| Used by every list page; each page supplies its own <thead> + row map.
|
| Props:
|   columns: [{ key, label, className, render? }]
|   rows:    array of records
|   keyFn:   (row) => string
|   empty:   string shown when rows is empty
|--------------------------------------------------------------------------
*/
export default function Table({ columns, rows, keyFn, empty = 'Nothing here yet.', className }) {
  return (
    <div className={clsx('card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-50 text-ink-700">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={clsx('text-left font-semibold px-4 py-3 whitespace-nowrap', c.className)}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-ink-500">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={keyFn ? keyFn(r) : i}
                  className="border-t border-cream-100 hover:bg-cream-50/60 transition"
                >
                  {columns.map((c) => (
                    <td key={c.key} className={clsx('px-4 py-3 align-middle', c.cellClassName)}>
                      {c.render ? c.render(r) : r[c.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

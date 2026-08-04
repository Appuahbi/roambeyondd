export default function EmptyChart({ message = 'No data yet.' }) {
  return (
    <div className="grid h-48 place-items-center rounded-xl bg-cream-50 text-sm text-ink-500">
      {message}
    </div>
  );
}

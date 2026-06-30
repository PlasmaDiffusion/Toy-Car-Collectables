export default function DbStatusBanner() {
  return (
    <div className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-amber-600 px-4 py-2 text-center text-xs font-semibold text-amber-950">
      <span aria-hidden>⚠️</span>
      Database is currently down — showing local backup data. Listings may be
      out of date.
    </div>
  );
}

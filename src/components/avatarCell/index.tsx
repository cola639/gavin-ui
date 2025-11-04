// helpers (same file or a tiny utils.ts)
const isNonEmpty = (v?: string | null) => typeof v === 'string' && v.trim().length > 0;

const initialsFromName = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('') || 'U';

/** Avatar cell: image if present, else initials */
const AvatarCell: React.FC<{ src?: string | null; name: string }> = ({ src, name }) => {
  const hasImg = isNonEmpty(src);
  const initials = initialsFromName(name);

  return hasImg ? (
    <img src={src as string} alt={`${name} avatar`} className="h-10 w-10 rounded-full object-cover shadow" />
  ) : (
    <div
      aria-label={`${name} initials`}
      className="h-10 w-10 rounded-full grid place-items-center shadow
                 text-[0.8rem] font-semibold tracking-wide
                 bg-[color:var(--primary)] text-slate-900"
    >
      {initials}
    </div>
  );
};

export default AvatarCell;

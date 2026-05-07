const COLORS = ['#0F6CBD', '#7C3AED', '#059669', '#D97706', '#DB2777', '#0891B2'];

const Avatar = ({ name = '?', size = 'sm' }) => {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';

  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 select-none`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;

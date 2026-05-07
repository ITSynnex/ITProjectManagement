const Badge = ({ label, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {label}
  </span>
);

export default Badge;

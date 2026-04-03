return (
  <a
    href={href || '#'}
    onClick={onClose}
    className="block text-4xl text-white italic hover:text-gold transition-colors"
  >
    {label}
  </a>
);
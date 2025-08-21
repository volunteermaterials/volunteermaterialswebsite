export function Button({ children, className = '', variant = 'solid', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2';
  const solid = 'bg-[var(--color-primary)] text-white hover:opacity-90 focus:ring-[var(--color-primary)]';
  const outline = 'border border-white text-white hover:bg-white hover:text-black';
  const link = 'text-[var(--color-primary)] hover:underline p-0';
  const styles = variant === 'outline' ? outline : variant === 'link' ? link : solid;
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

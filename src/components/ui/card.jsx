export function Card({ className = '', children, ...props }) {
  return <div className={`rounded-2xl bg-white shadow border border-gray-100 ${className}`} {...props}>{children}</div>;
}
export function CardContent({ className = '', children, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export default function Container({ children, className = "" }) {
  return <div className={`container-shell ${className}`}>{children}</div>;
}

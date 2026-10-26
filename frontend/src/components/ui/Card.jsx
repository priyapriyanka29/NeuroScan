/** Surface primitives shared by every page. */

export function Card({ children, className = "", ...rest }) {
  return (
    <section className={`card ${className}`} {...rest}>
      {children}
    </section>
  );
}

export function CardHeader({ icon, title, subtitle, actions }) {
  return (
    <div className="card-header">
      <div className="min-w-0">
        <h2 className="card-title">
          {icon}
          <span className="truncate">{title}</span>
        </h2>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={`card-footer ${className}`}>{children}</div>;
}

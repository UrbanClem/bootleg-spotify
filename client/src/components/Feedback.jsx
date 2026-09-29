import { WarningIcon, CheckIcon, InfoIcon } from './icons';

export function Alert({ variant = 'error', children, onDismiss }) {
  const Icon =
    variant === 'success' ? CheckIcon : variant === 'info' ? InfoIcon : WarningIcon;
  return (
    <div className={`alert alert--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon size={18} />
      <span style={{ flex: 1 }}>{children}</span>
      {onDismiss && (
        <button
          type="button"
          className="toggle-btn"
          style={{ width: 24, height: 24 }}
          onClick={onDismiss}
          aria-label="Cerrar aviso"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function Spinner({ small = false, center = false }) {
  if (center) {
    return (
      <div className="spinner spinner--center">
        <span className="spinner" role="status" aria-label="Cargando" />
      </div>
    );
  }
  return (
    <span
      className={`spinner${small ? ' spinner--sm' : ''}`}
      role="status"
      aria-label="Cargando"
    />
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="empty">
      {Icon && (
        <div className="empty-icon">
          <Icon size={28} />
        </div>
      )}
      <h3 className="empty-title">{title}</h3>
      {children && <p className="empty-text">{children}</p>}
      {action}
    </div>
  );
}

/** Placeholder grid shown while a shelf is loading. */
export function CardSkeleton({ count = 6 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" style={{ aspectRatio: '1 / 1.55' }} />
      ))}
    </div>
  );
}

/**
 * BADGE & STATUS COMPONENTS
 */

export function Badge({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  const classes = [
    'badge',
    variant !== 'default' && `badge-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

/**
 * STATUS BADGE
 */

export function StatusBadge({
  status,
  label,
  icon: Icon,
  className = '',
  ...props
}) {
  const statusLabel = label || (typeof status === 'string' ? status : '');
  const statusClass = typeof status === 'string' ? status : status?.toLowerCase?.() || '';
  const classes = [
    'status-badge',
    `status-${statusClass}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {Icon && <Icon />}
      {statusLabel}
    </span>
  );
}

/**
 * ALERT COMPONENT
 */

export function Alert({
  children,
  variant = 'info',
  title,
  icon: Icon,
  onClose,
  className = '',
  ...props
}) {
  const classes = [
    'alert',
    `alert-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="alert" {...props}>
      {Icon && <Icon />}
      <div>
        {title && <h4>{title}</h4>}
        {typeof children === 'string' ? <p>{children}</p> : children}
      </div>
      {onClose && (
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}

/**
 * TOAST NOTIFICATION COMPONENT
 */

export function Toast({
  message,
  variant = 'success',
  icon: Icon,
  className = '',
  ...props
}) {
  const classes = [
    'toast',
    `toast-${variant}`,
    className
  ].filter(Boolean).join(' ');

  const defaultIcons = {
    success: 'check_circle',
    danger: 'error',
    warning: 'warning',
    info: 'info'
  };

  return (
    <div className={classes} role="status" aria-live="polite" {...props}>
      {Icon ? (
        <Icon />
      ) : (
        <span className="material-symbols-outlined">{defaultIcons[variant]}</span>
      )}
      <span>{message}</span>
    </div>
  );
}

/**
 * SPINNER / LOADING INDICATOR
 */

export function Spinner({
  size = 'md',
  className = '',
  ...props
}) {
  const sizeClass = size !== 'md' ? `spinner-${size}` : '';
  const classes = ['spinner', sizeClass, className].filter(Boolean).join(' ');

  return <div className={classes} {...props} />;
}

/**
 * LOADING STATE
 */

export function LoadingState({
  isLoading,
  children,
  fallback = <Spinner size="lg" />,
}) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        {fallback}
      </div>
    );
  }

  return children;
}

/**
 * EMPTY STATE
 */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  ...props
}) {
  return (
    <div
      className={`empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-3xl)',
        textAlign: 'center',
        minHeight: '300px'
      }}
      {...props}
    >
      {Icon && (
        <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-lg)', opacity: '0.6' }}>
          <Icon />
        </div>
      )}
      {title && <h3>{title}</h3>}
      {description && <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>{description}</p>}
      {action && <div style={{ marginTop: 'var(--spacing-lg)' }}>{action}</div>}
    </div>
  );
}

/**
 * SKELETON LOADER
 */

export function SkeletonCard({
  count = 1,
  className = '',
  ...props
}) {
  return (
    <div {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" style={{ marginBottom: 'var(--spacing-md)' }} />
      ))}
    </div>
  );
}

/**
 * ERROR BOUNDARY
 */

export function ErrorBoundary({
  children,
  onError,
  fallback = <Alert variant="danger" title="Something went wrong">Please try again or contact support.</Alert>
}) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <div>{fallback}</div>;
  }

  try {
    return children;
  } catch (error) {
    if (onError) onError(error);
    return <div>{fallback}</div>;
  }
}

/**
 * BUTTON COMPONENT
 * Flexible button component with multiple variants and sizes
 */

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon = null,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="spinner spinner-sm" aria-hidden="true" />}
      {Icon && iconPosition === 'left' && <Icon />}
      {children}
      {Icon && iconPosition === 'right' && <Icon />}
    </button>
  );
}

/**
 * LINK BUTTON - Styled as button but acts as link
 */

export function LinkButton({
  children,
  to,
  variant = 'primary',
  size = 'md',
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <a href={to} className={classes} {...props}>
      {Icon && iconPosition === 'left' && <Icon />}
      {children}
      {Icon && iconPosition === 'right' && <Icon />}
    </a>
  );
}

/**
 * ICON BUTTON
 */

export function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    'btn-icon',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      aria-label={label}
      title={label}
      {...props}
    >
      {isLoading ? (
        <span className="spinner spinner-sm" aria-hidden="true" />
      ) : (
        Icon && <Icon />
      )}
    </button>
  );
}

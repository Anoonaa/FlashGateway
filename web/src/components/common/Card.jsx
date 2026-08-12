/**
 * CARD & CONTAINER COMPONENTS
 */

export function Card({
  children,
  elevated = false,
  className = '',
  ...props
}) {
  const classes = [
    'card',
    elevated && 'card-elevated',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

/**
 * CARD HEADER
 */

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  ...props
}) {
  if (children) {
    return <div className="card-header" {...props}>{children}</div>;
  }

  return (
    <div className="card-header" {...props}>
      <div>
        {title && <h3>{title}</h3>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * CARD FOOTER
 */

export function CardFooter({
  children,
  align = 'flex-end',
  ...props
}) {
  return (
    <div className="card-footer" style={{ justifyContent: align }} {...props}>
      {children}
    </div>
  );
}

/**
 * GRID CONTAINER
 */

export function Grid({
  children,
  columns = 12,
  gap = 'md',
  className = '',
  responsive = true,
  ...props
}) {
  const gridClass = responsive ? `grid grid-${Math.min(columns, 4)}` : 'grid';
  const gapClass = `gap-${gap}`;
  const classes = [gridClass, gapClass, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

/**
 * CONTAINER - Max-width wrapper
 */

export function Container({
  children,
  maxWidth = 'full',
  className = '',
  ...props
}) {
  const maxWidthMap = {
    sm: 'max-width: 640px',
    md: 'max-width: 768px',
    lg: 'max-width: 1024px',
    xl: 'max-width: 1280px',
    full: 'max-width: 100%'
  };

  return (
    <div
      className={`container ${className}`}
      style={{ ...{ margin: '0 auto' }, ...(maxWidthMap[maxWidth] && { maxWidth: maxWidthMap[maxWidth] }) }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * SECTION - Page section wrapper
 */

export function Section({
  children,
  title,
  subtitle,
  className = '',
  ...props
}) {
  return (
    <section className={`section ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="section-header">
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * FLEX CONTAINER
 */

export function Flex({
  children,
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  gap = 'md',
  wrap = false,
  className = '',
  ...props
}) {
  const classes = [
    'flex',
    direction !== 'row' && `flex-${direction}`,
    gap !== 'md' && `gap-${gap}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{
        justifyContent: justify,
        alignItems: align,
        flexWrap: wrap ? 'wrap' : 'nowrap'
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * STACK - Vertical or horizontal spacing wrapper
 */

export function Stack({
  children,
  direction = 'vertical',
  spacing = 'md',
  className = '',
  ...props
}) {
  const spaceClass = `gap-${spacing}`;
  const directionClass = direction === 'vertical' ? 'flex-col' : 'flex-row';
  const classes = [
    'flex',
    directionClass,
    spaceClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

/**
 * INPUT COMPONENTS
 * Text input, email, password, number, textarea with validation
 */

export function Input({
  label,
  hint,
  error,
  icon: Icon = null,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = props.id || `input-${Math.random()}`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      {Icon ? (
        <div className="input-wrapper">
          <span className="input-icon" aria-hidden="true">
            <Icon />
          </span>
          <input
            id={inputId}
            className={className}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
      ) : (
        <input
          id={inputId}
          className={className}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      )}

      {error && (
        <div id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}

      {hint && !error && (
        <div id={`${inputId}-hint`} className="form-hint">
          {hint}
        </div>
      )}
    </div>
  );
}

/**
 * TEXTAREA COMPONENT
 */

export function Textarea({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) {
  const textareaId = props.id || `textarea-${Math.random()}`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={textareaId}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        className={className}
        disabled={disabled}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
        {...props}
      />

      {error && (
        <div id={`${textareaId}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}

      {hint && !error && (
        <div id={`${textareaId}-hint`} className="form-hint">
          {hint}
        </div>
      )}
    </div>
  );
}

/**
 * SELECT COMPONENT
 */

export function Select({
  label,
  hint,
  error,
  options = [],
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) {
  const selectId = props.id || `select-${Math.random()}`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        className={className}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option
            key={typeof option === 'string' ? option : option.value}
            value={typeof option === 'string' ? option : option.value}
          >
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>

      {error && (
        <div id={`${selectId}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}

      {hint && !error && (
        <div id={`${selectId}-hint`} className="form-hint">
          {hint}
        </div>
      )}
    </div>
  );
}

/**
 * CHECKBOX COMPONENT
 */

export function Checkbox({
  label,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  const checkboxId = props.id || `checkbox-${Math.random()}`;

  return (
    <div className="form-group">
      <div className="checkbox-item">
        <input
          id={checkboxId}
          type="checkbox"
          className={className}
          disabled={disabled}
          aria-invalid={!!error}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId}>
            {label}
          </label>
        )}
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * RADIO BUTTON COMPONENT
 */

export function Radio({
  label,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  const radioId = props.id || `radio-${Math.random()}`;

  return (
    <div className="form-group">
      <div className="radio-item">
        <input
          id={radioId}
          type="radio"
          className={className}
          disabled={disabled}
          aria-invalid={!!error}
          {...props}
        />
        {label && (
          <label htmlFor={radioId}>
            {label}
          </label>
        )}
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * FORM GROUP - Container for related form fields
 */

export function FormGroup({
  children,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`} {...props}>
      {children}
    </div>
  );
}

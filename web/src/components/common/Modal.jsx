/**
 * MODAL/DIALOG COMPONENT
 */

import React from 'react';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
  closeOnBackdrop = true,
  ...props
}) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px'
  };

  return (
    <div className="modal-backdrop" onClick={closeOnBackdrop ? onClose : undefined} style={{ zIndex: 'var(--z-modal)' }}>
      <div
        className={`modal ${className}`}
        style={{
          maxWidth: sizeMap[size],
          zIndex: 'var(--z-modal-overlay)'
        }}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <div className="modal-header">
          {title && <h2>{title}</h2>}
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * MODAL STYLES (add to CSS file)
 */

const modalStyles = `
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
  animation: fadeIn 0.3s ease-out;
}

.modal {
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-subtle);

  h2 {
    margin: 0;
  }
}

.modal-content {
  padding: var(--spacing-lg);
}

.modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}
`;

/**
 * DROPDOWN MENU
 */

export function Dropdown({
  trigger,
  children,
  align = 'left',
  className = '',
  ...props
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`dropdown ${className}`} ref={menuRef} {...props}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className={`dropdown-menu dropdown-${align}`}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * DROPDOWN ITEM
 */

export function DropdownItem({
  children,
  onClick,
  icon: Icon,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`dropdown-item ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon />}
      {children}
    </button>
  );
}

/**
 * TABS COMPONENT
 */

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  ...props
}) {
  return (
    <div className={`tabs ${className}`} {...props}>
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => onTabChange?.(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

/**
 * TAB STYLES
 */

const tabStyles = `
.tabs {
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--color-border-subtle);
  background-color: var(--color-surface-container-low);
}

.tab {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  position: relative;

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-state-hover);
  }

  &.tab-active {
    color: var(--color-secondary);

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--color-secondary);
    }
  }
}

.tabs-content {
  padding: var(--spacing-lg);
}
`;

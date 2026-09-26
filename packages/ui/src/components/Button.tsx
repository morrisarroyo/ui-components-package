import type { ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps {
  /** Visual weight. `primary` is the main action on a screen; everything else is `secondary`. */
  variant?: ButtonVariant;
  /** Control height and padding. */
  size?: ButtonSize;
  /** Show a spinner in place of the label and make the button non-interactive. */
  loading?: boolean;
  /** Make the button non-interactive and render it in the disabled palette. */
  disabled?: boolean;
  /** Called on click. Not called while the button is loading or disabled. */
  onClick?: () => void;
  /** The button label. */
  children: ReactNode;
  /** Native button behaviour. Defaults to `button` so it never submits a form by accident. */
  type?: 'button' | 'submit' | 'reset';
  /** Accessible name, when the label alone is not descriptive enough. */
  'aria-label'?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  // A loading button is genuinely disabled, not just styled as unavailable,
  // so it cannot be clicked or activated from the keyboard.
  const isInteractive = !loading && !disabled;

  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[variant],
        styles[size],
        loading ? styles.loading : '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={!isInteractive}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={isInteractive ? onClick : undefined}
    >
      <span className={loading ? styles.hiddenLabel : undefined}>{children}</span>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    </button>
  );
}

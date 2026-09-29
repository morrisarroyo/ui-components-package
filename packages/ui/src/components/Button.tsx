import type { MouseEvent, ReactNode } from 'react';
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
  // `disabled` is native: the button leaves the tab order entirely. A loading
  // button stays focusable (aria-disabled) so a keyboard user who pressed it
  // keeps their place, but it ignores every activation, including submitting
  // its form, until loading ends.
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.();
  }

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
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={disabled ? undefined : handleClick}
    >
      <span className={loading ? styles.hiddenLabel : undefined}>{children}</span>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    </button>
  );
}

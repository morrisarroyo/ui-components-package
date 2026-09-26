import { useId } from 'react';
import styles from './TextField.module.css';

export interface TextFieldProps {
  /** Visible label, rendered above the input and associated with it. Always required. */
  label: string;
  /** Current value. The field is controlled. */
  value: string;
  /** Called with the new value on every keystroke. */
  onChange: (value: string) => void;
  /** Short example of the expected input. Not a substitute for the label. */
  placeholder?: string;
  /** Hint below the input. Hidden while an error message is showing. */
  helperText?: string;
  /** Error to show below the input. A non-empty string puts the field in its error state. */
  errorMessage?: string;
  /** Make the input non-interactive and render it in the disabled palette. */
  disabled?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  errorMessage,
  disabled = false,
}: TextFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;

  // The field is in its error state only when a non-empty message is given;
  // the error then replaces the helper text rather than stacking under it.
  const hasError = Boolean(errorMessage);
  const message = hasError ? errorMessage : helperText;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={[styles.input, hasError ? styles.inputError : '']
          .filter(Boolean)
          .join(' ')}
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={message ? messageId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {message ? (
        <span
          id={messageId}
          className={hasError ? styles.error : styles.helper}
          role={hasError ? 'alert' : undefined}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}

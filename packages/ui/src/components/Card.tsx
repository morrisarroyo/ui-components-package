import { useId } from 'react';
import type { ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /** Heading shown at the top of the card. Omit for an untitled container. */
  title?: string;
  /** Controls shown right-aligned on the title row, typically Buttons. */
  actions?: ReactNode;
  /** The card body. */
  children: ReactNode;
}

export function Card({ title, actions, children }: CardProps) {
  const hasHeader = Boolean(title) || Boolean(actions);
  // A titled card is a named region, so screen-reader users can jump to it.
  const titleId = useId();

  return (
    <section className={styles.card} aria-labelledby={title ? titleId : undefined}>
      {hasHeader ? (
        <div className={styles.header}>
          {title ? (
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          ) : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

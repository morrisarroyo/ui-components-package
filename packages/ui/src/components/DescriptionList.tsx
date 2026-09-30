import type { ReactNode } from 'react';
import styles from './DescriptionList.module.css';

/** Shown in place of a value that is missing. */
const EMPTY_VALUE = '—';
/** Read out in place of the dash, which screen readers announce as "em dash" or skip. */
const EMPTY_VALUE_SPOKEN = 'Not provided';

export interface DescriptionListItem {
  /** Row label, shown in the fixed-width left column. */
  label: string;
  /** Row value. Empty, null and undefined all render as an em dash. */
  value: ReactNode;
}

export interface DescriptionListProps {
  /** The label/value pairs, one row each, in display order. */
  items: DescriptionListItem[];
}

function isEmpty(value: ReactNode): boolean {
  return value === null || value === undefined || value === '';
}

export function DescriptionList({ items }: DescriptionListProps) {
  return (
    <dl className={styles.list}>
      {items.map((item) => {
        const empty = isEmpty(item.value);
        return (
          <div key={item.label} className={styles.row}>
            <dt className={styles.label}>{item.label}</dt>
            <dd
              className={[styles.value, empty ? styles.emptyValue : '']
                .filter(Boolean)
                .join(' ')}
            >
              {empty ? (
                <>
                  <span aria-hidden="true">{EMPTY_VALUE}</span>
                  <span className={styles.visuallyHidden}>{EMPTY_VALUE_SPOKEN}</span>
                </>
              ) : (
                item.value
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

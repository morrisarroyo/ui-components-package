import type { ReactNode } from 'react';
import styles from './Table.module.css';

export interface TableColumn {
  /** Key looked up on each row to find the cell value. */
  key: string;
  /** Column heading text. */
  header: string;
}

export type TableRow = Record<string, ReactNode>;

export interface TableProps {
  /** Column definitions, in display order. */
  columns: TableColumn[];
  /** One entry per record. Each cell is looked up by its column `key`. */
  rows: TableRow[];
  /** Makes rows clickable (mouse and keyboard) and called with the clicked row. */
  onRowClick?: (row: TableRow) => void;
  /** Shown in place of the body when `rows` is empty. */
  emptyMessage?: string;
}

export function Table({
  columns,
  rows,
  onRowClick,
  emptyMessage = 'No results',
}: TableProps) {
  const isClickable = Boolean(onRowClick);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col" className={styles.headerCell}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td className={styles.empty} colSpan={Math.max(columns.length, 1)}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, rowIndex) => (
            <tr
              // Rows carry no guaranteed identity, so position is the key.
              key={rowIndex}
              className={isClickable ? styles.clickableRow : undefined}
              // The whole row is clickable with a mouse. A click on the first
              // cell's button bubbles here too, so every activation, by mouse,
              // Enter or Space, reaches onRowClick exactly once.
              onClick={isClickable ? () => onRowClick?.(row) : undefined}
            >
              {columns.map((column, columnIndex) => (
                <td key={column.key} className={styles.cell}>
                  {isClickable && columnIndex === 0 ? (
                    // A real button, named by the cell, so the row is reachable
                    // with Tab and announced as actionable, while the row keeps
                    // its native role and the table stays navigable (D-15).
                    <button type="button" className={styles.rowButton}>
                      {row[column.key]}
                    </button>
                  ) : (
                    row[column.key]
                  )}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

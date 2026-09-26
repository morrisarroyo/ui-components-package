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
              // A clickable row has to be reachable and activatable from the
              // keyboard, not just the mouse. It keeps its native row role:
              // role="button" would hide its cells from table navigation.
              tabIndex={isClickable ? 0 : undefined}
              onClick={isClickable ? () => onRowClick?.(row) : undefined}
              onKeyDown={
                isClickable
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onRowClick?.(row);
                      }
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <td key={column.key} className={styles.cell}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

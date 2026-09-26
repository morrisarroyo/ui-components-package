import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from './Table';

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'phone', header: 'Phone' },
];

const rows = [
  { id: 'p1', name: 'Ada Lovelace', phone: '555-0101' },
  { id: 'p2', name: 'Alan Turing', phone: '555-0102' },
];

describe('Table', () => {
  it('renders a header per column and a cell per column for each row', () => {
    render(<Table columns={columns} rows={rows} />);

    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['Name', 'Phone']);
    const bodyRows = screen.getAllByRole('row').slice(1);
    expect(bodyRows).toHaveLength(2);
    expect(within(bodyRows[0]).getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
      'Ada Lovelace',
      '555-0101',
    ]);
  });

  it('shows "No results" when there are no rows', () => {
    render(<Table columns={columns} rows={[]} />);

    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('shows the given emptyMessage when there are no rows', () => {
    render(<Table columns={columns} rows={[]} emptyMessage="No patients match your search" />);

    expect(screen.getByText('No patients match your search')).toBeInTheDocument();
    expect(screen.queryByText('No results')).not.toBeInTheDocument();
  });

  it('calls onRowClick with the clicked row', async () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} rows={rows} onRowClick={onRowClick} />);

    await userEvent.click(screen.getByText('Alan Turing'));

    expect(onRowClick).toHaveBeenCalledWith(rows[1]);
  });

  it('lets a clickable row be reached with Tab and activated with Enter', async () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} rows={rows} onRowClick={onRowClick} />);

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(rows[1]);
  });

  it('activates a focused row with Space', async () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} rows={rows} onRowClick={onRowClick} />);

    await userEvent.tab();
    await userEvent.keyboard(' ');

    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('keeps rows out of the tab order when they are not clickable', async () => {
    render(<Table columns={columns} rows={rows} />);

    await userEvent.tab();

    expect(document.body).toHaveFocus();
  });

  it('keeps table semantics on clickable rows', () => {
    render(<Table columns={columns} rows={rows} onRowClick={() => {}} />);

    // Every body row is still a row of cells, so a screen reader can still
    // navigate the table by row and column.
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getAllByRole('cell')).toHaveLength(4);
  });
});

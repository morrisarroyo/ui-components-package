import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';
import { Button } from './Button';

describe('Card', () => {
  it('renders its title as a heading above the body', () => {
    render(<Card title="Demographics">Body</Card>);

    expect(screen.getByRole('heading', { name: 'Demographics' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders actions without a title', () => {
    render(<Card actions={<Button>Edit</Button>}>Body</Card>);

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders the title and the actions together', () => {
    render(
      <Card title="Demographics" actions={<Button>Edit</Button>}>
        Body
      </Card>,
    );

    expect(screen.getByRole('heading', { name: 'Demographics' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('omits the header row entirely when there is no title and no actions', () => {
    const { container } = render(<Card>Body</Card>);

    // The card's only child is the body text: no empty header row is left
    // behind to add stray spacing above it.
    expect(container.firstElementChild?.childNodes).toHaveLength(1);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
  it('renders its children', () => {
    render(
      <Card title="Demographics">
        <p>Born in London</p>
      </Card>,
    );

    expect(screen.getByText('Born in London')).toBeInTheDocument();
  });

  it('uses a level-two heading for the title', () => {
    render(<Card title="Demographics">Body</Card>);

    expect(screen.getByRole('heading', { level: 2, name: 'Demographics' })).toBeInTheDocument();
  });

  it('keeps its actions interactive', async () => {
    const onEdit = vi.fn();
    render(
      <Card title="Demographics" actions={<button onClick={onEdit}>Edit</button>}>
        Body
      </Card>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

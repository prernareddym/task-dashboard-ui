import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeTask } from '../test/utils';
import TaskForm from './TaskForm';

describe('TaskForm', () => {
  it('requires a title', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values with defaults', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await userEvent.type(screen.getByLabelText('Title'), '  Ship it  ');
    await userEvent.selectOptions(screen.getByLabelText('Priority'), 'HIGH');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Ship it', description: null, status: 'TODO', priority: 'HIGH', dueDate: null });
  });

  it('pre-fills the form when editing', () => {
    render(<TaskForm task={makeTask({ title: 'Existing', status: 'DONE', dueDate: '2026-12-31' })} onSubmit={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Edit task' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Existing');
    expect(screen.getByLabelText('Status')).toHaveValue('DONE');
    expect(screen.getByLabelText('Due date')).toHaveValue('2026-12-31');
  });

  it('calls onCancel', async () => {
    const onCancel = jest.fn();
    render(<TaskForm onSubmit={jest.fn()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });
});

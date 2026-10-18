import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '../api/client';
import { makeTask, renderWithStore, signedInState } from '../test/utils';
import Dashboard from './Dashboard';

jest.mock('../api/client', () => ({
  api: { listTasks: jest.fn(), summary: jest.fn(), createTask: jest.fn(), updateTask: jest.fn(), deleteTask: jest.fn() },
}));
const mockedApi = api as jest.Mocked<typeof api>;

const page = (tasks = [makeTask()], totalPages = 1) => ({
  content: tasks,
  totalElements: tasks.length,
  totalPages,
  number: 0,
  size: 8,
});

beforeEach(() => {
  jest.resetAllMocks();
  mockedApi.listTasks.mockResolvedValue(page([makeTask({ id: 1, title: 'Write tests' }), makeTask({ id: 2, title: 'Deploy', status: 'DONE', priority: 'HIGH' })]));
  mockedApi.summary.mockResolvedValue({ todo: 1, inProgress: 0, done: 1, total: 2 });
});

describe('Dashboard', () => {
  it('shows the summary and the tasks from the API', async () => {
    renderWithStore(<Dashboard />, signedInState);

    expect(await screen.findByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('stat-total')).toHaveTextContent('2'));
    expect(screen.getByTestId('stat-done')).toHaveTextContent('1');
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('shows an empty state', async () => {
    mockedApi.listTasks.mockResolvedValue(page([]));
    renderWithStore(<Dashboard />, signedInState);

    expect(await screen.findByText(/No tasks match/)).toBeInTheDocument();
  });

  it('re-queries the API when a status filter is chosen', async () => {
    renderWithStore(<Dashboard />, signedInState);
    await screen.findByText('Write tests');

    await userEvent.selectOptions(screen.getByLabelText('Filter by status'), 'DONE');

    await waitFor(() =>
      expect(mockedApi.listTasks).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'DONE', page: 0 })),
    );
  });

  it('debounces the title search', async () => {
    renderWithStore(<Dashboard />, signedInState);
    await screen.findByText('Write tests');
    const callsBefore = mockedApi.listTasks.mock.calls.length;

    await userEvent.type(screen.getByLabelText('Search tasks'), 'dep');

    await waitFor(() => expect(mockedApi.listTasks).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'dep' })));
    // typing three characters caused one extra request, not three
    expect(mockedApi.listTasks.mock.calls.length).toBe(callsBefore + 1);
  });

  it('creates a task through the form and refreshes', async () => {
    mockedApi.createTask.mockResolvedValue(makeTask({ id: 3, title: 'New one' }));
    renderWithStore(<Dashboard />, signedInState);
    await screen.findByText('Write tests');

    await userEvent.click(screen.getByRole('button', { name: 'New task' }));
    await userEvent.type(within(screen.getByRole('dialog')).getByLabelText('Title'), 'New one');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mockedApi.createTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'New one' })));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mockedApi.listTasks.mock.calls.length).toBeGreaterThan(1);
  });

  it('changes a task status from the list', async () => {
    mockedApi.updateTask.mockResolvedValue(makeTask({ id: 1, status: 'IN_PROGRESS' }));
    renderWithStore(<Dashboard />, signedInState);
    await screen.findByText('Write tests');

    await userEvent.selectOptions(screen.getByLabelText('Status of Write tests'), 'IN_PROGRESS');

    await waitFor(() =>
      expect(mockedApi.updateTask).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Write tests', status: 'IN_PROGRESS' })),
    );
  });

  it('deletes only after confirmation', async () => {
    mockedApi.deleteTask.mockResolvedValue(undefined);
    const confirm = jest.spyOn(window, 'confirm');
    renderWithStore(<Dashboard />, signedInState);
    await screen.findByText('Write tests');

    confirm.mockReturnValueOnce(false);
    await userEvent.click(screen.getByRole('button', { name: 'Delete Write tests' }));
    expect(mockedApi.deleteTask).not.toHaveBeenCalled();

    confirm.mockReturnValueOnce(true);
    await userEvent.click(screen.getByRole('button', { name: 'Delete Write tests' }));
    await waitFor(() => expect(mockedApi.deleteTask).toHaveBeenCalledWith(1));
    confirm.mockRestore();
  });

  it('pages through results', async () => {
    mockedApi.listTasks.mockResolvedValue(page([makeTask()], 3));
    renderWithStore(<Dashboard />, signedInState);
    await screen.findByText('Page 1 of 3');

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(mockedApi.listTasks).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 })));
  });

  it('shows an error banner if loading fails', async () => {
    mockedApi.listTasks.mockRejectedValue(new Error('Service unavailable'));
    renderWithStore(<Dashboard />, signedInState);

    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
  });

  it('signs out', async () => {
    const { store } = renderWithStore(<Dashboard />, signedInState);
    await screen.findByText('Write tests');

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(store.getState().auth.token).toBeNull();
  });
});

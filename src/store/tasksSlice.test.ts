import { api } from '../api/client';
import { makeTask } from '../test/utils';
import { createStore } from './index';
import { fetchSummary, fetchTasks, initialFilters, PAGE_SIZE, removeTask, setFilters, setPage } from './tasksSlice';

jest.mock('../api/client', () => ({
  api: { listTasks: jest.fn(), summary: jest.fn(), createTask: jest.fn(), updateTask: jest.fn(), deleteTask: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.resetAllMocks());

describe('tasksSlice', () => {
  it('translates filters into API query params', async () => {
    mockedApi.listTasks.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: PAGE_SIZE });
    const store = createStore();

    await store.dispatch(fetchTasks({ status: 'DONE', priority: '', q: '  fix ', page: 1 }));

    expect(mockedApi.listTasks).toHaveBeenCalledWith({ status: 'DONE', priority: undefined, q: 'fix', page: 1, size: PAGE_SIZE });
  });

  it('stores fetched tasks and paging info', async () => {
    mockedApi.listTasks.mockResolvedValue({ content: [makeTask()], totalElements: 9, totalPages: 2, number: 0, size: PAGE_SIZE });
    const store = createStore();

    await store.dispatch(fetchTasks(initialFilters));

    expect(store.getState().tasks).toMatchObject({ totalElements: 9, totalPages: 2, status: 'idle' });
    expect(store.getState().tasks.items).toHaveLength(1);
  });

  it('keeps an error message when loading fails', async () => {
    mockedApi.listTasks.mockRejectedValue(new Error('boom'));
    const store = createStore();

    await store.dispatch(fetchTasks(initialFilters));

    expect(store.getState().tasks).toMatchObject({ status: 'failed', error: 'boom' });
  });

  it('resets to the first page whenever a filter changes', () => {
    const store = createStore();
    store.dispatch(setPage(3));
    expect(store.getState().tasks.filters.page).toBe(3);

    store.dispatch(setFilters({ status: 'TODO' }));

    expect(store.getState().tasks.filters).toMatchObject({ status: 'TODO', page: 0 });
  });

  it('stores the summary', async () => {
    mockedApi.summary.mockResolvedValue({ todo: 1, inProgress: 2, done: 3, total: 6 });
    const store = createStore();

    await store.dispatch(fetchSummary());

    expect(store.getState().tasks.summary?.total).toBe(6);
  });

  it('surfaces delete failures', async () => {
    mockedApi.deleteTask.mockRejectedValue(new Error('Task 1 not found'));
    const store = createStore();

    await store.dispatch(removeTask(1));

    expect(store.getState().tasks.error).toBe('Task 1 not found');
  });
});

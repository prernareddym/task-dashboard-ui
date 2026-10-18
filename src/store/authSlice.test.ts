import { api } from '../api/client';
import { createStore } from './index';
import { login, logout, register } from './authSlice';

jest.mock('../api/client', () => ({ api: { login: jest.fn(), register: jest.fn() } }));

const mockedApi = api as jest.Mocked<typeof api>;
const response = { accessToken: 'jwt', tokenType: 'Bearer', expiresInSeconds: 60, email: 'ada@example.com', displayName: 'Ada' };

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

describe('authSlice', () => {
  it('stores the session on successful login', async () => {
    mockedApi.login.mockResolvedValue(response);
    const store = createStore();

    await store.dispatch(login({ email: 'ada@example.com', password: 'pw' }));

    expect(store.getState().auth).toMatchObject({ token: 'jwt', email: 'ada@example.com', displayName: 'Ada', status: 'idle' });
    expect(JSON.parse(localStorage.getItem('task-dashboard.session')!).token).toBe('jwt');
  });

  it('records the error message when login fails', async () => {
    mockedApi.login.mockRejectedValue(new Error('Invalid email or password'));
    const store = createStore();

    await store.dispatch(login({ email: 'ada@example.com', password: 'nope' }));

    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.status).toBe('failed');
    expect(store.getState().auth.error).toBe('Invalid email or password');
  });

  it('registers and signs in', async () => {
    mockedApi.register.mockResolvedValue(response);
    const store = createStore();

    await store.dispatch(register({ email: 'ada@example.com', password: 'longenough', displayName: 'Ada' }));

    expect(store.getState().auth.token).toBe('jwt');
  });

  it('clears state and storage on logout', async () => {
    mockedApi.login.mockResolvedValue(response);
    const store = createStore();
    await store.dispatch(login({ email: 'a@b.co', password: 'pw' }));

    store.dispatch(logout());

    expect(store.getState().auth.token).toBeNull();
    expect(localStorage.getItem('task-dashboard.session')).toBeNull();
  });
});

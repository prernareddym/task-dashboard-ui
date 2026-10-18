import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '../api/client';
import { renderWithStore } from '../test/utils';
import AuthPage from './AuthPage';

jest.mock('../api/client', () => ({ api: { login: jest.fn(), register: jest.fn() } }));
const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

describe('AuthPage', () => {
  it('submits credentials to login', async () => {
    mockedApi.login.mockResolvedValue({ accessToken: 'jwt', tokenType: 'Bearer', expiresInSeconds: 60, email: 'ada@example.com', displayName: 'Ada' });
    const { store } = renderWithStore(<AuthPage />);

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(store.getState().auth.token).toBe('jwt'));
    expect(mockedApi.login).toHaveBeenCalledWith('ada@example.com', 'secret-pass');
  });

  it('shows the server error when login fails', async () => {
    mockedApi.login.mockRejectedValue(new Error('Invalid email or password'));
    renderWithStore(<AuthPage />);

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('switches to registration and asks for a display name', async () => {
    mockedApi.register.mockResolvedValue({ accessToken: 'jwt', tokenType: 'Bearer', expiresInSeconds: 60, email: 'new@example.com', displayName: 'New' });
    renderWithStore(<AuthPage />);
    expect(screen.queryByLabelText('Display name')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Create a new account' }));
    await userEvent.type(screen.getByLabelText('Display name'), 'New');
    await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'long-enough-pw');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(mockedApi.register).toHaveBeenCalledWith('new@example.com', 'long-enough-pw', 'New'));
  });
});

import { screen } from '@testing-library/react';
import { renderWithStore, signedInState } from './test/utils';
import App from './App';

jest.mock('./api/client', () => ({
  api: {
    listTasks: jest.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 8 }),
    summary: jest.fn().mockResolvedValue({ todo: 0, inProgress: 0, done: 0, total: 0 }),
  },
}));

describe('App', () => {
  it('shows the sign-in form when signed out', () => {
    renderWithStore(<App />);
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows the dashboard when signed in', async () => {
    renderWithStore(<App />, signedInState);
    expect(await screen.findByText(/No tasks match/)).toBeInTheDocument();
  });
});

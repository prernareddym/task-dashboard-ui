import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import type { Task } from '../api/types';
import { createStore, type rootReducer } from '../store';

export function renderWithStore(ui: ReactElement, preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  const store = createStore(preloadedState);
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Write tests',
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export const signedInState = {
  auth: { token: 't0ken', email: 'ada@example.com', displayName: 'Ada', status: 'idle' as const, error: null },
};

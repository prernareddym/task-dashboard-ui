import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { configureClient } from './api/client';
import { createStore } from './store';
import { logout } from './store/authSlice';
import './styles.css';

const store = createStore();

configureClient({
  getToken: () => store.getState().auth.token,
  onUnauthorized: () => store.dispatch(logout()),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);

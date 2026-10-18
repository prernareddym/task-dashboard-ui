import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { useAppSelector } from './store/hooks';

export default function App() {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <Dashboard /> : <AuthPage />;
}

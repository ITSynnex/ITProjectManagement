import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;

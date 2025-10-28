import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation } from 'wouter';
import { queryClient } from './lib/queryClient';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { CollegesPage } from './pages/CollegesPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { Layout } from './components/Layout';

export default function App() {
  const [location] = useLocation();
  const isLoginPage = location === '/';

  return (
    <QueryClientProvider client={queryClient}>
      {isLoginPage ? (
        <LoginPage />
      ) : (
        <Layout>
          <Switch>
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/users" component={UsersPage} />
            <Route path="/colleges" component={CollegesPage} />
            <Route path="/assignments" component={AssignmentsPage} />
            <Route>404 - Not Found</Route>
          </Switch>
        </Layout>
      )}
    </QueryClientProvider>
  );
}
